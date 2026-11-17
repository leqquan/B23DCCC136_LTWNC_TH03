import { ImageResponse } from 'next/og';
import { getBookById } from '@/lib/books';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(Number(id));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px',
          background: '#0f172a',
          color: '#f8fafc',
        }}
      >
        <div style={{ fontSize: 28, color: '#93c5fd', marginBottom: 20 }}>
          Thư viện khoa CNTT PTIT
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 24 }}>
          {book ? book.title : 'Không tìm thấy sách'}
        </div>
        {book ? (
          <div style={{ fontSize: 30, color: '#cbd5e1' }}>
            {book.author} · {book.category} · {book.copies} bản
          </div>
        ) : null}
      </div>
    ),
    { ...size }
  );
}
