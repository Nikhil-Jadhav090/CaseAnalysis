import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

BASE = 'http://127.0.0.1:8000'

headers = {'Content-Type': 'application/json'}

reg_payload = {
    'email': 'testcli+1@example.com',
    'password': 'TestPassw0rd!',
    'password2': 'TestPassw0rd!',
    'first_name': 'CLI',
    'last_name': 'Tester',
    'role': 'user'
}

def post(path, payload):
    req = Request(BASE + path, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
    try:
        with urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            print(f"{path} -> {resp.status}\n{body}\n")
            return json.loads(body)
    except HTTPError as e:
        body = e.read().decode('utf-8')
        print(f"{path} -> ERROR {e.code}\n{body}\n")
        return None

if __name__ == '__main__':
    print('Registering...')
    r = post('/api/auth/register/', reg_payload)

    print('Logging in...')
    login_payload = {'email': reg_payload['email'], 'password': reg_payload['password']}
    l = post('/api/auth/login/', login_payload)
    if l:
        print('Access token:', l.get('access')[:40] + '...')
