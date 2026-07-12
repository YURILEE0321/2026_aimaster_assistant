from sqlalchemy import Column, String, Text

from .database import Base

# backend-proxy(app/models.py)가 소유/관리하는 테이블에 대한 읽기 전용 매핑이다.
# Assistant는 이 테이블들의 스키마를 만들거나 바꾸지 않는다(create_all 호출 안 함).
# 실제로 조회에 쓰는 컬럼만 선언한다.


class Document(Base):
    __tablename__ = "documents"

    document_id = Column(String, primary_key=True)
    space_id = Column(String, nullable=False)
    wiki_doc_id = Column(String, nullable=True)
    status = Column(String, nullable=False)
    title = Column(String, nullable=False)


class WikiMd(Base):
    __tablename__ = "wikimd"

    doc_id = Column(String, primary_key=True)
    space_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    body = Column(Text, nullable=False)
