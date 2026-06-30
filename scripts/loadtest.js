/**
 * Advanced HTTP Load Tester for StrapStore
 * Zero dependencies — uses only Node.js built-in modules.
 *
 * Usage:
 *   node scripts/loadtest.js [options]
 *
 * Options (env vars):
 *   BASE_URL      Target host (default: https://strapstore-shop.vercel.app)
 *   CONCURRENCY   Concurrent requests (default: 20)
 *   DURATION      Test duration in seconds (default: 10)
 *   SCENARIO      'mixed' | 'static' | 'api' | 'write' (default: mixed)
 *
 * Examples:
 *   node scripts/loadtest.js
 *   BASE_URL=https://localhost:3000 CONCURRENCY=50 DURATION=30 node scripts/loadtest.js
 *   SCENARIO=api CONCURRENCY=100 DURATION=60 node scripts/loadtest.js
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const os = require('os');

// ───────────────────────────────────────────────
// Configuration
// ───────────────────────────────────────────────
const BASE_URL = workerData?.baseUrl || process.env.BASE_URL || 'https://strapstore-shop.vercel.app';
const CONCURRENCY = parseInt(workerData?.concurrency || process.env.CONCURRENCY || '20');
const DURATION_MS = parseInt(workerData?.duration || process.env.DURATION || '10') * 1000;
const SCENARIO = workerData?.scenario || process.env.SCENARIO || 'mixed';

// Test slugs (will be discovered at runtime if API responds)
let PRODUCT_SLUGS = ['leather-classic-22mm'];
let BLOG_SLUGS = ['choosing-the-right-leather-strap'];

const SCENARIOS = {
  mixed: [
    { weight: 25, method: 'GET', path: '/' },
    { weight: 20, method: 'GET', path: '/products/' },
    { weight: 15, method: 'GET', path: '/blog/' },
    { weight: 10, method: 'GET', path: () => `/products/${pick(PRODUCT_SLUGS)}/` },
    { weight: 10, method: 'GET', path: () => `/blog/${pick(BLOG_SLUGS)}/` },
    { weight: 8, method: 'GET', path: '/api/products' },
    { weight: 5, method: 'GET', path: '/api/posts?page=1&limit=9' },
    { weight: 3, method: 'GET', path: '/cart/' },
    { weight: 2, method: 'GET', path: '/about/' },
    { weight: 2, method: 'POST', path: '/api/posts/placeholder/view', body: {} },
  ],
  static: [
    { weight: 30, method: 'GET', path: '/' },
    { weight: 25, method: 'GET', path: '/products/' },
    { weight: 20, method: 'GET', path: '/blog/' },
    { weight: 15, method: 'GET', path: () => `/products/${pick(PRODUCT_SLUGS)}/` },
    { weight: 10, method: 'GET', path: () => `/blog/${pick(BLOG_SLUGS)}/` },
  ],
  api: [
    { weight: 30, method: 'GET', path: '/api/products' },
    { weight: 25, method: 'GET', path: '/api/posts?page=1&limit=9' },
    { weight: 20, method: 'GET', path: '/api/posts?page=2&limit=9' },
    { weight: 15, method: 'GET', path: () => `/api/products/${pick(PRODUCT_SLUGS)}/reviews?page=1&limit=10` },
    { weight: 10, method: 'GET', path: '/api/settings' },
  ],
  write: [
    { weight: 50, method: 'POST', path: '/api/posts/placeholder/view', body: {} },
    { weight: 30, method: 'POST', path: '/api/posts/placeholder/like', body: {} },
    { weight: 20, method: 'POST', path: '/api/products', body: { name: 'Test', slug: () => `test-${Date.now()}`, price: 99, stock: 10 } },
  ],
};

// ───────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function resolvePath(path) {
  if (typeof path === 'function') return path();
  return path;
}

function resolveBody(body) {
  if (!body) return undefined;
  const resolved = {};
  for (const [k, v] of Object.entries(body)) {
    resolved[k] = typeof v === 'function' ? v() : v;
  }
  return JSON.stringify(resolved);
}

function request(url, method = 'GET', body = undefined) {
  return new Promise((resolve) => {
    const start = performance.now();
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;

    const headers = {
      'Accept': 'text/html,application/json',
      'User-Agent': 'StrapStore-LoadTester/2.0',
    };
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const req = client.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method,
        headers,
        timeout: 15000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            latency: performance.now() - start,
            bytes: Buffer.byteLength(data),
            error: null,
            ttfb: res.headers['x-vercel-cache'] || res.headers['cf-cache-status'] || 'unknown',
          });
        });
      }
    );

    req.on('error', (err) => {
      resolve({ status: 0, latency: performance.now() - start, bytes: 0, error: err.code || err.message, ttfb: 'error' });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, latency: performance.now() - start, bytes: 0, error: 'TIMEOUT', ttfb: 'timeout' });
    });

    if (body) req.write(body);
    req.end();
  });
}

async function discoverSlugs() {
  try {
    const res = await request(`${BASE_URL}/api/products`);
    if (res.status === 200) {
      const products = JSON.parse(Buffer.from(res.bytes).toString());
      if (Array.isArray(products) && products.length > 0) {
        PRODUCT_SLUGS = products.slice(0, 5).map((p) => p.slug || 'leather-classic-22mm');
      }
    }
  } catch (e) {
    // ignore discovery errors
  }
  try {
    const res = await request(`${BASE_URL}/api/posts?page=1&limit=5`);
    if (res.status === 200) {
      const data = JSON.parse(Buffer.from(res.bytes).toString());
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        BLOG_SLUGS = data.data.slice(0, 5).map((p) => p.slug || 'choosing-the-right-leather-strap');
      }
    }
  } catch (e) {
    // ignore discovery errors
  }
}

// ───────────────────────────────────────────────
// Worker thread logic
// ───────────────────────────────────────────────
if (!isMainThread) {
  const { baseUrl, duration, concurrency, scenario } = workerData;
  const endAt = Date.now() + duration;
  let completed = 0;
  const latencies = [];
  const statusCodes = {};
  const errors = {};
  const endpoints = {};
  let totalBytes = 0;
  const ttfbStatuses = {};

  const paths = SCENARIOS[scenario] || SCENARIOS.mixed;

  async function workerLoop() {
    while (Date.now() < endAt) {
      const item = weightedPick(paths);
      const path = resolvePath(item.path);
      const body = item.body ? resolveBody(item.body) : undefined;
      const url = baseUrl + path;
      const res = await request(url, item.method, body);
      completed++;
      latencies.push(res.latency);
      totalBytes += res.bytes;
      ttfbStatuses[res.ttfb] = (ttfbStatuses[res.ttfb] || 0) + 1;
      if (res.error) {
        errors[res.error] = (errors[res.error] || 0) + 1;
      } else {
        statusCodes[res.status] = (statusCodes[res.status] || 0) + 1;
      }
      endpoints[`${item.method} ${path.split('?')[0]}`] = (endpoints[`${item.method} ${path.split('?')[0]}`] || 0) + 1;
    }
  }

  const workers = Array.from({ length: concurrency }, () => workerLoop());
  Promise.all(workers).then(() => {
    parentPort.postMessage({ completed, latencies, statusCodes, errors, totalBytes, endpoints, ttfbStatuses });
  });
  return;
}

// ───────────────────────────────────────────────
// Main thread orchestrator
// ───────────────────────────────────────────────
async function run() {
  // Discover real slugs
  await discoverSlugs();

  console.log(`\n🚀  StrapStore Load Test v2.0`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Scenario: ${SCENARIO}`);
  console.log(`   Concurrency: ${CONCURRENCY} concurrent workers`);
  console.log(`   Duration: ${DURATION_MS / 1000}s`);
  console.log(`   CPU cores: ${os.cpus().length}`);
  console.log(`   Product slugs: ${PRODUCT_SLUGS.join(', ')}`);
  console.log(`   Blog slugs: ${BLOG_SLUGS.join(', ')}\n`);

  const t0 = performance.now();
  const worker = new Worker(__filename, {
    workerData: { baseUrl: BASE_URL, duration: DURATION_MS, concurrency: CONCURRENCY, scenario: SCENARIO },
  });

  const result = await new Promise((resolve) => {
    worker.on('message', resolve);
  });
  worker.terminate();

  const elapsed = (performance.now() - t0) / 1000;
  const { completed, latencies, statusCodes, errors, totalBytes, endpoints, ttfbStatuses } = result;

  // Percentiles
  const sorted = latencies.slice().sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const p75 = sorted[Math.floor(sorted.length * 0.75)] || 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
  const avg = sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;
  const max = sorted[sorted.length - 1] || 0;
  const min = sorted[0] || 0;
  const stdDev = sorted.length > 0
    ? Math.sqrt(sorted.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / sorted.length)
    : 0;

  const errorCount = Object.values(errors).reduce((a, b) => a + b, 0);
  const successCount = completed - errorCount;
  const throughputMbps = (totalBytes * 8 / 1024 / 1024 / elapsed).toFixed(2);

  console.log('═'.repeat(64));
  console.log('  📊  SUMMARY');
  console.log('═'.repeat(64));
  console.log(`  Total Requests:     ${completed.toLocaleString()}`);
  console.log(`  Duration:           ${elapsed.toFixed(2)}s`);
  console.log(`  RPS:                ${(completed / elapsed).toFixed(1)}`);
  console.log(`  Throughput:         ${throughputMbps} Mbps`);
  console.log(`  Success:            ${successCount.toLocaleString()} (${successCount > 0 ? ((successCount / completed) * 100).toFixed(1) : 0}%)`);
  console.log(`  Errors:             ${errorCount.toLocaleString()} (${errorCount > 0 ? ((errorCount / completed) * 100).toFixed(1) : 0}%)`);
  console.log(`  Data Transferred:   ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log('─'.repeat(64));
  console.log('  ⏱️  LATENCY (ms)');
  console.log('─'.repeat(64));
  console.log(`    Min:    ${min.toFixed(1)}`);
  console.log(`    Avg:    ${avg.toFixed(1)}`);
  console.log(`    P50:    ${p50.toFixed(1)}`);
  console.log(`    P75:    ${p75.toFixed(1)}`);
  console.log(`    P95:    ${p95.toFixed(1)}`);
  console.log(`    P99:    ${p99.toFixed(1)}`);
  console.log(`    Max:    ${max.toFixed(1)}`);
  console.log(`    StdDev: ${stdDev.toFixed(1)}`);
  console.log('─'.repeat(64));
  console.log('  📡 STATUS CODES');
  console.log('─'.repeat(64));
  Object.entries(statusCodes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([code, count]) => {
      const pct = ((count / completed) * 100).toFixed(1);
      console.log(`    ${code}: ${count.toString().padStart(6)} (${pct}%)`);
    });
  if (Object.keys(errors).length > 0) {
    console.log('─'.repeat(64));
    console.log('  ⚠️  ERRORS');
    console.log('─'.repeat(64));
    Object.entries(errors)
      .sort((a, b) => b[1] - a[1])
      .forEach(([err, count]) => {
        const pct = ((count / completed) * 100).toFixed(1);
        console.log(`    ${err}: ${count.toString().padStart(6)} (${pct}%)`);
      });
  }
  console.log('─'.repeat(64));
  console.log('  🎯 ENDPOINT DISTRIBUTION');
  console.log('─'.repeat(64));
  Object.entries(endpoints)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ep, count]) => {
      const pct = ((count / completed) * 100).toFixed(1);
      console.log(`    ${count.toString().padStart(6)} (${pct}%)  ${ep}`);
    });
  if (Object.keys(ttfbStatuses).length > 0) {
    console.log('─'.repeat(64));
    console.log('  🧪 CACHE STATUS (X-Vercel-Cache / CF-Cache-Status)');
    console.log('─'.repeat(64));
    Object.entries(ttfbStatuses)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        const pct = ((count / completed) * 100).toFixed(1);
        console.log(`    ${status}: ${count.toString().padStart(6)} (${pct}%)`);
      });
  }
  console.log('═'.repeat(64));

  // Verdict
  console.log('\n📋  VERDICT');
  console.log('─'.repeat(64));
  if (errorCount / completed > 0.1) {
    console.log('   🔴 CRITICAL: Error rate > 10%. Site is failing under load.');
  } else if (errorCount / completed > 0.05) {
    console.log('   🟠 WARNING: Error rate > 5%. Performance degradation detected.');
  } else if (errorCount / completed > 0.01) {
    console.log('   🟡 CAUTION: Error rate > 1%. Monitor closely.');
  } else {
    console.log('   ✅ Error rate is healthy (< 1%).');
  }

  if (p95 > 5000) {
    console.log('   🔴 CRITICAL: P95 latency > 5s. Users will abandon the site.');
  } else if (p95 > 3000) {
    console.log('   🟠 WARNING: P95 latency > 3s. Significant UX impact.');
  } else if (p95 > 1000) {
    console.log('   🟡 CAUTION: P95 latency > 1s. Consider more caching.');
  } else if (p95 > 500) {
    console.log('   ⚡ GOOD: P95 latency < 500ms. Acceptable for most users.');
  } else {
    console.log('   🚀 EXCELLENT: P95 latency < 500ms. Snappy experience!');
  }

  if (avg > 0 && stdDev / avg > 1.5) {
    console.log('   ⚠️  High latency variance (stdDev/avg > 1.5). Check cold starts.');
  }

  const cacheHits = (ttfbStatuses['HIT'] || 0) + (ttfbStatuses['hit'] || 0) + (ttfbStatuses['STALE'] || 0);
  if (completed > 0) {
    const cacheRate = (cacheHits / completed) * 100;
    if (cacheRate > 50) {
      console.log(`   🎯 Cache hit rate: ${cacheRate.toFixed(1)}%. ISR/CDN is working well.`);
    } else if (cacheRate > 20) {
      console.log(`   🎯 Cache hit rate: ${cacheRate.toFixed(1)}%. Some caching benefit.`);
    } else {
      console.log(`   🎯 Cache hit rate: ${cacheRate.toFixed(1)}%. Cache not warming up yet.`);
    }
  }
  console.log('═'.repeat(64));
  console.log('');
}

run().catch((e) => {
  console.error('Load test failed:', e);
  process.exit(1);
});
