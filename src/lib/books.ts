import { db } from '@/lib/db';
import type { Book } from '@/types';

export interface BookFilter {
  category?: string;
  q?: string;
}

export async function getBooks(filter: BookFilter = {}): Promise<Book[]> {
  await new Promise((r) => setTimeout(r, 800));
  const category = filter.category?.trim() ?? '';
  const q = filter.q?.trim().toLowerCase() ?? '';

  return db.books.filter((book) => {
    if (category && book.category !== category) {
      return false;
    }
    if (q && !book.title.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
}

export async function getBookById(id: number): Promise<Book | undefined> {
  if (!Number.isInteger(id)) return undefined;
  return db.books.find((book) => book.id === id);
}

