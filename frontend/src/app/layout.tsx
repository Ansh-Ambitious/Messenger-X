import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Messenger X",
  description: "One-to-One Chat Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
