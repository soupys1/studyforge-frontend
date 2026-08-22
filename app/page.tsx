"use client";
import { useEffect, useRef, useState } from "react";
import FileUpload from "@/components/FileUpload";
import NoteCard from "@/components/NoteCard";
import QuizCard from "@/components/QuizCard";
import FlashCardComponent from "@/components/FlashCard";
import AuthButton from "@/components/AuthButton";
import AuthModal from "@/components/AuthModal";
import DocumentSidebar from "@/components/DocumentSidebar";
import { useAuth } from "@/hooks/useAuth";
import type { DocInfo } from "@/components/FileUpload";

/* ── Sample flashcard data ────────────────────────── */
const SAMPLE_CARDS = [
  {
    q: "What is the terminal electron acceptor of the electron transport chain?",
    a: "Oxygen. It accepts electrons at complex IV and is reduced to water.",
    page: 105,
  },
  {
    q: "Where does glycolysis take place?",
    a: "In the cytosol, not the mitochondrion.",
    page: 96,
  },
  {
    q: "What does the folding of the inner membrane into cristae achieve?",
    a: "It multiplies the surface area for the electron transport chain and ATP synthase.",
    page: 92,
  },
  {
    q: "How many ATP does oxidative phosphorylation contribute per glucose?",
    a: "Roughly 26 to 28 — the great majority of the approximately 30 to 32 total.",
    page: 101,
  },
  {
    q: "What powers ATP synthase?",
    a: "Protons flowing back into the matrix down the gradient built by complexes I, III and IV.",
    page: 104,
  },
  {
    q: "Why does the citric acid cycle stop without oxygen?",
    a: "The chain backs up, so NAD+ is never regenerated and the cycle runs out of its oxidising agent.",
    page: 105,
  },
];

const DEMO_DOC: DocInfo = {
  documentId: "demo",
  filename: "Sample — Cell Respiration.pdf",
  chunks: 0,
};

/* ── Step bento cells ────────────────────────────── */
const STEPS = [
  {
    num: "01",
    title: "Upload",
    body: "Your file is chunked and embedded. Nothing is generated from outside it.",
  },
  {
    num: "02",
    title: "Generate",
    body: "Name a topic. Retrieval pulls the relevant passages and writes the material.",
  },
  {
    num: "03",
    title: "Study",
    body: "Read the notes, drill the cards, take the quiz. Every answer cites its page.",
  },
];

export default function Home() {
  const { user } = useAuth();
  const [docInfo, setDocInfo] = useState<DocInfo | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [heroCard, setHeroCard] = useState(0);
  const [heroFlipped, setHeroFlipped] = useState(false);

  const uploadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("studyforge-theme") as "light" | "dark" | null;
    setTheme(stored ?? "dark");
  }, []);

  useEffect(() => {
    if (!user) setDocInfo(null);
  }, [user]);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("studyforge-theme", next);
  }

  function handleSelectDocument(documentId: string, filename: string) {
    setDocInfo({ documentId, filename, chunks: 0 });
  }

  function handleNewUpload() {
    setDocInfo(null);
  }

  function scrollToUpload() {
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function openSampleSession() {
    setDocInfo(DEMO_DOC);
  }

  function nextHeroCard() {
    setHeroCard(c => (c + 1) % SAMPLE_CARDS.length);
    setHeroFlipped(false);
  }

  const sample = SAMPLE_CARDS[heroCard];

  /* ── Shared width constraint ─────────────────── */
  const W = {
    maxWidth: 1240,
    margin: "0 auto",
    padding: "0 40px",
  } as const;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Sidebar (signed-in only) ───────────────── */}
      <DocumentSidebar
        onSelectDocument={handleSelectDocument}
        onNewUpload={handleNewUpload}
        activeDocumentId={docInfo?.documentId ?? null}
        refreshTrigger={refreshTrigger}
      />

      {/* ── Main ──────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* ── Header ──────────────────────────────── */}
        <header
          className="sf-panel-glass"
          style={{
            borderRadius: 0,
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{
            ...W,
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}>
            {/* Logo + wordmark + RAG pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
                <rect width="26" height="26" rx="6" fill="var(--color-accent)" />
                <text x="13" y="19" textAnchor="middle" fontFamily="Inter" fontSize="13" fontWeight="500" fill="white">SF</text>
              </svg>
              <span style={{
                fontFamily: "var(--font-heading)",
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: ".02em",
              }}>
                StudyForge
              </span>
              {/* RAG pill chip */}
              <span style={{
                fontSize: 10,
                fontWeight: 400,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--color-neutral-600)",
                border: "1px solid var(--color-neutral-800)",
                borderRadius: 999,
                padding: "3px 8px",
                lineHeight: 1,
              }}>
                RAG
              </span>
            </div>

            {/* Right controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {docInfo && (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 400,
                  letterSpacing: ".10em",
                  textTransform: "uppercase",
                  background: "var(--color-accent-900)",
                  color: "var(--color-accent-300)",
                  border: "1px solid var(--color-accent-800)",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-accent)", display: "inline-block" }} />
                  {docInfo.filename}
                </span>
              )}

              <button
                className="sf-btn sf-btn-primary"
                style={{ padding: "7px 14px", fontSize: 13 }}
                onClick={() => setDocInfo(null)}
              >
                New session
              </button>

              <AuthButton onOpenModal={() => setAuthModalOpen(true)} />

              <button
                onClick={toggleTheme}
                className="sf-btn sf-btn-ghost"
                style={{ padding: "7px 14px" }}
                aria-label="Toggle theme"
              >
                {theme === "light" ? "Dark" : "Light"}
              </button>
            </div>
          </div>
        </header>

        {/* ── Landing (no doc) ────────────────────── */}
        {!docInfo && (
          <main>
            {/* Hero section */}
            <div style={{
              backgroundImage: "radial-gradient(120% 80% at 78% -10%, var(--sf-hero-grad) 0%, transparent 62%)",
            }}>
              <div style={{
                ...W,
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, .95fr)",
                gap: 72,
                alignItems: "center",
                padding: "72px 40px 0",
              }}>
                {/* Left col */}
                <div>
                  {/* Live badge */}
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "var(--color-accent-900)",
                    border: "1px solid var(--color-accent-800)",
                    color: "var(--color-accent-200)",
                    fontSize: 11,
                    fontWeight: 400,
                    letterSpacing: ".10em",
                    textTransform: "uppercase",
                    marginBottom: 36,
                  }}>
                    <span
                      className="sf-blink"
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "var(--color-accent)",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    Grounded in your source
                  </div>

                  {/* h1 */}
                  <h1 style={{
                    fontSize: 72,
                    fontWeight: 500,
                    lineHeight: .98,
                    letterSpacing: "-.04em",
                    maxWidth: "14ch",
                    marginBottom: 28,
                  }}>
                    Turn any document into a{" "}
                    <span className="sf-shimmer">study session.</span>
                  </h1>

                  {/* Lead paragraph */}
                  <p style={{
                    fontSize: 18,
                    lineHeight: 1.65,
                    color: "var(--color-neutral-400)",
                    maxWidth: "48ch",
                    marginBottom: 36,
                  }}>
                    Upload a PDF, DOCX, or TXT file. Enter a topic. Get back structured notes, flashcards, and a quiz, all grounded in your source material.
                  </p>

                  {/* CTA buttons */}
                  <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", marginTop: 36 }}>
                    <button
                      className="sf-btn sf-btn-primary"
                      style={{ fontSize: 15, padding: "13px 24px" }}
                      onClick={scrollToUpload}
                    >
                      Upload a document
                    </button>
                    <button
                      className="sf-btn sf-btn-ghost"
                      style={{ fontSize: 15, padding: "13px 20px" }}
                      onClick={openSampleSession}
                    >
                      Open a sample session →
                    </button>
                  </div>
                </div>

                {/* Right col — interactive sample card stack */}
                <div style={{ position: "relative", paddingBottom: 26, paddingRight: 20 }}>
                  {/* Ambient glow */}
                  <div style={{
                    position: "absolute",
                    inset: "-80px -40px 20px",
                    borderRadius: "50%",
                    background: "radial-gradient(closest-side, var(--sf-glow), transparent)",
                    pointerEvents: "none",
                    zIndex: 0,
                  }} />

                  {/* Ghost layer 2 (bottom) */}
                  <div style={{
                    position: "absolute",
                    left: 38,
                    right: -20,
                    top: 30,
                    bottom: -26,
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--sf-ghost2-line)",
                    zIndex: 0,
                    pointerEvents: "none",
                  }} />

                  {/* Ghost layer 1 */}
                  <div style={{
                    position: "absolute",
                    left: 20,
                    right: -10,
                    top: 16,
                    bottom: -14,
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-neutral-900)",
                    background: "var(--sf-ghost1)",
                    zIndex: 1,
                    pointerEvents: "none",
                  }} />

                  {/* Main card */}
                  <HeroCard
                    sample={sample}
                    heroCard={heroCard}
                    heroFlipped={heroFlipped}
                    setHeroFlipped={setHeroFlipped}
                    onNext={nextHeroCard}
                    total={SAMPLE_CARDS.length}
                  />
                </div>
              </div>
            </div>

            {/* Upload section */}
            <div style={{ ...W, padding: "0 40px" }}>
              {/* Fading hairline */}
              <hr className="sf-rule" style={{ margin: "96px 0 var(--space-8)" }} />

              {/* Upload component */}
              <div ref={uploadRef} style={{ maxWidth: 480 }}>
                <FileUpload
                  onUploadComplete={setDocInfo}
                  onDocumentAdded={() => setRefreshTrigger(t => t + 1)}
                />
              </div>
            </div>

            {/* Step bento grid */}
            <div style={{
              ...W,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "var(--space-6)",
              padding: "80px 40px 96px",
            }}>
              {STEPS.map(step => (
                <StepCell key={step.num} num={step.num} title={step.title} body={step.body} />
              ))}
            </div>
          </main>
        )}

        {/* ── Generators (with doc) ───────────────── */}
        {docInfo && (
          <section className="sf-generators" style={{ ...W, padding: "0 40px 100px" }}>
            <div style={{
              paddingTop: 56,
              marginBottom: 60,
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              borderTop: "1px solid var(--color-neutral-900)",
            }}>
              <h2 style={{
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: ".14em",
                textTransform: "uppercase",
              }}>
                Study Materials
              </h2>
              {docInfo.chunks > 0 && (
                <span className="sf-label">{docInfo.chunks} source chunks indexed</span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
              <NoteCard documentId={docInfo.documentId} index={1} />
              <hr className="sf-rule" />
              <FlashCardComponent documentId={docInfo.documentId} index={2} />
              <hr className="sf-rule" />
              <QuizCard documentId={docInfo.documentId} index={3} />
            </div>
          </section>
        )}

        {/* ── Footer ──────────────────────────────── */}
        <footer style={{
          padding: "var(--space-6) 40px",
          borderTop: "1px solid var(--color-neutral-900)",
          fontSize: 12,
          color: "var(--color-neutral-700)",
          display: "flex",
          gap: "var(--space-8)",
          flexWrap: "wrap",
        }}>
          <span>StudyForge</span>
          <span>AI-powered study tool</span>
          <span>Notes, flashcards, and quizzes generated via RAG from your own documents.</span>
        </footer>
      </div>

      {/* ── Auth Modal ────────────────────────────── */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

/* ── Hero card component ─────────────────────────── */
function HeroCard({
  sample,
  heroCard,
  heroFlipped,
  setHeroFlipped,
  onNext,
  total,
}: {
  sample: typeof SAMPLE_CARDS[0];
  heroCard: number;
  heroFlipped: boolean;
  setHeroFlipped: (v: boolean | ((prev: boolean) => boolean)) => void;
  onNext: () => void;
  total: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => setHeroFlipped(f => !f)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        zIndex: 2,
        border: `1px solid ${hovered ? "var(--color-neutral-700)" : "var(--color-neutral-800)"}`,
        borderRadius: "var(--radius-lg)",
        background: "linear-gradient(180deg, var(--sf-surface-top), var(--sf-fade))",
        boxShadow: "var(--shadow-md)",
        padding: "var(--space-8)",
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform .5s cubic-bezier(.2,.7,.2,1), border-color .3s ease",
        userSelect: "none",
      }}
    >
      {/* Accent edge-light */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "18%",
        right: "18%",
        height: 1,
        background: "linear-gradient(90deg, transparent, var(--color-accent), transparent)",
        pointerEvents: "none",
      }} />

      {/* Card header row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "var(--space-6)",
      }}>
        <span style={{
          fontSize: 11,
          letterSpacing: ".10em",
          textTransform: "uppercase",
          color: "var(--color-neutral-600)",
        }}>
          {heroFlipped ? "Answer" : "Sample Card"}
        </span>
        <span style={{
          fontSize: 11,
          letterSpacing: ".08em",
          color: "var(--color-neutral-600)",
          fontVariantNumeric: "tabular-nums",
        }}>
          {heroCard + 1}/{total}
        </span>
      </div>

      {/* Card face */}
      <div style={{
        minHeight: 132,
        display: "flex",
        alignItems: "center",
        fontSize: 21,
        fontWeight: 500,
        lineHeight: 1.4,
        transform: heroFlipped ? "rotateX(0) translateY(0)" : "rotateX(1.5deg) translateY(2px)",
        transition: "transform .45s cubic-bezier(.2,.7,.2,1)",
      }}>
        {heroFlipped ? sample.a : sample.q}
      </div>

      {/* Hairline divider */}
      <div style={{
        height: 1,
        background: "linear-gradient(90deg, transparent, var(--color-neutral-800) 40px, var(--color-neutral-800) calc(100% - 40px), transparent)",
        margin: "var(--space-8) 0",
      }} />

      {/* Card footer */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        onClick={e => e.stopPropagation()}
      >
        <span style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>
          {heroFlipped ? `Source page ${sample.page}` : "Click the card to reveal"}
        </span>
        <button
          className="sf-btn sf-btn-ghost"
          style={{ fontSize: 12, padding: "6px 12px" }}
          onClick={e => { e.stopPropagation(); onNext(); }}
        >
          Next card
        </button>
      </div>
    </div>
  );
}

/* ── Step bento cell ─────────────────────────────── */
function StepCell({ num, title, body }: { num: string; title: string; body: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${hovered ? "var(--color-neutral-700)" : "var(--color-neutral-900)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-8)",
        background: "linear-gradient(180deg, var(--sf-cell), var(--sf-fade))",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "border-color .3s ease, transform .4s cubic-bezier(.2,.7,.2,1)",
        cursor: "default",
      }}
    >
      {/* Accent edge-light (accent-600) */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "20%",
        right: "20%",
        height: 1,
        background: "linear-gradient(90deg, transparent, var(--color-accent-600), transparent)",
        pointerEvents: "none",
      }} />

      {/* Numeral */}
      <div style={{
        fontSize: 38,
        fontWeight: 500,
        letterSpacing: "-.04em",
        color: "var(--color-accent-800)",
        lineHeight: 1,
        marginBottom: 40,
        fontVariantNumeric: "tabular-nums",
      }}>
        {num}
      </div>

      <h3 style={{ fontSize: 17, fontWeight: 500, marginBottom: "var(--space-4)" }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--color-neutral-500)", lineHeight: 1.65 }}>{body}</p>
    </div>
  );
}
