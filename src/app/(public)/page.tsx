import Link from 'next/link';
import { db } from '@/lib/db';

export default function HomePage() {
  const totalBooks = db.books.length;
  const totalCategories = new Set(db.books.map((book) => book.category)).size;

  return (
    <section>
      <h1>Thư viện khoa CNTT PTIT</h1>
      <p>
        {totalBooks} đầu sách · {totalCategories} chuyên mục
      </p>
      <p>
        <Link href="/books">Xem danh mục sách</Link>
      </p>
    </section>
  );
}
