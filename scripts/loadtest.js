/**
 * Lightweight HTTP Load Tester
 * Zero dependencies — uses only Node.js built-in modules.
 *
 * Usage:
 *   node scripts/loadtest.js
 *
 * Adjust BASE_URL, CONCURRENCY, DURATION, and PATHS below as needed.
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// ───────────────────────────────────────────────
// Configuration
// ───────────────────────────────────────────────
const BASE_URL = workerData?.baseUrl || 'https://strapstore-shop.vercel.app';
const CONCURRENCY = workerData?.concurrency || 20;   // concurrent requests
const DURATION_MS = workerData?.duration || 10000;   // test duration in ms

const PATHS = [
  '/',                               // Home
  '/products/',                      // Product listing
  '/blog/',                          // Blog listing
  '/products/leather-classic-22mm/', // Product detail (replace with real slug)
  '/blog/choosing-the-right-leather-strap/', // Blog detail (replace with real slug)
  '/api/products',                   // API endpoint
];

// ───────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────
function request(url) {
  return new Promise((resolve) => {
    const start = performance.now();
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/json',
          'User-Agent': 'StrapStore-LoadTester/1.0',
        },
        timeout: 15000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            latency: performance.now() - start,
            bytes: Buffer.byteLength(body),
            error: null,
          });
        });
      }
    );

    req.on('error', (err) => {
      resolve({ status: 0, latency: performance.now() - start, bytes: 0, error: err.code || err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, latency: performance.now() - start, bytes: 0, error: 'TIMEOUT' });
    });
    req.end();
  });
}

// ───────────────────────────────────────────────
// Worker thread logic
// ───────────────────────────────────────────────
if (!isMainThread) {
  const { baseUrl, duration, concurrency } = workerData;
  const endAt = Date.now() + duration;
  let completed = 0;
  const latencies = [];
  const statusCodes = {};
  const errors = {};
  let totalBytes = 0;

  async function workerLoop() {
    while (Date.now() < endAt) {
      const path = PATHS[Math.floor(Math.random() * PATHS.length)];
      const res = await request(baseUrl + path);
      completed++;
      latencies.push(res.latency);
      totalBytes += res.bytes;
      if (res.error) {
        errors[res.error] = (errors[res.error] || 0) + 1;
      } else {
        statusCodes[res.status] = (statusCodes[res.status] || 0) + 1;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => workerLoop());
  Promise.all(workers).then(() => {
    parentPort.postMessage({ completed, latencies, statusCodes, errors, totalBytes });
  });
  return;
}

// ───────────────────────────────────────────────
// Main thread orchestrator
// ───────────────────────────────────────────────
async function run() {
  console.log(`\n🚀  StrapStore Load Test`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Concurrency: ${CONCURRENCY} concurrent requests`);
  console.log(`   Duration: ${DURATION_MS / 1000}s\n`);

  const t0 = performance.now();
  const worker = new Worker(__filename, {
    workerData: { baseUrl: BASE_URL, duration: DURATION_MS, concurrency: CONCURRENCY },
  });

  const result = await new Promise((resolve) => {
    worker.on('message', resolve);
  });
  worker.terminate();

  const elapsed = (performance.now() - t0) / 1000;
  const { completed, latencies, statusCodes, errors, totalBytes } = result;

  // Percentiles
  const sorted = latencies.slice().sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const max = sorted[sorted.length - 1];
  const min = sorted[0];

  const errorCount = Object.values(errors).reduce((a, b) => a + b, 0);
  const successCount = completed - errorCount;

  console.log('─'.repeat(60));
  console.log(`  Total Requests:     ${completed}`);
  console.log(`  Duration:           ${elapsed.toFixed(2)}s`);
  console.log(`  RPS:                ${(completed / elapsed).toFixed(1)}`);
  console.log(`  Success:            ${successCount} (${((successCount / completed) * 100).toFixed(1)}%)`);
  console.log(`  Errors:             ${errorCount} (${((errorCount / completed) * 100).toFixed(1)}%)`);
  console.log(`  Data Transferred:   ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log('─'.repeat(60));
  console.log(`  Latency (ms):`);
  console.log(`    Min:  ${min.toFixed(1)}`);
  console.log(`    Avg:  ${avg.toFixed(1)}`);
  console.log(`    P50:  ${p50.toFixed(1)}`);
  console.log(`    P95:  ${p95.toFixed(1)}`);
  console.log(`    P99:  ${p99.toFixed(1)}`);
  console.log(`    Max:  ${max.toFixed(1)}`);
  console.log('─'.repeat(60));
  console.log('  Status Codes:');
  Object.entries(statusCodes).forEach(([code, count]) => {
    console.log(`    ${code}: ${count}`);
  });
  if (Object.keys(errors).length > 0) {
    console.log('  Errors:');
    Object.entries(errors).forEach(([err, count]) => {
      console.log(`    ${err}: ${count}`);
    });
  }
  console.log('─'.repeat(60));

  // Verdict
  console.log('\n📊  Verdict:');
  if (errorCount / completed > 0.05) {
    console.log('   ⚠️  High error rate (>5%). Site may be struggling under load.');
  } else if (p95 > 3000) {
    console.log('   ⚠️  P95 latency > 3s. Consider adding caching / ISR.');
  } else if (p95 > 1000) {
    console.log('   ⚠️  P95 latency > 1s. Performance is acceptable but could be improved.');
  } else {
    console.log('   ✅ Latency looks good under this load.');
  }
  console.log('');
}

run().catch((e) => {
  console.error('Load test failed:', e);
  process.exit(1);
});
