'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { Category } from '@/types';

interface BooksFilterFormProps {
  categories: Category[];
  initialQuery: string;
  initialCategory: string;
}

export default function BooksFilterForm({
  categories,
  initialQuery,
  initialCategory,
}: BooksFilterFormProps) {
  const router = useRouter();
  const categoryRef = useRef<HTMLSelectElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleQueryChange = (nextQuery: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      params.set('q', nextQuery);
      params.set('category', categoryRef.current?.value ?? initialCategory);
      router.replace(`/books?${params.toString()}`);
    }, 350);
  };

  return (
    <form method="GET" action="/books">
      <div>
        <label htmlFor="q">Tìm sách</label>
        <input
          id="q"
          name="q"
          type="text"
          defaultValue={initialQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="category">Chuyên mục</label>
        <select
          ref={categoryRef}
          key={initialCategory}
          id="category"
          name="category"
          defaultValue={initialCategory}
        >
          <option value="">Tất cả</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Lọc</button>
    </form>
  );
}
