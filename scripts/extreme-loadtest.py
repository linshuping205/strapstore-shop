import concurrent.futures
import urllib.request
import urllib.error
import json
import time
import sys

BASE = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith('http') else 'https://strapstore-shop.vercel.app'
CONCURRENCY = int(sys.argv[2]) if len(sys.argv) > 2 else 15
REQUESTS_PER_WORKER = int(sys.argv[3]) if len(sys.argv) > 3 else 3

ADMIN = 'admin-secret-token-2024'

# Mix of read and write endpoints
ENDPOINTS = [
    ('GET', BASE + '/', None, {}, 'Homepage'),
    ('GET', BASE + '/products/', None, {}, 'Products'),
    ('GET', BASE + '/api/products', None, {}, 'API Products'),
    ('GET', BASE + '/api/settings', None, {}, 'API Settings'),
    ('GET', BASE + '/blog/', None, {}, 'Blog'),
    ('GET', BASE + '/api/posts?page=1&limit=9', None, {}, 'API Posts'),
]

def fetch(url, method='GET', body=None, headers=None, label=''):
    headers = headers or {}
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        t0 = time.time()
        resp = urllib.request.urlopen(req, timeout=15)
        elapsed = (time.time() - t0) * 1000
        content = resp.read()
        return {
            'status': resp.status,
            'ms': elapsed,
            'bytes': len(content),
            'error': None,
            'cache': resp.headers.get('x-vercel-cache', 'unknown'),
            'label': label,
        }
    except urllib.error.HTTPError as e:
        try:
            elapsed = (time.time() - t0) * 1000
        except:
            elapsed = 0
        return {'status': e.code, 'ms': elapsed, 'bytes': 0, 'error': None, 'cache': 'error', 'label': label}
    except Exception as e:
        return {'status': 0, 'ms': 0, 'bytes': 0, 'error': type(e).__name__ + ': ' + str(e)[:50], 'cache': 'error', 'label': label}

def worker_task(worker_id):
    results = []
    for i in range(REQUESTS_PER_WORKER):
        for method, url, body, headers, label in ENDPOINTS:
            r = fetch(url, method, body, headers, label)
            r['worker'] = worker_id
            r['req_num'] = i
            results.append(r)
    return results

def main():
    print()
    print('=' * 72)
    print('STRAPSTORE EXTREME CONCURRENT LOAD TEST')
    print('=' * 72)
    print(f'  Target:    {BASE}')
    print(f'  Workers:   {CONCURRENCY}')
    print(f'  Requests:  {CONCURRENCY * REQUESTS_PER_WORKER * len(ENDPOINTS)} total')
    print(f'  Endpoints: {len(ENDPOINTS)}')
    print()
    print('Starting...')
    print()

    start = time.time()
    all_results = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        futures = [executor.submit(worker_task, i) for i in range(CONCURRENCY)]
        for future in concurrent.futures.as_completed(futures):
            try:
                results = future.result()
                all_results.extend(results)
            except Exception as e:
                print(f'  Worker failed: {e}')

    elapsed = time.time() - start

    total = len(all_results)
    if total == 0:
        print('No requests completed!')
        return

    errors = [r for r in all_results if r['error']]
    successes = [r for r in all_results if r['status'] in (200, 201, 301, 302, 307, 308)]
    client_errors = [r for r in all_results if r['status'] and 400 <= r['status'] < 500]
    server_errors = [r for r in all_results if r['status'] and 500 <= r['status'] < 600]
    timeouts = [r for r in all_results if r['error'] and 'timeout' in r['error'].lower()]
    
    latencies = [r['ms'] for r in all_results if r['ms'] > 0]
    latencies.sort()

    by_label = {}
    for r in all_results:
        label = r['label']
        if label not in by_label:
            by_label[label] = []
        by_label[label].append(r)

    print()
    print('=' * 72)
    print('RESULTS')
    print('=' * 72)
    print(f'  Total Requests:     {total}')
    print(f'  Duration:           {elapsed:.1f}s')
    print(f'  RPS:                {total / elapsed:.1f}')
    print(f'  Success (2xx):      {len(successes)} ({len(successes)/total*100:.1f}%)')
    print(f'  Client Error (4xx): {len(client_errors)} ({len(client_errors)/total*100:.1f}%)')
    print(f'  Server Error (5xx): {len(server_errors)} ({len(server_errors)/total*100:.1f}%)')
    print(f'  Timeouts:           {len(timeouts)} ({len(timeouts)/total*100:.1f}%)')
    print(f'  Other Errors:       {len(errors) - len(timeouts)} ({(len(errors)-len(timeouts))/total*100:.1f}%)')
    print()

    if latencies:
        p50 = latencies[int(len(latencies) * 0.5)]
        p95 = latencies[int(len(latencies) * 0.95)] if len(latencies) > 1 else latencies[0]
        p99 = latencies[int(len(latencies) * 0.99)] if len(latencies) > 1 else latencies[0]
        print('  Latency Distribution')
        print('  ' + '-' * 50)
        print(f'    Min:     {min(latencies):.1f}ms')
        print(f'    Avg:     {sum(latencies)/len(latencies):.1f}ms')
        print(f'    P50:     {p50:.1f}ms')
        print(f'    P95:     {p95:.1f}ms')
        print(f'    P99:     {p99:.1f}ms')
        print(f'    Max:     {max(latencies):.1f}ms')
        print()

    print('  Per-Endpoint Breakdown')
    print('  ' + '-' * 50)
    for label, results in sorted(by_label.items(), key=lambda x: x[0]):
        ep_latencies = [r['ms'] for r in results if r['ms'] > 0]
        ep_errors = [r for r in results if r['error']]
        ep_success = [r for r in results if r['status'] in (200, 201)]
        ep_5xx = [r for r in results if r['status'] and 500 <= r['status'] < 600]
        
        avg = sum(ep_latencies) / len(ep_latencies) if ep_latencies else 0
        p95 = sorted(ep_latencies)[int(len(ep_latencies) * 0.95)] if len(ep_latencies) > 1 else (ep_latencies[0] if ep_latencies else 0)
        
        if len(ep_errors) + len(ep_5xx) == 0:
            status = 'OK'
        elif len(ep_errors) + len(ep_5xx) < len(results) * 0.05:
            status = 'DEGRADED'
        else:
            status = 'FAILING'
        
        print(f'    {label:<20} {status:<10} {len(results):>3} req  avg={avg:>7.1f}ms p95={p95:>7.1f}ms  errs={len(ep_errors)+len(ep_5xx):>2}')

    print()
    print('  Verdict')
    print('  ' + '-' * 50)
    error_rate = (len(errors) + len(server_errors)) / total
    if error_rate == 0:
        print('    ALL PASS - Zero errors under extreme concurrent load')
    elif error_rate < 0.01:
        print('    GOOD - < 1% error rate under extreme load')
    elif error_rate < 0.05:
        print('    WARNING - 1-5% error rate, some degradation')
    else:
        print('    CRITICAL - > 5% error rate, significant failures')

    if latencies and max(latencies) > 10000:
        print('    CRITICAL - Some requests > 10s (timeouts)')
    elif latencies and p95 > 5000:
        print('    WARNING - P95 > 5s, performance degraded')
    elif latencies and p95 > 2000:
        print('    CAUTION - P95 > 2s, monitor closely')
    else:
        print('    GOOD - Latency acceptable for this load level')

    print('=' * 72)
    print()

if __name__ == '__main__':
    main()
