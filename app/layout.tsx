import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizAI",
  description: "Upload documents and generate notes, flashcards, and quizzes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
