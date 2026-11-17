export default function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <p>Khu vực thành viên</p>
      {children}
    </div>
  );
}

