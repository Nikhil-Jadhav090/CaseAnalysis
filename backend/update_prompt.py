#!/usr/bin/env python
# Update the AI analysis prompt to focus on advocate-style recommendations

with open('cases/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the main role description
content = content.replace(
    'You are an expert legal case analysis AI. Analyze the case below and tailor your output to the selected country/jurisdiction if provided.',
    'You are an expert legal advocate and case advisor. Your role is to analyze the case below and provide comprehensive guidance on what actions the complainant should take after this incident.'
)

# Update section headers and descriptions
content = content.replace('Goals:', 'Analysis Requirements:')
content = content.replace(
    '1) Extract top 5-7 keywords',
    '1) Extract top 5-7 keywords relevant to the legal case'
)
content = content.replace(
    '2) Provide sentiment score in [-1.0, 1.0]',
    '2) Provide sentiment score in [-1.0, 1.0] (severity assessment)'
)
content = content.replace(
    '4) 2-3 sentence summary',
    '4) Write a clear 2-3 sentence summary as an advocate would present it'
)

# Update JSON schema examples
content = content.replace(
    '"summary": "Brief summary here"',
    '"summary": "Clear incident summary as an advocate would present it"'
)
content = content.replace(
    '"rationale": "why/why not"',
    '"rationale": "advocate\'s assessment of case strength"'
)
content = content.replace(
    '"missing_evidence": ["item A", "item B"]',
    '"missing_evidence": ["specific document A", "witness statement B", "digital evidence C"]'
)
content = content.replace(
    '"recommended_actions": ["collect payroll logs", "interview witnesses"]',
    '"recommended_actions": ["File FIR at local police station within 24 hours", "Preserve all digital evidence immediately", "Get medical examination if applicable", "Notify bank/financial institution", "Document all losses with receipts"]'
)

# Update description examples
content = content.replace(
    '"description": "what it covers"',
    '"description": "what it covers and why it applies"'
)
content = content.replace(
    '"description": "short rationale"',
    '"description": "why this charge applies"'
)

# Save the updated content
with open('cases/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated AI prompt to focus on advocate-style recommendations")
print("✓ Enhanced with actionable next steps and timelines")
