import type { Metadata } from 'next';
import Header from '@/components/Header';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Thư viện khoa CNTT',
    template: '%s | Thư viện khoa',
  },
  description: 'Hệ thống tra cứu và đăng ký mượn sách Thư viện khoa CNTT PTIT',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          <Header />
          <main className="site-main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
