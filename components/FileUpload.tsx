"use client";
import { useState } from "react";
import { uploadFile } from "@/lib/api";

interface FileUploadProps {
  onUploadComplete: (documentId: string) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    try {
      const result = await uploadFile(file);
      onUploadComplete(result.document_id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}