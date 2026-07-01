import concurrent.futures
import urllib.request
import urllib.error
import json
import time
import sys

BASE = 'https://strapstore-shop.vercel.app'
ADMIN = 'admin-secret-token-2024'

def fetch(url, method='GET', body=None, headers=None, label='', timeout=15):
    headers = headers or {}
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        t0 = time.time()
        resp = urllib.request.urlopen(req, timeout=timeout)
        elapsed = (time.time() - t0) * 1000
        return {
            'status': resp.status,
            'ms': elapsed,
            'error': None,
            'label': label,
        }
    except urllib.error.HTTPError as e:
        try:
            elapsed = (time.time() - t0) * 1000
        except:
            elapsed = 0
        return {'status': e.code, 'ms': elapsed, 'error': None, 'label': label}
    except Exception as e:
        return {'status': 0, 'ms': 0, 'error': type(e).__name__ + ': ' + str(e)[:50], 'label': label}

def test_coupon_validate(worker_id):
    """Concurrent coupon validation reads"""
    results = []
    for i in range(5):
        r = fetch(BASE + '/api/coupons/validate', 'POST',
            {'Content-Type': 'application/json'},
            {'code': 'SAVE20', 'total': 100 + i},
            f'Coupon-Validate-W{worker_id}')
        results.append(r)
    return results

def test_settings_read(worker_id):
    """Concurrent settings reads"""
    results = []
    for i in range(5):
        r = fetch(BASE + '/api/settings', 'GET', label=f'Settings-Read-W{worker_id}')
        results.append(r)
    return results

def test_products_read(worker_id):
    """Concurrent products API reads"""
    results = []
    for i in range(5):
        r = fetch(BASE + '/api/products', 'GET', label=f'Products-API-W{worker_id}')
        results.append(r)
    return results

def test_admin_payments(worker_id):
    """Concurrent admin payments reads (authenticated)"""
    results = []
    for i in range(3):
        r = fetch(BASE + '/api/admin/payments', 'GET',
            {'x-admin-auth': ADMIN},
            label=f'Admin-Payments-W{worker_id}')
        results.append(r)
    return results

def main():
    print()
    print('=' * 72)
    print('STRAPSTORE MIXED WORKLOAD CONCURRENT TEST')
    print('=' * 72)
    print('  Workers:  20 (mixed: coupon validation + settings + products + admin)')
    print('  Target:   ' + BASE)
    print()
    print('Starting...')
    print()

    start = time.time()
    all_results = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        # Submit mixed workloads
        futures = []
        for i in range(5):
            futures.append(executor.submit(test_coupon_validate, i))
        for i in range(5, 10):
            futures.append(executor.submit(test_settings_read, i))
        for i in range(10, 15):
            futures.append(executor.submit(test_products_read, i))
        for i in range(15, 20):
            futures.append(executor.submit(test_admin_payments, i))

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
    successes = [r for r in all_results if r['status'] in (200, 201)]
    client_errors = [r for r in all_results if r['status'] and 400 <= r['status'] < 500]
    server_errors = [r for r in all_results if r['status'] and 500 <= r['status'] < 600]
    timeouts = [r for r in all_results if r['error'] and 'timeout' in r['error'].lower()]

    latencies = [r['ms'] for r in all_results if r['ms'] > 0]
    latencies.sort()

    # Group by workload type
    by_type = {}
    for r in all_results:
        t = r['label'].split('-')[0]
        if t not in by_type:
            by_type[t] = []
        by_type[t].append(r)

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

    print('  Per-Workload Breakdown')
    print('  ' + '-' * 50)
    for t, results in sorted(by_type.items()):
        t_lat = [r['ms'] for r in results if r['ms'] > 0]
        t_err = [r for r in results if r['error']]
        t_5xx = [r for r in results if r['status'] and 500 <= r['status'] < 600]
        avg = sum(t_lat) / len(t_lat) if t_lat else 0
        p95 = sorted(t_lat)[int(len(t_lat) * 0.95)] if len(t_lat) > 1 else (t_lat[0] if t_lat else 0)
        status = 'OK' if len(t_err) + len(t_5xx) == 0 else 'DEGRADED'
        print(f'    {t:<20} {status:<10} {len(results):>3} req  avg={avg:>7.1f}ms p95={p95:>7.1f}ms  errs={len(t_err)+len(t_5xx):>2}')

    print()
    print('  Verdict')
    print('  ' + '-' * 50)
    error_rate = (len(errors) + len(server_errors)) / total
    if error_rate == 0:
        print('    ALL PASS - Zero errors under mixed concurrent workload')
    elif error_rate < 0.01:
        print('    GOOD - < 1% error rate')
    else:
        print('    WARNING - Errors detected')

    if latencies and max(latencies) > 10000:
        print('    CRITICAL - Requests > 10s')
    elif latencies and p95 > 5000:
        print('    WARNING - P95 > 5s')
    else:
        print('    GOOD - Latency acceptable')

    print('=' * 72)
    print()

if __name__ == '__main__':
    main()
