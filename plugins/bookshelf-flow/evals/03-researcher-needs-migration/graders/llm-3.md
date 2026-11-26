---
type: llm
focus: last_message
weight: 1
---
The answer is grounded in the real schema: it cites src/db/schema.sql or names real books columns (isbn, cover_url, description, published_year) and notes CREATE TABLE IF NOT EXISTS would not add a column to an existing bookshelf.db. Fail if it invents columns or cites nothing.
