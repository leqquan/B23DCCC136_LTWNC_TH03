import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBookById } from '@/lib/books';
import { db } from '@/lib/db';

export const revalidate = 60;

export async function generateStaticParams() {
  return db.books.slice(0, 12).map((book) => ({
    id: String(book.id),
  }));
}

interface BookDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: BookDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(Number(id));
  if (!book) {
    return {
      title: 'Không tìm thấy sách',
    };
  }
  return {
    title: `${book.title} – ${book.author}`,
    description: `Sách ${book.category}, thư viện có ${book.copies} bản`,
  };
}

const formatTime = (date: Date): string => date.toTimeString().slice(0, 8);

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params;
  const book = await getBookById(Number(id));

  if (!book) {
    notFound();
  }

  const updatedAt = formatTime(new Date());
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author,
    },
    genre: book.category,
    url: `http://localhost:3000/books/${book.id}`,
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <h1>{book.title}</h1>
      <p>Tác giả: {book.author}</p>
      <p>Chuyên mục: {book.category}</p>
      <p>Số bản: {book.copies}</p>
      <p>Cập nhật lúc: {updatedAt}</p>
      <p>
        <Link href={`/loans?book=${book.id}`}>Mượn sách này</Link>
      </p>
    </article>
  );
}
