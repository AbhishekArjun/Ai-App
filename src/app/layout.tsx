import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "AI App Generator",
  description: "Dynamic application runtime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
