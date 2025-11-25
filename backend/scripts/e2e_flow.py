import json
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BASE = 'http://127.0.0.1:8000'

headers = {'Content-Type': 'application/json'}

def post(path, payload, extra_headers=None):
    h = headers.copy()
    if extra_headers:
        h.update(extra_headers)
    req = Request(BASE + path, data=json.dumps(payload).encode('utf-8'), headers=h, method='POST')
    try:
        with urlopen(req, timeout=30) as resp:
            body = resp.read().decode('utf-8')
            return resp.status, json.loads(body)
    except HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = body
        return e.code, parsed
    except URLError as e:
        return None, str(e)


def run():
    timestamp = int(time.time())
    email = f'test_e2e_{timestamp}@example.com'
    password = 'TestPassw0rd!'
    name = 'E2E Tester'

    print('1) Registering user:', email)
    reg_payload = {
        'email': email,
        'password': password,
        'password2': password,
        'first_name': 'E2E',
        'last_name': 'Tester',
        'role': 'user'
    }
    status, body = post('/api/auth/register/', reg_payload)
    print('  ->', status, body)
    if status is None:
        print('ERROR: Could not reach backend')
        return 2
    if status != 201:
        print('Registration failed; trying to continue if user exists')

    print('2) Logging in')
    login_payload = {'email': email, 'password': password}
    status, body = post('/api/auth/login/', login_payload)
    print('  ->', status)
    if status != 200:
        print('Login failed:', body)
        return 3
    access = body.get('access')
    if not access:
        print('No access token in login response')
        return 4

    print('3) Create chat session')
    status, body = post('/api/chat/sessions/', {}, extra_headers={'Authorization': f'Bearer {access}'})
    print('  ->', status, body)
    if status not in (200,201):
        print('Failed to create session')
        return 5
    session_id = body.get('id')
    if not session_id:
        print('No session id returned')
        return 6

    print('4) Post chat message (JSON)')
    msg_payload = {'content': 'This is an automated end-to-end test. Please summarize.'}
    status, body = post(f'/api/chat/sessions/{session_id}/messages/', msg_payload, extra_headers={'Authorization': f'Bearer {access}'})
    print('  ->', status, body)
    if status != 201:
        print('Posting message failed')
        return 7

    ai = body.get('ai_message') or body
    # ai_message may be nested
    if isinstance(ai, dict):
        content = ai.get('content') or ai.get('text') or ai.get('summary')
    else:
        content = None

    print('\nAI reply (short):')
    if content:
        print(content[:400])
        print('\nE2E PASS')
        return 0
    else:
        print('No AI content found in response; full response:')
        print(body)
        print('\nE2E FAIL')
        return 8

if __name__ == '__main__':
    rc = run()
    sys.exit(rc)
