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

  const isIdle     = state === "idle"     || state === "selected";
  const isUploading = state === "uploading";
  const isDone     = state === "done";
  const isError    = state === "error";

  return (
    <div className="sf-panel" style={{ padding: 32, position: "relative" }}>
      {/* Blueprint registration marks */}
      <span className="sf-reg sf-reg-tl" />
      <span className="sf-reg sf-reg-tr" />
      <span className="sf-reg sf-reg-bl" />
      <span className="sf-reg sf-reg-br" />

      <p className="sf-kicker" style={{ marginBottom: 20 }}>Document Upload</p>

      {/* ── Idle / Selected ── */}
      {isIdle && (
        <>
          <div
            onClick={() => inputRef.current?.click()}
            style={{
              border: `1.5px dashed ${state === "selected" ? "var(--color-accent)" : "var(--color-border)"}`,
              borderRadius: 12,
              padding: "40px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: state === "selected"
                ? "color-mix(in srgb, var(--color-accent) 5%, transparent)"
                : "transparent",
              transition: "border-color 0.15s, background 0.15s",
              marginBottom: 16,
            }}
            onMouseEnter={e => {
              if (state !== "selected")
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-accent)";
            }}
            onMouseLeave={e => {
              if (state !== "selected")
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 10px", display: "block" }} aria-hidden>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <p style={{ fontWeight: 700, marginBottom: 4, wordBreak: "break-all" }}>{file.name}</p>
                <p style={{ fontSize: 12.5, color: "var(--color-muted)" }}>
                  {(file.size / 1024).toFixed(0)} KB · Click to change
                </p>
              </>
            ) : (
              <>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--color-tag-bg)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>Click to select a file</p>
                <p style={{ fontSize: 12.5, color: "var(--color-muted)" }}>PDF, DOCX, or TXT</p>
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
          <p style={{ marginTop: 10, fontSize: 12, color: "var(--color-muted)", textAlign: "center" }}>
            {state === "selected"
              ? "Standard · about 20 seconds"
              : "Add a document to continue."}
          </p>
        </>
      )}

      {/* ── Uploading ── */}
      {isUploading && (
        <div style={{ padding: "28px 0", textAlign: "center" }}>
          <div style={{
            width: 36, height: 36,
            border: "3px solid var(--color-border)",
            borderTopColor: "var(--color-accent)",
            borderRadius: "50%",
            animation: "sf-spin 0.75s linear infinite",
            margin: "0 auto 18px",
          }} />
          <p style={{ fontWeight: 700, marginBottom: 6, wordBreak: "break-all" }}>{file?.name}</p>
          <p className="sf-label">Uploading and indexing…</p>
          {slowWarning && (
            <div className="sf-alert sf-alert-warm" style={{ marginTop: 18, textAlign: "left" }}>
              Server is waking up. This can take 30 to 60 seconds on first request.
            </div>
          )}
        </div>
      )}

      {/* ── Done ── */}
      {isDone && result && (
        <>
          <div className="sf-alert sf-alert-ok" style={{ marginBottom: 18 }}>
            Document uploaded and indexed successfully.
          </div>
          <div style={{
            background: "var(--color-input-bg)",
            borderRadius: 10,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 11,
            marginBottom: 18,
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
                  fontFamily: "monospace",
                  color: "var(--color-text)",
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

      {/* ── Error ── */}
      {isError && (
        <>
          <div className="sf-alert sf-alert-bad" style={{ marginBottom: 16 }}>{error}</div>
          <button className="sf-btn sf-btn-ghost" style={{ width: "100%" }} onClick={reset}>
            Try again
          </button>
        </>
      )}
    </div>
  );
}
