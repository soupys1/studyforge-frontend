"use client";
import { useState } from "react";
import { generateNotes } from "@/lib/api";

interface NoteData {
  note_id: string;
  title: string;
  content: string;
  source_page: number | string | null;
}

interface NoteCardProps {
  documentId: string;
}

export default function NoteCard({ documentId }: NoteCardProps) {
  const [topic, setTopic] = useState("");
  const [note, setNote] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!topic) return;
    setLoading(true);
    try {
      const result = await generateNotes(documentId, topic);
      setNote(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Enter topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <button onClick={handleGenerate} disabled={!topic || loading}>
        {loading ? "Generating..." : "Generate Notes"}
      </button>

      {note && (
        <div>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </div>
      )}
    </div>
  );
}