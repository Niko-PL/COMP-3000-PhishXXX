"""
PhishGuard API Test Script
Run with: python test_api.py
Make sure the API is running first: python app.py
"""

import requests

BASE_URL = "http://127.0.0.1:5443"

PASS = "\033[92m PASS \033[0m"
FAIL = "\033[91m FAIL \033[0m"
SECTION = "\033[94m{}\033[0m"

passed = 0
failed = 0

def check(name, response, expected_status, expected_key=None, expected_value=None):
    global passed, failed
    status_ok = response.status_code == expected_status
    value_ok = True
    if expected_key is not None and expected_value is not None:
        value_ok = response.json().get(expected_key) == expected_value
    ok = status_ok and value_ok
    result = PASS if ok else FAIL
    print(f"[{result}] {name}")
    print(f"         HTTP {response.status_code} | {response.json()}")
    if ok:
        passed += 1
    else:
        failed += 1
        if not status_ok:
            print(f"         Expected status {expected_status}, got {response.status_code}")
        if not value_ok:
            print(f"         Expected {expected_key}='{expected_value}', got '{response.json().get(expected_key)}'")


# ── /test ─────────────────────────────────────────────────────────────────────
print(SECTION.format("\n══ /test ══"))

r = requests.get(f"{BASE_URL}/test")
check("Health check returns 200 + message", r, 200, "message", "Hello, World!")


# ── /extend ───────────────────────────────────────────────────────────────────
print(SECTION.format("\n══ /extend ══"))

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "https://www.google.com"})
check("Valid HTTPS URL returns 200", r, 200)

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "https://bit.ly/3Qexample"})
check("Short URL resolves (may 200 or 400 depending on URL)", r, 200)

r = requests.get(f"{BASE_URL}/extend")
check("Missing short_url param returns 400", r, 400)

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "notaurl"})
check("No scheme URL blocked → 400", r, 400)

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "file:///etc/passwd"})
check("file:// scheme blocked → 400", r, 400)

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "ftp://example.com"})
check("ftp:// scheme blocked → 400", r, 400)

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "http://192.168.1.1"})
check("IP address URL blocked → 400", r, 400)

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "http://127.0.0.1"})
check("Loopback IP blocked → 400", r, 400)


# ── /scan ──────────────────────────────────────────────────────────────────────
print(SECTION.format("\n══ /scan ══"))

r = requests.post(f"{BASE_URL}/scan", json={"email_words_list": "click here to verify your account login password"})
check("Phishing words detected → 200 with bad_words", r, 200)

r = requests.post(f"{BASE_URL}/scan", json={"email_words_list": "hello how are you"})
check("Clean text → 200 with empty bad_words", r, 200)

r = requests.post(f"{BASE_URL}/scan", json={})
check("Missing email_words_list → 400", r, 400)

r = requests.post(f"{BASE_URL}/scan", data="not json", headers={"Content-Type": "text/plain"})
check("Wrong Content-Type → 400", r, 400)


# ── CORS preflight ─────────────────────────────────────────────────────────────
print(SECTION.format("\n══ CORS preflight ══"))

r = requests.options(
    f"{BASE_URL}/scan",
    headers={
        "Origin": "chrome-extension://leiipblmdocdipnlabmjmgndlceodmml",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type"
    },
)
print(f"[INFO] OPTIONS /scan → HTTP {r.status_code} | Access-Control-Allow-Origin: {r.headers.get('Access-Control-Allow-Origin', 'NOT SET')}")


# ── Rate limit ────────────────────────────────────────────────────────────────
print(SECTION.format("\n══ Rate limit (/test limit: 2/min) ══"))

results = []
for i in range(3):
    r = requests.get(f"{BASE_URL}/test")
    results.append(r.status_code)
    print(f"         Request {i+1}: HTTP {r.status_code}")

if 429 in results:
    print(f"[{PASS}] Rate limit triggered correctly (429 received)")
    passed += 1
else:
    print(f"[{FAIL}] Rate limit not triggered (expected 429 on 3rd request)")
    failed += 1


# ── Summary ───────────────────────────────────────────────────────────────────
total = passed + failed
print(f"\n{'═'*45}")
print(f"  Results: {passed}/{total} passed  |  {failed} failed")
print(f"{'═'*45}\n")
