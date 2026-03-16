import requests

BASE_URL = "http://127.0.0.1:5000"

PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"

def check(name, response, expected_status, expected_key=None, expected_value=None):
    status_ok = response.status_code == expected_status
    value_ok = True
    if expected_key and expected_value is not None:
        value_ok = response.json().get(expected_key) == expected_value
    result = PASS if (status_ok and value_ok) else FAIL
    print(f"[{result}] {name} — HTTP {response.status_code} | {response.json()}")


print("\n--- /test ---")

r = requests.get(f"{BASE_URL}/test")
check("Basic health check", r, 200, "message", "Hello, World!")


print("\n--- /extend ---")

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "https://bit.ly/3Qexample"})
check("Valid short URL", r, 200)

r = requests.get(f"{BASE_URL}/extend")
check("Missing short_url param", r, 400)

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "notaurl"})
check("No scheme URL blocked", r, 400)

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "file:///etc/passwd"})
check("file:// scheme blocked", r, 400)

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "ftp://example.com"})
check("ftp:// scheme blocked", r, 400)

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "http://192.168.1.1"})
check("IP address URL blocked", r, 400)

r = requests.get(f"{BASE_URL}/extend", params={"short_url": "https://www.youtube.com"})
check("Normal HTTPS URL", r, 200)


print("\n--- /scan ---")

r = requests.post(f"{BASE_URL}/scan", json={"email_words_list": "click here to verify your account login password"})
check("Scan with phishing words", r, 200)

r = requests.post(f"{BASE_URL}/scan", json={"email_words_list": "hello how are you today"})
check("Scan with clean words", r, 200)

r = requests.post(f"{BASE_URL}/scan", json={})
check("Scan missing email_words_list", r, 400)

r = requests.post(f"{BASE_URL}/scan")
check("Scan no JSON body", r, 400)


print("\n--- Rate limit ---")

print("Hitting /test 3 times (limit is 2/min, 3rd should be 429)...")
for i in range(3):
    r = requests.get(f"{BASE_URL}/test")
    print(f"  Request {i+1}: HTTP {r.status_code}")