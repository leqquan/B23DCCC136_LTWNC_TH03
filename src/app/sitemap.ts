import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const bookUrls: MetadataRoute.Sitemap = db.books.map((book) => ({
    url: `${BASE_URL}/books/${book.id}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/books`,
      lastModified: new Date(),
    },
    ...bookUrls,
  ];
}

