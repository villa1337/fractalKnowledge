PROMPTS = {
    "en": """
    Create a brief outline of the key ideas related to the concept "{keyword}".
    
    Organize your answer as a list of subtopics. Each subtopic should include:
    - a short title
    - a type (like fact, category, image, quote, or entity)
    - a short description
    - (optional) an image URL if relevant

    Please format the result as a valid JSON object with:
    - title
    - type
    - value
    - optional media
    - a "children" array containing up to 5 related subtopics
    
    Do not include explanations outside of the JSON. Just the JSON object.
    """,
    "es": """
Crea un breve esquema de las ideas clave relacionadas con el concepto "{keyword}".

Organiza la respuesta como una lista de subtemas. Cada subtema debe incluir:
- un título corto
- un tipo (como hecho, categoría, imagen, cita o entidad)
- una breve descripción
- (opcional) una URL de imagen si es relevante

Devuelve el resultado como un objeto JSON válido con:
- título
- tipo
- valor
- media (opcional)
- un arreglo "children" con hasta 5 subtemas relacionados

No incluyas explicaciones fuera del JSON. Solo el objeto JSON.
"""
}
