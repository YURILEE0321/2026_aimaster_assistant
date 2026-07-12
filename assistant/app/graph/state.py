from typing import TypedDict


class DocRef(TypedDict):
    document_id: str
    title: str


class Hit(TypedDict):
    doc_id: str
    score: float


class AssistantState(TypedDict, total=False):
    space_id: str
    question: str
    history: list[dict]
    allowed_doc_ids: list[str]
    doc_id_map: dict[str, DocRef]  # wiki_doc_id -> {document_id, title}

    question_embedding: list[float]
    summary_hits: list[Hit]
    chunk_hits: list[Hit]

    context: str
    answer: str
    source_document_ids: list[str]  # wiki_doc_id 목록 (proxy document_id 아님)
    doc_scores: dict[str, float]  # wiki_doc_id -> 최고 매칭 점수
