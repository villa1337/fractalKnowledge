PROMPTS = {
    "en": """
    You are a structured JSON knowledge generator.

    Your task is to create a semantic tree about the concept: "{keyword}".

    Respond only with JSON using this structure:
    - title (string): must exactly match the concept "{keyword}"
    - type (string): one of "entity", "fact", "category", "quote", or "image"
    - value (string): a short explanation
    - media (string, optional): image URL
    - children (array): up to 5 related sub-nodes, each of the same structure

    Only return valid JSON. No explanations. No markdown.
    Depth: 1 level only. Max 5 children.
    """,
    "es": """
    Eres un generador de conocimiento estructurado en JSON.

    Tu tarea es crear un árbol semántico sobre el concepto: "{keyword}".

    Responde solo con JSON usando esta estructura:
    - title (string): debe coincidir exactamente con el concepto "{keyword}"
    - type (string): uno de "entity", "fact", "category", "quote" o "image"
    - value (string): una breve explicación
    - media (string, opcional): URL de una imagen
    - children (array): hasta 5 sub-nodos relacionados, cada uno con la misma estructura

    Devuelve solo JSON válido. Sin explicaciones. Sin markdown.
    Profundidad: solo 1 nivel. Máximo 5 hijos.
    """
}
