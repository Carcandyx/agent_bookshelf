import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { unlinkSync } from 'fs';
import app from '../../src/server.js';
import { initDb, closeDb } from '../../src/db/index.js';

const DB_PATH = '/tmp/test-book-search.db';

beforeEach(async () => {
  await initDb(DB_PATH);
});

afterEach(() => {
  closeDb();
  try {
    unlinkSync(DB_PATH);
  } catch {
    // ignore
  }
});

const LENGTH_MSG = 'Search query must be 100 characters or fewer';
const TYPE_MSG = 'Search query must be a single text value';

async function search(q?: string) {
  const url = q === undefined ? '/books/search' : `/books/search?q=${encodeURIComponent(q)}`;
  return request(app).get(url);
}

function cardIds(html: string): number[] {
  return [...html.matchAll(/href="\/books\/(\d+)"/g)].map((m) => Number(m[1]));
}

async function allBooks(): Promise<{ id: number; title: string; author: string }[]> {
  const res = await request(app).get('/api/books');
  return res.body;
}

async function titlesOf(html: string): Promise<string[]> {
  const books = await allBooks();
  return cardIds(html).map((id) => books.find((b) => b.id === id)!.title);
}

describe('BOOK-101 Book search by title or author', () => {
  it('[TC-01] part of a title returns the matching book only', async () => {
    const res = await search('ring');
    expect(res.status).toBe(200);
    expect(res.text).toContain('The Lord of the Rings');
    const books = await allBooks();
    const titles = await titlesOf(res.text);
    for (const id of cardIds(res.text)) {
      const b = books.find((x) => x.id === id)!;
      expect((b.title + '\n' + b.author).toLowerCase()).toContain('ring');
    }
    expect(titles).toContain('The Lord of the Rings');
    const expected = books.filter((b) => /ring/i.test(b.title) || /ring/i.test(b.author));
    expect(cardIds(res.text)).toHaveLength(expected.length);
  });

  it('[TC-02] part of an author name returns that author\'s books only', async () => {
    const res = await search('tolk');
    expect(res.status).toBe(200);
    const books = await allBooks();
    const expected = books.filter((b) => /tolk/i.test(b.author) || /tolk/i.test(b.title));
    expect(expected.length).toBeGreaterThan(0);
    expect(cardIds(res.text).sort()).toEqual(expected.map((b) => b.id).sort());
    expect(res.text).toContain('Tolkien');
  });

  it('[TC-03] upper, lower and mixed case find the same cards including Dune', async () => {
    const upper = await search('DUNE');
    const lower = await search('dune');
    const mixed = await search('DuNe');
    expect(upper.status).toBe(200);
    expect(lower.status).toBe(200);
    expect(mixed.status).toBe(200);
    expect(await titlesOf(lower.text)).toContain('Dune');
    expect(cardIds(upper.text)).toEqual(cardIds(lower.text));
    expect(cardIds(mixed.text)).toEqual(cardIds(lower.text));
  });

  it('[TC-04] accented capital letters match case-insensitively but not accent-insensitively', async () => {
    const books = await allBooks();
    const mieville = books.filter((b) => b.author.includes('Miéville'));
    expect(mieville.length).toBeGreaterThan(0);
    const upper = await search('MIÉVILLE');
    const lower = await search('miéville');
    for (const res of [upper, lower]) {
      expect(res.status).toBe(200);
      const ids = cardIds(res.text);
      for (const b of mieville) expect(ids).toContain(b.id);
    }
    const plain = await search('Mieville');
    expect(plain.status).toBe(200);
    const ids = cardIds(plain.text);
    for (const b of mieville) expect(ids).not.toContain(b.id);
  });

  it('[TC-05] the whole query must be inside one field', async () => {
    const both = await search('Dune Herbert');
    expect(both.status).toBe(200);
    expect(cardIds(both.text)).toHaveLength(0);
    const dune = await search('Dune');
    const herbert = await search('Herbert');
    expect(await titlesOf(dune.text)).toContain('Dune');
    expect(await titlesOf(herbert.text)).toContain('Dune');
    // a book matching in both fields appears exactly once
    const ids = cardIds(dune.text);
    expect(new Set(ids).size).toBe(ids.length);
    const idsE = cardIds((await search('e')).text);
    expect(idsE.length).toBeGreaterThan(0);
    expect(new Set(idsE).size).toBe(idsE.length);
  });

  it('[TC-06] text in no title or author returns 200 with No books found', async () => {
    const res = await search('zzzxqwv');
    expect(res.status).toBe(200);
    expect(cardIds(res.text)).toHaveLength(0);
    expect(res.text).toContain('No books found');
  });

  it('[TC-07] matches are an HTML fragment of cards sorted by title', async () => {
    const res = await search('the');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).not.toContain('<html');
    const ids = cardIds(res.text);
    expect(ids.length).toBeGreaterThan(1);
    const books = await allBooks();
    const titles = ids.map((id) => books.find((b) => b.id === id)!.title);
    for (let i = 1; i < titles.length; i++) {
      expect(titles[i - 1] <= titles[i]).toBe(true);
    }
    const first = books.find((b) => b.id === ids[0])!;
    expect(res.text).toContain(`by ${first.author.replace(/'/g, '&#39;')}`);
    expect(res.text).toContain(`href="/books/${first.id}"`);
  });

  it('[TC-08] percent and underscore are literal characters', async () => {
    const pct = await search('%');
    expect(pct.status).toBe(200);
    expect(cardIds(pct.text)).toHaveLength(0);
    expect(pct.text).toContain('No books found');
    const us = await search('_');
    expect(us.status).toBe(200);
    expect(cardIds(us.text)).toHaveLength(0);
  });

  it('[TC-09] an empty query returns all 50 books in title order', async () => {
    const res = await search('');
    expect(res.status).toBe(200);
    const titles = await titlesOf(res.text);
    expect(titles).toHaveLength(50);
    expect(titles[0]).toBe('1984');
    const dune = await search('dune');
    expect(cardIds(dune.text).length).toBeLessThan(50);
  });

  it('[TC-10] missing q and whitespace-only q behave like an empty q', async () => {
    const empty = await search('');
    const missing = await search();
    const spaces = await search('   ');
    expect(missing.status).toBe(200);
    expect(spaces.status).toBe(200);
    expect(cardIds(empty.text)).toHaveLength(50);
    expect(cardIds(missing.text)).toEqual(cardIds(empty.text));
    expect(cardIds(spaces.text)).toEqual(cardIds(empty.text));
  });

  it('[TC-11] surrounding spaces are trimmed and inner spaces are kept', async () => {
    const padded = await search('  dune  ');
    const plain = await search('dune');
    expect(padded.status).toBe(200);
    expect(cardIds(padded.text)).toEqual(cardIds(plain.text));
    expect(cardIds(plain.text).length).toBeGreaterThan(0);
    const lord = await search('lord of');
    expect(lord.status).toBe(200);
    expect(lord.text).toContain('The Lord of the Rings');
  });

  it('[TC-12] a query of exactly 100 characters is allowed', async () => {
    const res = await search('a'.repeat(100));
    expect(res.status).toBe(200);
    expect(cardIds(res.text)).toHaveLength(0);
    expect(res.text).toContain('No books found');
  });

  it('[TC-13] a query of 101 characters gets a 400 length message', async () => {
    const q = 'q'.repeat(101);
    const res = await search(q);
    expect(res.status).toBe(400);
    expect(res.text).toContain('<p class="error">');
    expect(res.text).toContain(LENGTH_MSG);
    expect(cardIds(res.text)).toHaveLength(0);
    expect(res.text).not.toContain(q);
  });

  it('[TC-14] surrounding spaces do not count toward the limit', async () => {
    const ok = await search(' '.repeat(5) + 'a'.repeat(100) + ' '.repeat(5));
    expect(ok.status).toBe(200);
    const bad = await search(' '.repeat(5) + 'a'.repeat(101) + ' '.repeat(5));
    expect(bad.status).toBe(400);
    expect(bad.text).toContain(LENGTH_MSG);
  });

  it('[TC-15] the limit counts Unicode characters, not bytes', async () => {
    const ok = await search('é'.repeat(100));
    expect(ok.status).toBe(200);
    const bad = await search('é'.repeat(101));
    expect(bad.status).toBe(400);
    expect(bad.text).toContain(LENGTH_MSG);
  });

  it('[TC-16] repeated or nested q is refused', async () => {
    const repeated = await request(app).get('/books/search?q=a&q=b');
    expect(repeated.status).toBe(400);
    expect(repeated.text).toContain('<p class="error">');
    expect(repeated.text).toContain(TYPE_MSG);
    const nested = await request(app).get('/books/search?q[x]=a');
    expect(nested.status).toBe(400);
    expect(nested.text).toContain('<p class="error">');
    expect(nested.text).toContain(TYPE_MSG);
  });

  it('[TC-17] an apostrophe and SQL fragments are plain text', async () => {
    const apos = await search("'");
    expect(apos.status).toBe(200);
    expect(apos.text).toMatch(/Ender(&#39;|&apos;)s Game/);
    expect(apos.text).toMatch(/The Hitchhiker(&#39;|&apos;)s Guide to the Galaxy/);
    const inj = await search("' OR 1=1 --");
    expect(inj.status).toBe(200);
    expect(cardIds(inj.text)).toHaveLength(0);
  });

  it('[TC-18] a DROP TABLE query is text and data stays intact', async () => {
    const res = await search('"; DROP TABLE books; --');
    expect(res.status).toBe(200);
    expect(res.text).toContain('No books found');
    const after = await search('');
    expect(cardIds(after.text)).toHaveLength(50);
  });
});
