# Flash Cards AI Translation Guide

## Overview
The Flash Cards feature now includes AI-powered auto-translation to automatically fill in phonetic pronunciation, meaning, and example sentences.

## How to Use

### 1. Basic Usage (Mock Translation)
Currently, the system uses mock translations for demonstration:

1. Click "Add Card" button
2. Enter a word (e.g., "hello", "world", "computer", "book")
3. Click the ✨ magic wand icon next to the word field
4. The system will auto-fill:
   - **Phonetic**: IPA pronunciation (e.g., `/həˈloʊ/`)
   - **Meaning**: Vietnamese translation (e.g., "xin chào")
   - **Example**: Example sentence (e.g., "Hello, how are you today?")

### 2. Integrating Real AI (Google Gemini - Recommended)

To use actual AI translation with Google Gemini, follow these steps:

#### Step 1: Get Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key

#### Step 2: Install Gemini SDK
```bash
cd app
npm install @google/generative-ai
```

#### Step 3: Add API Key to Environment
Create or update `app/.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Step 4: Update Translation API
Replace the entire content of `app/src/app/api/flash-cards/translate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word } = body;

    if (!word || typeof word !== "string") {
      return NextResponse.json(
        { error: "Word is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `Translate the English word "${word}" to Vietnamese. Provide:
1. phonetic: IPA pronunciation in English (format: /pronunciation/)
2. meaning: Vietnamese translation
3. example: A simple example sentence using this word in English

Return ONLY a valid JSON object with this exact structure:
{"phonetic": "/pronunciation/", "meaning": "translation", "example": "Example sentence."}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed. Please check your API key and try again." },
      { status: 500 }
    );
  }
}
```

### 3. Alternative AI Services

#### OpenAI
```bash
npm install openai
```

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { word } = await request.json();
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a language translation assistant. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: `Translate "${word}" to Vietnamese. Return JSON: {"phonetic": "/IPA/", "meaning": "translation", "example": "sentence"}`
      }
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(completion.choices[0].message.content || "{}");
  return NextResponse.json(result);
}
```

#### Anthropic Claude
```bash
npm install @anthropic-ai/sdk
```

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  const { word } = await request.json();
  
  const message = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Translate "${word}" to Vietnamese. Return JSON: {"phonetic": "IPA", "meaning": "translation", "example": "sentence"}`
    }],
  });
  
  const content = message.content[0];
  if (content.type === "text") {
    return NextResponse.json(JSON.parse(content.text));
  }
}
```

## Features

### Card Display
- **Front**: Shows the word and phonetic pronunciation
- **Back**: Shows the meaning and example sentence (in styled box)
- **Click to flip** between front and back

### Status Management
- Click status chip to cycle through: Not Learned → Learning → Learned → Mastered
- Color-coded for easy tracking

### Database Migration
Run this to add the new `example` field:
```bash
curl -X POST http://localhost:3000/api/migration
```

## API Costs (Approximate)

| Provider | Model | Cost per 1K tokens | Free Tier | Example |
|----------|-------|-------------------|-----------|---------|
| Google | gemini-1.5-flash | $0.075/$0.30 | 15 requests/min | ~$0.0005 per card ⭐ |
| Google | gemini-1.5-pro | $1.25/$5.00 | 2 requests/min | ~$0.003 per card |
| OpenAI | gpt-4o-mini | $0.15/$0.60 | No | ~$0.001 per card |
| OpenAI | gpt-3.5-turbo | $0.50/$1.50 | No | ~$0.002 per card |
| Anthropic | claude-3-haiku | $0.25/$1.25 | No | ~$0.001 per card |

⭐ **Recommended**: Google Gemini offers generous free tier and low costs

## Tips

1. **Batch Processing**: Create multiple cards at once, then use AI to fill them in
2. **Manual Override**: AI suggestions can be edited before saving
3. **Language Support**: Modify the prompt to support other languages
4. **Caching**: Consider caching common words to reduce API calls

## Troubleshooting

**"Translation failed"**
- Check API key is set correctly in `.env.local`
- Verify API key has sufficient credits
- Check console logs for detailed error messages

**Empty responses**
- Ensure response format matches expected JSON structure
- Update prompt to be more explicit about JSON format

## Next Steps

1. Add support for multiple target languages
2. Implement translation history/cache
3. Add pronunciation audio using TTS APIs
4. Batch translate multiple cards at once
