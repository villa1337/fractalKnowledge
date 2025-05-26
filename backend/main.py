from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union
import requests

app = FastAPI()
import logging
logging.basicConfig(level=logging.INFO)
print("🔥 FastAPI app is starting...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev: allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Node(BaseModel):
    title: str
    type: str
    value: Optional[str] = None
    media: Optional[str] = None
    preview: Optional[List[str]] = None
    action: Optional[str] = None
    children: Optional[List["Node"]] = None

Node.update_forward_refs()

# Placeholder for OpenRouter API key
OPENROUTER_API_KEY = "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"

# Improved function to query OpenRouter LLM with custom User-Agent, fallback, delay, and error handling
import time

def query_openrouter(prompt: str, model="openai/gpt-3.5-turbo:free") -> dict:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "fractal-knowledge-explorer/1.0"
    }
    body = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1500
    }

    time.sleep(1)  # Delay to reduce risk of rate limiting

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            json=body,
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        print(f"❌ HTTP error occurred: {http_err}")
        if response.status_code == 429 and model != "openai/gpt-3.5-turbo:free":
            print("🔁 Retrying with fallback model...")
            return query_openrouter(prompt, model="openai/gpt-3.5-turbo:free")
        raise

# Function to query Wikipedia API
def query_wikipedia(keyword: str) -> dict:
    response = requests.get(
        f"https://en.wikipedia.org/api/rest_v1/page/summary/{keyword}"
    )
    if response.status_code == 200:
        return response.json()
    return {}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/concept/{keyword}", response_model=Node)
async def get_concept(keyword: str):
    # Query Wikipedia for factual data
    wiki_data = query_wikipedia(keyword)

    # Generate semantic tree using OpenRouter
    prompt = f"""
You are a structured JSON knowledge generator.

Given a concept (e.g., "car", "Nissan", or "freedom"), return a structured JSON tree that organizes related information in a meaningful, hierarchical way.

Each node in the JSON should have:
- title (string): the name of the concept
- type (string): one of "entity", "fact", "category", "quote", or "image"
- value (string): short explanation or fact (optional for categories)
- media (string, optional): image URL if relevant
- children (array): up to 5 deeper child nodes (can be empty)

Your job is to intelligently cluster semantically rich sub-concepts and allow drilling down layer by layer.

Return JSON only. Do not explain. Do not use markdown.
Limit depth to 2 levels, 5 children per node max.
"""
    import json
    import logging
    try:
        llm_raw = query_openrouter(prompt)
        print("✅ LLM raw response received")

        llm_content = llm_raw["choices"][0]["message"]["content"]

        # Remove any Markdown code block formatting like ```json ... ```
        if llm_content.strip().startswith("```"):
            llm_content = "\n".join(
                line for line in llm_content.strip().splitlines() if not line.strip().startswith("```")
            )

        tree = json.loads(llm_content)
        print("✅ Successfully parsed LLM JSON response")

    except Exception as e:
        print(f"❌ Failed to parse LLM response: {e}")
        print(f"Raw LLM content: {llm_raw if 'llm_raw' in locals() else 'No response'}")
        tree = {
            "title": keyword,
            "type": "error",
            "value": "An error occurred while generating the concept tree.",
            "children": []
        }

    # Fallback enrichment for root node from Wikipedia
    if not tree.get("value") and wiki_data.get("extract"):
        tree["value"] = wiki_data["extract"]
    if not tree.get("media") and wiki_data.get("thumbnail"):
        tree["media"] = wiki_data["thumbnail"].get("source")

    return Node(**tree)