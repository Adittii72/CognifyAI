import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cognify AI",
  description: "Transform videos and PDFs into interactive learning materials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
