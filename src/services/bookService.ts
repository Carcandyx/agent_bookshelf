import * as BookRepository from '../models/book.js';
import type { Book } from '../models/book.js';
import { ValidationError } from './errors.js';

export const SEARCH_QUERY_MAX_LENGTH = 100;

export function searchBooks(query: unknown): Book[] {
  if (query !== undefined && typeof query !== 'string') {
    throw new ValidationError('Search query must be a single text value');
  }

  const text = (query ?? '').trim();

  if (Array.from(text).length > SEARCH_QUERY_MAX_LENGTH) {
    throw new ValidationError(`Search query must be ${SEARCH_QUERY_MAX_LENGTH} characters or fewer`);
  }

  if (text === '') {
    return BookRepository.getAllBooks();
  }

  return BookRepository.searchBooks(text);
}
