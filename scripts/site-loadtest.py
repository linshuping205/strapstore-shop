#!/usr/bin/env python3
"""StrapStore Full-Site Serial Load Tester
Tests all endpoints sequentially to avoid connection pool issues.
"""

import urllib.request
import urllib.error
import json
import time
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 else 'https://strapstore-shop.vercel.app'
DURATION = int(sys.argv[2]) if len(sys.argv) > 2 else 30
CONCURRENCY = int(sys.argv[3]) if len(sys.argv) > 3 else 1

ENDPOINTS = [
    ('GET', '/', None),
    ('GET', '/products/', None),
    ('GET', '/blog/', None),
    ('GET', '/about/', None),
    ('GET', '/contact/', None),
    ('GET', '/products/italian-buttero-1782748979137-1/', None),
    ('GET', '/blog/choosing-the-right-leather-strap/', None),
    ('GET', '/api/products', None),
    ('GET', '/api/posts?page=1&limit=9', None),
    ('GET', '/api/settings', None),
    ('GET', '/api/orders', None),
]

def test(method, path, body=None):
    url = BASE + path
    t0 = time.time()
    try:
        data = json.dumps(body).encode() if body else None
        req = urllib.request.Request(url, data=data, method=method, headers={
            'Accept': 'text/html,application/json',
            'User-Agent': 'StrapStore-Python-Tester/1.0'
        })
        resp = urllib.request.urlopen(req, timeout=30)
        content = resp.read()
        elapsed = (time.time() - t0) * 1000
        return {
            'status': resp.status,
            'ms': round(elapsed, 1),
            'bytes': len(content),
            'cache': resp.headers.get('x-vercel-cache') or resp.headers.get('cf-cache-status') or 'unknown',
            'error': None
        }
    except urllib.error.HTTPError as e:
        elapsed = (time.time() - t0) * 1000
        return {'status': e.code, 'ms': round(elapsed, 1), 'bytes': 0, 'cache': 'error', 'error': f'HTTP {e.code}'}
    except Exception as e:
        elapsed = (time.time() - t0) * 1000
        return {'status': 0, 'ms': round(elapsed, 1), 'bytes': 0, 'cache': 'error', 'error': type(e).__name__}

print(f'\n[StrapStore Full-Site Serial Load Test]')
print(f'   Target: {BASE}')
print(f'   Duration: {DURATION}s')
print(f'   Concurrency: {CONCURRENCY} (sequential per worker)\n')

results = {ep: [] for ep in ENDPOINTS}
start = time.time()
request_count = 0
success_count = 0
error_count = 0

while time.time() - start < DURATION:
    for method, path, body in ENDPOINTS:
        if time.time() - start >= DURATION:
            break
        result = test(method, path, body)
        results[(method, path, body)].append(result)
        request_count += 1
        if result['error']:
            error_count += 1
        else:
            success_count += 1

elapsed = time.time() - start

print('=' * 64)
print('  SUMMARY')
print('=' * 64)
print(f'  Total Requests:     {request_count}')
print(f'  Duration:           {elapsed:.1f}s')
print(f'  RPS:                {request_count / elapsed:.1f}')
print(f'  Success:            {success_count} ({success_count / request_count * 100:.1f}%)')
print(f'  Errors:             {error_count} ({error_count / request_count * 100:.1f}%)')
print('-' * 64)
print('  PER-ENDPOINT LATENCY (ms)')
print('-' * 64)
print(f'  {"Method":<6} {"Endpoint":<45} {"Count":>6} {"Min":>8} {"Avg":>8} {"P95":>8} {"Max":>8} {"Cache Hit%":>10}')
print('-' * 64)

for (method, path, body), res in results.items():
    if not res:
        continue
    latencies = [r['ms'] for r in res if not r['error']]
    errors = [r for r in res if r['error']]
    if not latencies:
        print(f'  {method:<6} {path:<45} {len(res):>6} ALL ERRORS')
        continue
    latencies.sort()
    p95 = latencies[int(len(latencies) * 0.95)] if len(latencies) > 1 else latencies[0]
    cache_hits = sum(1 for r in res if r['cache'] in ('HIT', 'hit', 'STALE'))
    cache_rate = cache_hits / len(res) * 100
    print(f'  {method:<6} {path:<45} {len(res):>6} {min(latencies):>8.0f} {sum(latencies)/len(latencies):>8.0f} {p95:>8.0f} {max(latencies):>8.0f} {cache_rate:>9.1f}%')
    if errors:
        err_summary = {}
        for e in errors:
            err_summary[e['error']] = err_summary.get(e['error'], 0) + 1
        for err, count in err_summary.items():
            print(f'    ! {err}: {count}x')

print('=' * 64)
print('\nVERDICT')
print('-' * 64)

all_latencies = [r['ms'] for rs in results.values() for r in rs if not r['error']]
if all_latencies:
    all_latencies.sort()
    p95 = all_latencies[int(len(all_latencies) * 0.95)]
    if p95 > 5000:
        print('   [CRITICAL] P95 latency > 5s.')
    elif p95 > 3000:
        print('   [WARNING] P95 latency > 3s.')
    elif p95 > 1000:
        print('   [CAUTION] P95 latency > 1s.')
    elif p95 > 500:
        print('   [GOOD] P95 latency < 500ms.')
    else:
        print('   [EXCELLENT] P95 latency < 500ms.')

if error_count / request_count > 0.1:
    print('   [CRITICAL] Error rate > 10%.')
elif error_count / request_count > 0.05:
    print('   [WARNING] Error rate > 5%.')
elif error_count / request_count > 0.01:
    print('   [CAUTION] Error rate > 1%.')
else:
    print('   [OK] Error rate healthy (< 1%).')

print('=' * 64)
print('')
