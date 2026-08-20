"use client";
import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import NoteCard from "@/components/NoteCard";

export default function Home() {
  const [documentId, setDocumentId] = useState<string | null>(null);

  return (
    <main>
      <FileUpload onUploadComplete={setDocumentId} />
      {documentId && <NoteCard documentId={documentId} />}
    </main>
  );
}