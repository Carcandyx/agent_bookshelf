---
type: regex
target:
  source: file
  path: tests/routes/book-search.test.ts
match: not_contains
weight: 1
---
bookService|searchBooksHandler|unicode_lower|SEARCH_BY_TITLE_OR_AUTHOR_SQL
