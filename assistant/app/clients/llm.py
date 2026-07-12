from openai import AzureOpenAI

from .. import config

_client = AzureOpenAI(
    azure_endpoint=config.OPENAI_BASE_URL,
    api_key=config.OPENAI_API_KEY or "unset",
    api_version=config.OPENAI_API_VERSION,
)

SYSTEM_PROMPT = (
    "너는 사내 위키 문서를 근거로 답하는 어시스턴트다. "
    "아래에 주어진 컨텍스트에 있는 내용만 근거로 답하고, "
    "컨텍스트에 없는 내용은 추측하지 말고 모른다고 답해라."
)


def embed_text(text: str) -> list[float]:
    response = _client.embeddings.create(model=config.EMBEDDING_MODEL, input=text)
    return response.data[0].embedding


def generate_answer(context: str, question: str, history: list[dict]) -> str:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in history:
        role = "assistant" if turn["role"] == "assistant" else "user"
        messages.append({"role": role, "content": turn["text"]})
    messages.append(
        {
            "role": "user",
            "content": f"컨텍스트:\n{context}\n\n질문: {question}",
        }
    )

    response = _client.chat.completions.create(
        model=config.CHAT_MODEL,
        messages=messages,
    )
    return response.choices[0].message.content
