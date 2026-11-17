import type { Metadata } from 'next';
import Link from 'next/link';
import BooksFilterForm from '@/components/BooksFilterForm';
import { CATEGORIES } from '@/data/books';
import { getBooks } from '@/lib/books';

export const metadata: Metadata = {
  title: 'Danh mục sách',
};

interface BooksPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

const formatTime = (date: Date): string => date.toTimeString().slice(0, 8);

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams;
  const q = params.q ?? '';
  const category = params.category ?? '';

  const books = await getBooks({ category, q });
  const renderedAt = formatTime(new Date());

  return (
    <section>
      <h1>Danh mục sách</h1>

      <BooksFilterForm
        categories={CATEGORIES}
        initialQuery={q}
        initialCategory={category}
      />

      <p>Tìm thấy {books.length} sách</p>
      <p>Render lúc: {renderedAt}</p>

      {books.length === 0 ? (
        <p>Không tìm thấy sách nào</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tên sách</th>
              <th>Tác giả</th>
              <th>Số bản</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>
                  <Link href={`/books/${book.id}`}>{book.title}</Link>
                </td>
                <td>{book.author}</td>
                <td>Số bản: {book.copies}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
