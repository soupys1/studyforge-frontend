"use client";
import { useRef, useState } from "react";
import { uploadFile } from "@/lib/api";

export interface DocInfo {
  documentId: string;
  filename: string;
  chunks: number;
}

interface FileUploadProps {
  onUploadComplete: (info: DocInfo) => void;
  onDocumentAdded?: () => void;
}

const ALLOWED = [".pdf", ".docx", ".txt"];
type UploadState = "idle" | "selected" | "uploading" | "done" | "error";

export default function FileUpload({ onUploadComplete, onDocumentAdded }: FileUploadProps) {
  const [state, setState]           = useState<UploadState>("idle");
  const [file, setFile]             = useState<File | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [slowWarning, setSlowWarning] = useState(false);
  const [result, setResult]         = useState<DocInfo | null>(null);
  const inputRef                    = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    if (!picked) return;
    if (!ALLOWED.some(ext => picked.name.toLowerCase().endsWith(ext))) {
      setError(`Unsupported file type. Allowed: ${ALLOWED.join(", ")}`);
      setState("error");
      return;
    }
    setError(null);
    setFile(picked);
    setState("selected");
  }

  async function handleUpload() {
    if (!file) return;
    setError(null);
    setSlowWarning(false);
    setState("uploading");

    const slowTimer = setTimeout(() => setSlowWarning(true), 2400);
    try {
      const res = await uploadFile(file);
      clearTimeout(slowTimer);
      const info: DocInfo = {
        documentId: res.document_id,
        filename:   res.filename,
        chunks:     res.chunks_created,
      };
      setResult(info);
      setState("done");
      onUploadComplete(info);
      onDocumentAdded?.();
    } catch (err) {
      clearTimeout(slowTimer);
      setError(err instanceof Error ? err.message : "Upload failed");
      setState("error");
    } finally {
      setSlowWarning(false);
    }
  }

  function reset() {
    setFile(null);
    setError(null);
    setSlowWarning(false);
    setResult(null);
    setState("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  const isIdle      = state === "idle" || state === "selected";
  const isUploading = state === "uploading";
  const isDone      = state === "done";
  const isError     = state === "error";

  return (
    <div className="sf-panel" style={{ padding: 28, position: "relative" }}>
      <span className="sf-reg sf-reg-tl" />
      <span className="sf-reg sf-reg-tr" />
      <span className="sf-reg sf-reg-bl" />
      <span className="sf-reg sf-reg-br" />

      <p className="sf-kicker" style={{ marginBottom: 18 }}>Document Upload</p>

      {/* Idle / Selected */}
      {isIdle && (
        <>
          <div
            onClick={() => inputRef.current?.click()}
            style={{
              border: `1px dashed ${state === "selected" ? "var(--ln-accent)" : "var(--ln-hair-strong)"}`,
              borderRadius: "var(--radius-lg)",
              padding: "36px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: state === "selected"
                ? "color-mix(in srgb, var(--ln-accent) 6%, transparent)"
                : "transparent",
              transition: "border-color 0.15s, background 0.15s",
              marginBottom: 14,
            }}
            onMouseEnter={e => {
              if (state !== "selected")
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--ln-ink-subtle)";
            }}
            onMouseLeave={e => {
              if (state !== "selected")
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--ln-hair-strong)";
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={onFileChange}
              style={{ display: "none" }}
            />
            {state === "selected" && file ? (
              <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ln-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 10px", display: "block" }} aria-hidden>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, wordBreak: "break-all", color: "var(--ln-ink)" }}>{file.name}</p>
                <p style={{ fontSize: 12, color: "var(--ln-ink-subtle)" }}>
                  {(file.size / 1024).toFixed(0)} KB · Click to change
                </p>
              </>
            ) : (
              <>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: "var(--radius-md)",
                  background: "var(--ln-s2)",
                  border: "1px solid var(--ln-hair)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ln-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: "var(--ln-ink)" }}>Click to select a file</p>
                <p style={{ fontSize: 12, color: "var(--ln-ink-subtle)" }}>PDF, DOCX, or TXT</p>
              </>
            )}
          </div>

          <button
            className="sf-btn sf-btn-primary"
            style={{ width: "100%" }}
            onClick={handleUpload}
            disabled={state !== "selected"}
          >
            Upload document
          </button>
          <p style={{ marginTop: 10, fontSize: 12, color: "var(--ln-ink-tertiary)", textAlign: "center" }}>
            {state === "selected" ? "Takes about 20 seconds" : "Add a document to continue."}
          </p>
        </>
      )}

      {/* Uploading */}
      {isUploading && (
        <div style={{ padding: "24px 0", textAlign: "center" }}>
          <div style={{
            width: 32, height: 32,
            border: "2px solid var(--ln-hair)",
            borderTopColor: "var(--ln-accent)",
            borderRadius: "50%",
            animation: "sf-spin 0.75s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p style={{ fontWeight: 500, marginBottom: 6, wordBreak: "break-all", color: "var(--ln-ink)", fontSize: 14 }}>{file?.name}</p>
          <p className="sf-label">Uploading and indexing…</p>
          {slowWarning && (
            <div className="sf-alert sf-alert-warm" style={{ marginTop: 16, textAlign: "left" }}>
              Server is waking up. This can take 30–60 seconds on first request.
            </div>
          )}
        </div>
      )}

      {/* Done */}
      {isDone && result && (
        <>
          <div className="sf-alert sf-alert-ok" style={{ marginBottom: 16 }}>
            Document uploaded and indexed successfully.
          </div>
          <div style={{
            background: "var(--ln-s2)",
            border: "1px solid var(--ln-hair)",
            borderRadius: "var(--radius-md)",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 16,
          }}>
            {([
              ["Filename",       result.filename],
              ["Document ID",    result.documentId],
              ["Chunks indexed", String(result.chunks)],
            ] as const).map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                <span className="sf-label">{label}</span>
                <span style={{
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--ln-ink-muted)",
                  wordBreak: "break-all",
                  textAlign: "right",
                  maxWidth: "60%",
                }}>{value}</span>
              </div>
            ))}
          </div>
          <button className="sf-btn sf-btn-ghost" style={{ width: "100%" }} onClick={reset}>
            Replace document
          </button>
        </>
      )}

      {/* Error */}
      {isError && (
        <>
          <div className="sf-alert sf-alert-bad" style={{ marginBottom: 14 }}>{error}</div>
          <button className="sf-btn sf-btn-ghost" style={{ width: "100%" }} onClick={reset}>
            Try again
          </button>
        </>
      )}
    </div>
  );
}
