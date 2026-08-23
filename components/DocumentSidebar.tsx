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
      width: 220,
      flexShrink: 0,
      borderRight: "1px solid var(--ln-hair)",
      background: "var(--ln-canvas)",
      height: "100vh",
      position: "sticky",
      top: 0,
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
    }}>
      <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid var(--ln-hair)" }}>
        <p className="sf-kicker" style={{ marginBottom: 10 }}>Documents</p>
        <button
          className="sf-btn sf-btn-secondary"
          style={{ width: "100%", fontSize: 13 }}
          onClick={onNewUpload}
        >
          + New upload
        </button>
      </div>

      <div style={{ flex: 1, padding: "6px 0", overflowY: "auto" }}>
        {loading && (
          <p style={{ padding: "12px 14px", fontSize: 12, color: "var(--ln-ink-tertiary)" }}>Loading…</p>
        )}
        {error && (
          <p style={{ padding: "12px 14px", fontSize: 12, color: "var(--ln-error)" }}>{error}</p>
        )}
        {!loading && !error && docs.length === 0 && (
          <p style={{ padding: "12px 14px", fontSize: 12, color: "var(--ln-ink-tertiary)", lineHeight: 1.5 }}>
            No documents yet.
          </p>
        )}
        {docs.map(doc => {
          const isActive = doc.document_id === activeDocumentId;
          return (
            <button
              key={doc.document_id}
              onClick={() => onSelectDocument(doc.document_id, doc.filename)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: isActive ? "var(--ln-s1)" : "transparent",
                border: "none",
                borderLeft: `2px solid ${isActive ? "var(--ln-accent)" : "transparent"}`,
                cursor: "pointer",
                padding: "9px 14px 9px 12px",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--ln-s1)";
              }}
              onMouseLeave={e => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <p style={{
                fontSize: 12,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--ln-ink)" : "var(--ln-ink-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginBottom: 2,
              }}>
                {doc.filename}
              </p>
              <p style={{ fontSize: 11, color: "var(--ln-ink-tertiary)" }}>
                {new Date(doc.uploaded_at).toLocaleDateString()}
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
