from langgraph.graph import END, START, StateGraph
from sqlalchemy.orm import Session

from . import nodes
from .state import AssistantState


def build_graph(db: Session):
    graph = StateGraph(AssistantState)

    graph.add_node("retrieve_summary", nodes.retrieve_summary)
    graph.add_node("retrieve_chunk", nodes.retrieve_chunk)
    graph.add_node("no_context_answer", nodes.no_context_answer)
    graph.add_node("build_context", nodes.make_build_context(db))
    graph.add_node("generate_answer", nodes.generate_answer_node)
    graph.add_node("extract_sources", nodes.extract_sources)

    graph.add_edge(START, "retrieve_summary")
    graph.add_edge("retrieve_summary", "retrieve_chunk")
    graph.add_conditional_edges(
        "retrieve_chunk",
        nodes.has_context,
        {"build_context": "build_context", "no_context_answer": "no_context_answer"},
    )
    graph.add_edge("build_context", "generate_answer")
    graph.add_edge("generate_answer", "extract_sources")
    graph.add_edge("extract_sources", END)
    graph.add_edge("no_context_answer", END)

    return graph.compile()
