import os
import json
from pathlib import Path
import sys

# Fix Windows encoding for console output
if sys.platform == 'win32':
    import io
    sys.stdout.reconfigure(encoding='utf-8')

# Load .env manually
env_path = Path(__file__).resolve().parents[1] / '.env'
if env_path.exists():
    for line in env_path.read_text().splitlines():
        if '=' in line and not line.strip().startswith('#'):
            k, v = line.split('=', 1)
            k = k.strip()
            v = v.strip().strip('\"\'')
            if k and v and k not in os.environ:
                os.environ[k] = v

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
print('GEMINI_API_KEY present:', bool(GEMINI_API_KEY))

try:
    import google.generativeai as genai
except Exception as e:
    print('Failed to import google.generativeai:', e)
    raise

if not GEMINI_API_KEY:
    raise SystemExit('GEMINI_API_KEY not found in environment')

genai.configure(api_key=GEMINI_API_KEY)

# List available models
print('Available models:')
for m in genai.list_models():
    print(f"  - {m.name}")

model = genai.GenerativeModel('gemini-2.0-flash')

prompt = '''
You are an expert case analysis AI. Analyze the following case and return JSON with keys: keywords (list), sentiment (float -1..1), category_confidence (object with general, fraud, security, compliance, financial floats), summary (string).

Case:
Title: State v. Mehta - Online Investment Fraud
Description: The complainant, Neha Verma, reported losing ₹75,000 after investing in a fake online stock trading platform promoted through social media ads. The platform promised high returns within a week but became inactive after payment. The accused, Rohit Mehta, allegedly managed the fraudulent website and collected payments.

Return only valid JSON.
'''

print('\nSending prompt to Gemini...')
try:
    response = model.generate_content(prompt)
    text = getattr(response, 'text', None) or str(response)
    print('\n--- RAW RESPONSE ---')
    print(text)
    print('--- END RAW ---\n')

    # Strip markdown code fences if present
    text = text.strip()
    if text.startswith('```json'):
        text = text[7:]  # Remove ```json
    if text.startswith('```'):
        text = text[3:]  # Remove ```
    if text.endswith('```'):
        text = text[:-3]  # Remove trailing ```
    text = text.strip()

    # Try parse JSON
    try:
        parsed = json.loads(text)
        print('--- PARSED JSON ---')
        print(json.dumps(parsed, indent=2))
    except Exception as e:
        print('Could not parse as JSON:', e)

except Exception as e:
    print('Error calling Gemini API:', e)
    raise
