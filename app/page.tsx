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
    a: "Roughly 26 to 28, the great majority of the approximately 30 to 32 total.",
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
  filename: "Sample: Cell Respiration.pdf",
  chunks: 0,
};

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [heroCard, setHeroCard] = useState(0);
  const [heroFlipped, setHeroFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "flashcards" | "quiz">("notes");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const uploadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("studyforge-theme") as "light" | "dark" | null;
    if (stored) setTheme(stored);
  }, []);

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

  const W = {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 40px",
  } as const;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <DocumentSidebar
        onSelectDocument={handleSelectDocument}
        onNewUpload={handleNewUpload}
        activeDocumentId={docInfo?.documentId ?? null}
        refreshTrigger={refreshTrigger}
      />

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Header */}
        <header
          className="sf-panel-glass"
          style={{ position: "sticky", top: 0, zIndex: 50 }}
        >
          <div style={{
            ...W,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect width="24" height="24" rx="6" fill="var(--ln-accent)" />
                <text x="12" y="17" textAnchor="middle" fontFamily="Inter" fontSize="12" fontWeight="600" fill="white">SF</text>
              </svg>
              <span style={{
                fontFamily: "var(--font-heading)",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "var(--ln-ink)",
              }}>
                StudyForge
              </span>
            </div>

            {/* Right controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {docInfo && (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 10px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 12,
                  fontWeight: 400,
                  background: "var(--ln-s1)",
                  color: "var(--ln-ink-subtle)",
                  border: "1px solid var(--ln-hair)",
                  maxWidth: 240,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ln-accent)", display: "inline-block", flexShrink: 0 }} />
                  {docInfo.filename}
                </span>
              )}

              <button
                className="sf-btn sf-btn-ghost"
                style={{ fontSize: 13 }}
                onClick={() => { setDocInfo(null); setTimeout(scrollToUpload, 60); }}
              >
                New session
              </button>

              <AuthButton onOpenModal={() => setAuthModalOpen(true)} />

              <button
                onClick={toggleTheme}
                className="sf-btn sf-btn-ghost"
                style={{ fontSize: 13 }}
                aria-label="Toggle theme"
              >
                {theme === "light" ? "Dark" : "Light"}
              </button>
            </div>
          </div>
        </header>

        {/* Landing */}
        {!docInfo && (
          <main style={{ flex: 1 }}>
            {/* Hero */}
            <div style={{ ...W, padding: "80px 40px 0" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, .9fr)",
                gap: 80,
                alignItems: "center",
              }}>
                {/* Left */}
                <div>
                  <p style={{
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                    color: "var(--ln-ink-subtle)",
                    marginBottom: 32,
                  }}>
                    Document-grounded study
                  </p>

                  <h1 style={{
                    fontSize: 72,
                    fontWeight: 600,
                    lineHeight: 1.02,
                    letterSpacing: "-3px",
                    maxWidth: "14ch",
                    marginBottom: 24,
                    color: "var(--ln-ink)",
                  }}>
                    Turn any document into a{" "}
                    <span className="sf-shimmer">study session.</span>
                  </h1>

                  <p style={{
                    fontSize: 18,
                    lineHeight: 1.6,
                    color: "var(--ln-ink-subtle)",
                    maxWidth: "44ch",
                    marginBottom: 40,
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                  }}>
                    Upload a PDF, DOCX, or TXT. Enter a topic. Get structured notes, flashcards, and a quiz grounded in your source.
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="sf-btn sf-btn-primary"
                      style={{ fontSize: 14, padding: "10px 20px" }}
                      onClick={scrollToUpload}
                    >
                      Upload a document
                    </button>
                    <button
                      className="sf-btn sf-btn-secondary"
                      style={{ fontSize: 14, padding: "10px 20px" }}
                      onClick={openSampleSession}
                    >
                      Open sample session
                    </button>
                  </div>
                </div>

                {/* Right — sample card */}
                <div style={{ position: "relative", paddingBottom: 24, paddingRight: 18 }}>
                  {/* Ghost layer 2 */}
                  <div style={{
                    position: "absolute",
                    left: 36,
                    right: -18,
                    top: 28,
                    bottom: -24,
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--ln-hair)",
                    background: "var(--ln-canvas)",
                    zIndex: 0,
                    pointerEvents: "none",
                  }} />
                  {/* Ghost layer 1 */}
                  <div style={{
                    position: "absolute",
                    left: 18,
                    right: -9,
                    top: 14,
                    bottom: -12,
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--ln-hair)",
                    background: "var(--ln-s1)",
                    zIndex: 1,
                    pointerEvents: "none",
                  }} />
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
              <hr className="sf-rule" style={{ margin: "96px 0 48px" }} />
              <div ref={uploadRef} style={{ maxWidth: 480 }}>
                <FileUpload
                  onUploadComplete={setDocInfo}
                  onDocumentAdded={() => setRefreshTrigger(t => t + 1)}
                />
              </div>
            </div>

            {/* Step grid */}
            <div style={{
              ...W,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              padding: "80px 40px 96px",
            }}>
              {STEPS.map(step => (
                <StepCell key={step.num} num={step.num} title={step.title} body={step.body} />
              ))}
            </div>
          </main>
        )}

        {/* Generators */}
        {docInfo && (
          <section className="sf-generators" style={{ ...W, padding: "0 40px 100px", flex: 1 }}>

            {/* Tab bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--ln-hair)",
              marginBottom: 48,
              paddingTop: 40,
            }}>
              <div style={{ display: "flex", gap: 0 }}>
                {(["notes", "flashcards", "quiz"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom: activeTab === tab
                        ? "2px solid var(--ln-accent)"
                        : "2px solid transparent",
                      padding: "10px 20px",
                      marginBottom: -1,
                      fontSize: 14,
                      fontWeight: activeTab === tab ? 500 : 400,
                      color: activeTab === tab
                        ? "var(--ln-ink)"
                        : "var(--ln-ink-subtle)",
                      cursor: "pointer",
                      textTransform: "capitalize",
                      transition: "color .15s, border-color .15s",
                      fontFamily: "var(--font-body)",
                      letterSpacing: 0,
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div key={activeTab} style={{ animation: "sf-in .2s ease both" }}>
              {activeTab === "notes"      && <NoteCard documentId={docInfo.documentId} index={1} />}
              {activeTab === "flashcards" && <FlashCardComponent documentId={docInfo.documentId} index={2} />}
              {activeTab === "quiz"       && <QuizCard documentId={docInfo.documentId} index={3} />}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer style={{
          padding: "24px 40px",
          borderTop: "1px solid var(--ln-hair)",
          fontSize: 12,
          color: "var(--ln-ink-tertiary)",
          display: "flex",
          gap: 32,
          flexWrap: "wrap",
        }}>
          <span>StudyForge</span>
          <span>Notes, flashcards, and quizzes grounded in your own documents.</span>
        </footer>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

/* ── Hero card ───────────────────────────────────── */
function HeroCard({
  sample, heroCard, heroFlipped, setHeroFlipped, onNext, total,
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
        border: `1px solid ${hovered ? "var(--ln-hair-strong)" : "var(--ln-hair)"}`,
        borderRadius: "var(--radius-lg)",
        background: "var(--ln-s1)",
        padding: 32,
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform .4s cubic-bezier(.2,.7,.2,1), border-color .2s ease",
        userSelect: "none",
      }}
    >
      {/* Card header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 28,
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.4px",
          textTransform: "uppercase",
          color: "var(--ln-ink-subtle)",
        }}>
          {heroFlipped ? "Answer" : "Sample Card"}
        </span>
        <span style={{
          fontSize: 12,
          color: "var(--ln-ink-tertiary)",
          fontVariantNumeric: "tabular-nums",
        }}>
          {heroCard + 1}/{total}
        </span>
      </div>

      {/* Card face */}
      <div style={{
        minHeight: 120,
        display: "flex",
        alignItems: "center",
        fontSize: 20,
        fontWeight: 500,
        lineHeight: 1.45,
        letterSpacing: "-0.02em",
        color: "var(--ln-ink)",
        transition: "opacity .2s ease",
      }}>
        {heroFlipped ? sample.a : sample.q}
      </div>

      {/* Divider */}
      <div style={{
        height: 1,
        background: "var(--ln-hair)",
        margin: "24px 0",
      }} />

      {/* Card footer */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        onClick={e => e.stopPropagation()}
      >
        <span style={{ fontSize: 12, color: "var(--ln-ink-tertiary)" }}>
          {heroFlipped ? `Source, page ${sample.page}` : "Click to reveal"}
        </span>
        <button
          className="sf-btn sf-btn-ghost"
          style={{ fontSize: 12, padding: "5px 10px" }}
          onClick={e => { e.stopPropagation(); onNext(); }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ── Step cell ───────────────────────────────────── */
function StepCell({ num, title, body }: { num: string; title: string; body: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        border: `1px solid ${hovered ? "var(--ln-hair-strong)" : "var(--ln-hair)"}`,
        borderRadius: "var(--radius-lg)",
        padding: 24,
        background: "var(--ln-s1)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "border-color .2s ease, transform .3s cubic-bezier(.2,.7,.2,1)",
        cursor: "default",
      }}
    >
      <div style={{
        fontSize: 32,
        fontWeight: 600,
        letterSpacing: "-0.04em",
        color: "var(--ln-hair-tertiary)",
        lineHeight: 1,
        marginBottom: 36,
        fontVariantNumeric: "tabular-nums",
      }}>
        {num}
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: "var(--ln-ink)", letterSpacing: "-0.01em" }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: "var(--ln-ink-subtle)", lineHeight: 1.6 }}>
        {body}
      </p>
    </div>
  );
}
