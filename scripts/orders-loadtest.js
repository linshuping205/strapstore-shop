/**
 * Orders Load Tester
 * Tests order creation, listing, admin payments listing, and withdrawals.
 * Zero dependencies — uses only Node.js built-in modules.
 *
 * Usage:
 *   node scripts/orders-loadtest.js [BASE_URL] [CONCURRENCY] [DURATION_SEC]
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// ───────────────────────────────────────────────
// Configuration
// ───────────────────────────────────────────────
const BASE_URL = workerData?.baseUrl || (process.argv[2] && process.argv[2].startsWith('http') ? process.argv[2] : 'https://strapstore-shop.vercel.app');
const CONCURRENCY = parseInt(workerData?.concurrency || (process.argv[2] && !process.argv[2].startsWith('http') ? process.argv[2] : process.argv[3]) || 10);
const DURATION_MS = parseInt(workerData?.duration || (process.argv[2] && !process.argv[2].startsWith('http') ? process.argv[3] : process.argv[4]) || 10) * 1000;

const ADMIN_TOKEN = 'admin-secret-token-2024';

// ───────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────
function request(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve) => {
    const start = performance.now();
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'StrapStore-OrdersTester/1.0',
          ...headers,
        },
        timeout: 30000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            latency: performance.now() - start,
            bytes: Buffer.byteLength(data),
            body: data,
            error: null,
          });
        });
      }
    );

    req.on('error', (err) => {
      resolve({ status: 0, latency: performance.now() - start, bytes: 0, body: '', error: err.code || err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, latency: performance.now() - start, bytes: 0, body: '', error: 'TIMEOUT' });
    });

    if (body) req.write(JSON.stringify(body));
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
  const endpoints = {};

  async function workerLoop() {
    while (Date.now() < endAt) {
      // Randomly choose an endpoint
      const r = Math.random();
      let res;

      if (r < 0.3) {
        // GET orders list (public)
        res = await request(`${baseUrl}/api/orders`);
        endpoints['GET /api/orders'] = (endpoints['GET /api/orders'] || 0) + 1;
      } else if (r < 0.5) {
        // GET admin payments (admin)
        res = await request(`${baseUrl}/api/admin/payments`, 'GET', { 'x-admin-auth': ADMIN_TOKEN });
        endpoints['GET /api/admin/payments'] = (endpoints['GET /api/admin/payments'] || 0) + 1;
      } else if (r < 0.7) {
        // POST create order (rate limited 5/min) — use real product ID and trailing slash
        res = await request(`${baseUrl}/api/orders/`, 'POST', { 'Content-Type': 'application/json' }, {
          email: 'test@example.com',
          name: 'Test User',
          address: '123 Test St',
          city: 'New York',
          country: 'US',
          postalCode: '10001',
          total: 99.99,
          items: [{ productId: 'cmqzes4f20007es6gcfz0egh9', quantity: 1, price: 99.99 }],
          stripeSessionId: null,
        });
        endpoints['POST /api/orders'] = (endpoints['POST /api/orders'] || 0) + 1;
      } else if (r < 0.85) {
        // GET orders by sessionId
        res = await request(`${baseUrl}/api/orders?sessionId=cs_test_12345`);
        endpoints['GET /api/orders?sessionId'] = (endpoints['GET /api/orders?sessionId'] || 0) + 1;
      } else {
        // PATCH admin update order (admin)
        res = await request(`${baseUrl}/api/orders`, 'PATCH', { 'Content-Type': 'application/json', 'x-admin-auth': ADMIN_TOKEN }, { id: 'test-id', status: 'PAID' });
        endpoints['PATCH /api/orders'] = (endpoints['PATCH /api/orders'] || 0) + 1;
      }

      completed++;
      latencies.push(res.latency);
      if (res.error) {
        errors[res.error] = (errors[res.error] || 0) + 1;
      } else {
        statusCodes[res.status] = (statusCodes[res.status] || 0) + 1;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => workerLoop());
  Promise.all(workers).then(() => {
    parentPort.postMessage({ completed, latencies, statusCodes, errors, endpoints });
  });
  return;
}

// ───────────────────────────────────────────────
// Main thread orchestrator
// ───────────────────────────────────────────────
async function run() {
  console.log(`\n🚀  Orders Load Test`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Concurrency: ${CONCURRENCY} workers`);
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
  const { completed, latencies, statusCodes, errors, endpoints } = result;

  const sorted = latencies.slice().sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
  const avg = sorted.length > 0 ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;
  const max = sorted[sorted.length - 1] || 0;
  const min = sorted[0] || 0;

  const errorCount = Object.values(errors).reduce((a, b) => a + b, 0);
  const successCount = completed - errorCount;

  console.log('═'.repeat(64));
  console.log('  📊  SUMMARY');
  console.log('═'.repeat(64));
  console.log(`  Total Requests:     ${completed.toLocaleString()}`);
  console.log(`  Duration:           ${elapsed.toFixed(2)}s`);
  console.log(`  RPS:                ${(completed / elapsed).toFixed(1)}`);
  console.log(`  Success:            ${successCount.toLocaleString()} (${successCount > 0 ? ((successCount / completed) * 100).toFixed(1) : 0}%)`);
  console.log(`  Errors:             ${errorCount.toLocaleString()} (${errorCount > 0 ? ((errorCount / completed) * 100).toFixed(1) : 0}%)`);
  console.log('─'.repeat(64));
  console.log('  ⏱️  LATENCY (ms)');
  console.log('─'.repeat(64));
  console.log(`    Min:    ${min.toFixed(1)}`);
  console.log(`    Avg:    ${avg.toFixed(1)}`);
  console.log(`    P50:    ${p50.toFixed(1)}`);
  console.log(`    P95:    ${p95.toFixed(1)}`);
  console.log(`    P99:    ${p99.toFixed(1)}`);
  console.log(`    Max:    ${max.toFixed(1)}`);
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
  console.log('═'.repeat(64));

  console.log('\n📋  VERDICT');
  console.log('─'.repeat(64));
  if (errorCount / completed > 0.1) {
    console.log('   🔴 CRITICAL: Error rate > 10%. Orders API is failing under load.');
  } else if (errorCount / completed > 0.05) {
    console.log('   🟠 WARNING: Error rate > 5%. Degradation detected.');
  } else if (errorCount / completed > 0.01) {
    console.log('   🟡 CAUTION: Error rate > 1%. Monitor closely.');
  } else {
    console.log('   ✅ Error rate is healthy (< 1%).');
  }

  if (p95 > 5000) {
    console.log('   🔴 CRITICAL: P95 latency > 5s. Orders API struggling.');
  } else if (p95 > 3000) {
    console.log('   🟠 WARNING: P95 latency > 3s. Significant impact.');
  } else if (p95 > 1000) {
    console.log('   🟡 CAUTION: P95 latency > 1s. Consider adding caching.');
  } else if (p95 > 500) {
    console.log('   ⚡ GOOD: P95 latency < 500ms.');
  } else {
    console.log('   🚀 EXCELLENT: P95 latency < 500ms.');
  }
  console.log('═'.repeat(64));
  console.log('');
}

run().catch((e) => {
  console.error('Load test failed:', e);
  process.exit(1);
});
