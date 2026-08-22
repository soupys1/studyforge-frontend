"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { listMyDocuments } from "@/lib/api";
import type { SavedDocument } from "@/types";

interface DocumentSidebarProps {
  onSelectDocument: (documentId: string, filename: string) => void;
  onNewUpload: () => void;
  activeDocumentId: string | null;
  refreshTrigger: number;
}

export default function DocumentSidebar({
  onSelectDocument,
  onNewUpload,
  activeDocumentId,
  refreshTrigger,
}: DocumentSidebarProps) {
  const { user } = useAuth();
  const [docs, setDocs] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    listMyDocuments()
      .then(setDocs)
      .catch(() => setError("Failed to load documents"))
      .finally(() => setLoading(false));
  }, [user, refreshTrigger]);

  if (!user) return null;

  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      borderRight: "1px solid var(--color-border)",
      background: "var(--color-panel)",
      height: "100vh",
      position: "sticky",
      top: 0,
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
    }}>
      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--color-border)" }}>
        <p className="sf-kicker" style={{ marginBottom: 10 }}>My Documents</p>
        <button
          className="sf-btn sf-btn-primary"
          style={{ width: "100%", fontSize: 10 }}
          onClick={onNewUpload}
        >
          + New upload
        </button>
      </div>

      <div style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        {loading && (
          <p style={{ padding: "12px 16px", fontSize: 12, color: "var(--color-muted)" }}>Loading…</p>
        )}
        {error && (
          <p style={{ padding: "12px 16px", fontSize: 12, color: "var(--sf-bad)" }}>{error}</p>
        )}
        {!loading && !error && docs.length === 0 && (
          <p style={{ padding: "12px 16px", fontSize: 12, color: "var(--color-muted)" }}>
            No documents yet. Upload one to get started.
          </p>
        )}
        {docs.map(doc => (
          <button
            key={doc.document_id}
            onClick={() => onSelectDocument(doc.document_id, doc.filename)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background: doc.document_id === activeDocumentId
                ? "color-mix(in srgb, var(--color-accent) 12%, transparent)"
                : "transparent",
              border: "none",
              borderLeft: doc.document_id === activeDocumentId
                ? "2px solid var(--color-accent)"
                : "2px solid transparent",
              cursor: "pointer",
              padding: "10px 16px",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => {
              if (doc.document_id !== activeDocumentId)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "color-mix(in srgb, var(--color-border) 40%, transparent)";
            }}
            onMouseLeave={e => {
              if (doc.document_id !== activeDocumentId)
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <p style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: 2,
            }}>
              {doc.filename}
            </p>
            <p style={{ fontSize: 11, color: "var(--color-muted)" }}>
              {new Date(doc.uploaded_at).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </aside>
  );
}
