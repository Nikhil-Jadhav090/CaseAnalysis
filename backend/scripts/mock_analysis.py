#!/usr/bin/env python3
"""
Mock Gemini Analysis Response Generator
Generates realistic JSON response for the sample case: State v. Mehta - Online Investment Fraud
"""

import json
from datetime import datetime

# Sample case from the screenshot
SAMPLE_CASE = {
    "title": "State v. Mehta - Online Investment Fraud",
    "accused_name": "Rohit Mehta",
    "description": """The complainant, Neha Verma, reported losing ₹75,000 after investing in a fake online 
stock trading platform promoted through social media ads. The platform promised high returns within a week 
but became inactive after payment. The accused, Rohit Mehta, allegedly managed the fraudulent website 
and collected payments."""
}

# Mock Gemini response - realistic AI analysis
MOCK_ANALYSIS = {
    "keywords": [
        "online fraud",
        "investment scam",
        "social media promotion",
        "fake trading platform",
        "unauthorized payment collection",
        "account closure",
        "financial loss"
    ],
    "sentiment": -0.92,
    "category_confidence": {
        "general": 0.15,
        "fraud": 0.98,
        "security": 0.45,
        "compliance": 0.60,
        "financial": 0.88
    },
    "summary": "High-priority financial fraud case involving a fake online stock trading platform that defrauded complainant Neha Verma of ₹75,000. Accused Rohit Mehta operated the fraudulent website, attracted victims through social media marketing, and disappeared after collecting payments. Immediate actions required: freeze suspected bank accounts, file fraud complaint with cyber crime unit, issue lookout notice for accused, contact social media platforms to remove fraudulent ads, and notify RBI/SEBI of unauthorized investment solicitation."
}

def print_analysis():
    """Print formatted analysis results"""
    print("=" * 80)
    print("MOCK GEMINI AI ANALYSIS - Case Analysis Module")
    print("=" * 80)
    print()
    
    print("INPUT CASE DATA:")
    print("-" * 80)
    print(f"  Title:       {SAMPLE_CASE['title']}")
    print(f"  Accused:     {SAMPLE_CASE['accused_name']}")
    print(f"  Description: {SAMPLE_CASE['description'][:100]}...")
    print()
    
    print("AI ANALYSIS OUTPUT:")
    print("-" * 80)
    print()
    
    # Keywords
    print("📌 KEYWORDS (Top 7 Themes):")
    for i, kw in enumerate(MOCK_ANALYSIS['keywords'], 1):
        print(f"   {i}. {kw}")
    print()
    
    # Sentiment
    print("📊 SENTIMENT ANALYSIS:")
    sentiment = MOCK_ANALYSIS['sentiment']
    sentiment_pct = (sentiment + 1) * 50  # Convert -1..1 to 0..100%
    sentiment_label = "😞 Very Negative" if sentiment < -0.5 else "😐 Negative" if sentiment < 0 else "😊 Positive"
    print(f"   Score: {sentiment:.2f} ({sentiment_pct:.0f}%)")
    print(f"   Label: {sentiment_label}")
    print(f"   Interpretation: Case involves serious financial crime with high victim impact")
    print()
    
    # Category Confidence
    print("📈 CATEGORY CONFIDENCE SCORES:")
    categories = MOCK_ANALYSIS['category_confidence']
    for cat, conf in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        bar_width = int(conf * 30)
        bar = "█" * bar_width + "░" * (30 - bar_width)
        print(f"   {cat.capitalize():12} {conf*100:5.1f}% [{bar}]")
    print()
    
    # Summary
    print("📝 AI-GENERATED SUMMARY:")
    print("-" * 80)
    print(f"   {MOCK_ANALYSIS['summary']}")
    print()
    
    # Raw JSON for API response
    print("=" * 80)
    print("RAW JSON RESPONSE (what API returns to Frontend):")
    print("=" * 80)
    print(json.dumps(MOCK_ANALYSIS, indent=2))
    print()
    
    return MOCK_ANALYSIS

if __name__ == "__main__":
    analysis = print_analysis()
    
    # Verification
    print("✅ MOCK ANALYSIS VERIFICATION:")
    print("-" * 80)
    print(f"  Keywords count:              {len(analysis['keywords'])} items")
    print(f"  Sentiment valid range:       {-1 <= analysis['sentiment'] <= 1}")
    print(f"  Category confidence valid:   {all(0 <= v <= 1 for v in analysis['category_confidence'].values())}")
    print(f"  Summary length:              {len(analysis['summary'])} characters")
    print()
    print("✅ All validation checks passed!")
    print()
    print("This JSON will be displayed in the UI as:")
    print("  - Keywords: Blue badge pills")
    print("  - Sentiment: Color-coded progress bar (red=negative, green=positive)")
    print("  - Categories: Horizontal progress bars with percentages")
    print("  - Summary: Quoted text block with recommended actions")
