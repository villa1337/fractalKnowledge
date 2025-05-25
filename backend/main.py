from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union
import requests

app = FastAPI()
import logging
logging.basicConfig(level=logging.INFO)
logging.info("🔥 FastAPI app is starting...")

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

# Function to query OpenRouter LLM
def query_openrouter(prompt: str) -> dict:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    body = {
        "model": "mistralai/mistral-7b-instruct:free",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 1500
    }
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        json=body,
        headers=headers
    )
    response.raise_for_status()
    return response.json()

# Function to query Wikipedia API
def query_wikipedia(keyword: str) -> dict:
    response = requests.get(
        f"https://en.wikipedia.org/api/rest_v1/page/summary/{keyword}"
    )
    if response.status_code == 200:
        return response.json()
    return {}

@app.get("/concept/{keyword}", response_model=Node)
async def get_concept(keyword: str):
    # Query Wikipedia for factual data
    wiki_data = query_wikipedia(keyword)

    # Generate semantic tree using OpenRouter
    prompt = f"""
You are an AI trained to return a **compact**, two-level, semantic knowledge tree in JSON format.

Given the concept: \"{keyword}\"

Return a structured JSON object like this:

{{
  "title": "string",
  "type": "entity" | "fact" | "category" | "quote" | "image",
  "value": "brief description (optional)",
  "media": "optional image URL",
  "children": [
    {{
      "title": "string",
      "type": "entity" | "fact" | "category" | "quote" | "image",
      "value": "brief description (optional)",
      "media": "optional image URL",
      "children": [ ... ] // up to 3 items max
    }},
    ...
  ] // up to 5 items max
}}

- Always keep responses compact and structured.
- Limit to **2 levels of depth**, max 5 nodes at each level.
- Keep value text short. Avoid long lists or verbose history.
- Return only JSON, no explanation or wrapping markdown.
"""
    import json

    llm_raw = query_openrouter(prompt)

    try:
        llm_content = llm_raw["choices"][0]["message"]["content"]

        # Remove any Markdown code block formatting like ```json ... ```
        if llm_content.strip().startswith("```"):
            llm_content = "\n".join(
                line for line in llm_content.strip().splitlines() if not line.strip().startswith("```")
            )

        tree = json.loads(llm_content)
    except Exception as e:
        raise ValueError(f"Failed to parse LLM response: {e}\nRaw content: {llm_raw}")

    # Fallback enrichment for root node from Wikipedia
    if not tree.get("value") and wiki_data.get("extract"):
        tree["value"] = wiki_data["extract"]
    if not tree.get("media") and wiki_data.get("thumbnail"):
        tree["media"] = wiki_data["thumbnail"].get("source")

    return Node(**tree)