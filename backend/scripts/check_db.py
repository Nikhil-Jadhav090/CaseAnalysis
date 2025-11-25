#!/usr/bin/env python3
import os, django, json, traceback, sys
# Ensure project root (backend/) is on PYTHONPATH so `import core` works
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE','core.settings')
django.setup()
from django.conf import settings
import os as _os
print('CWD:', _os.getcwd())
print('.env exists:', _os.path.exists(_os.path.join(_os.getcwd(), '.env')))
print("raw DB_NAME env:", repr(_os.getenv('DB_NAME')))
try:
    with open(_os.path.join(_os.getcwd(), '.env'), 'r', encoding='utf-8') as f:
        content = f.read()
    print('\n.env content (raw):')
    print(content)
except Exception as e:
    print('Could not read .env file:', e)
print('DATABASES:')
print(json.dumps(settings.DATABASES, default=str))
from django.db import connections
c = connections['default']
print('\nAttempting DB connection...')
try:
    c.ensure_connection()
    print('DB connection OK')
except Exception as e:
    print('DB connection FAILED:', e)
    traceback.print_exc()
