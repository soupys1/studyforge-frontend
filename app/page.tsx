"use client";
import { useState } from "react";
import FileUpload from "@/components/FileUpload";

export default function Home() {
  const [documentId, setDocumentId] = useState<string | null>(null);

  return (
    <main>
      <FileUpload onUploadComplete={setDocumentId} />
      {documentId && <p>Document ID: {documentId}</p>}
    </main>
  );
}