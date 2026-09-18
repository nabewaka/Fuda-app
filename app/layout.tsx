import type { Metadata } from "next";
// import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "フダ",
  description: "みんなが研究中かそうでないかをチラ見できます",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}