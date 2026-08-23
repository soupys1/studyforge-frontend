"use client";
import { useState } from "react";
import { generateFlashcards } from "@/lib/api";

interface FlashCard {
  card_id: string;
  front_face: string;
  back_face: string;
}

interface FlashCardSet {
  set_id: string;
  cards: FlashCard[];
}

interface FlashCardProps {
  documentId: string;
  index: number;
}

export default function FlashCardComponent({ documentId, index }: FlashCardProps) {
  const [topic,   setTopic]   = useState("");
  const [cardset, setCardset] = useState<FlashCardSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known,   setKnown]   = useState<Set<number>>(new Set());

  async function handleFlashcards() {
    if (!topic.trim()) return;
    setError(null);
    setCardset(null);
    setCurrent(0);
    setFlipped(false);
    setKnown(new Set());
    setLoading(true);
    try {
      const res = await generateFlashcards(documentId, topic);
      setCardset(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function advance() {
    setFlipped(false);
    setCurrent(c => (cardset ? (c + 1) % cardset.cards.length : 0));
  }

  function handleKnewIt() {
    setKnown(prev => new Set([...prev, current]));
    advance();
  }

  function handleReviewAgain() {
    setKnown(prev => {
      const next = new Set(prev);
      next.delete(current);
      return next;
    });
    advance();
  }

  function handleSkip() {
    advance();
  }

  const card  = cardset?.cards[current];
  const total = cardset?.cards.length ?? 0;

  return (
    <div className="sf-generator">
      {/* ── Sidebar ── */}
      <div>
        <span style={{
          fontFamily: "var(--font-heading)",
          fontSize: 68,
          fontWeight: 500,
          color: "var(--sf-ink)",
          lineHeight: 1,
          display: "block",
          marginBottom: 10,
          fontVariantNumeric: "tabular-nums",
        }}>
          0{index}
        </span>

        <h3 style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-.01em", marginBottom: 12 }}>
          Flashcards
        </h3>
        <p style={{ fontSize: 13.5, color: "var(--color-neutral-500)", lineHeight: 1.56, marginBottom: 24 }}>
          Q&A pairs for active recall. Click any card to reveal the answer.
        </p>

        <input
          className="sf-input"
          type="text"
          placeholder="Enter topic…"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleFlashcards()}
          style={{ marginBottom: 16 }}
        />
        <button
          className="sf-btn sf-btn-primary"
          style={{ width: "100%" }}
          onClick={handleFlashcards}
          disabled={!topic.trim() || loading}
        >
          {loading ? "Generating…" : "Generate flashcards"}
        </button>

        {/* Progress counter */}
        {cardset && (
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid var(--color-neutral-900)" }}>
            <p className="sf-label" style={{ marginBottom: 10 }}>Progress</p>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontSize: 40,
              fontWeight: 500,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}>
              {known.size}
              <span style={{
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: ".08em",
                color: "var(--color-neutral-600)",
                marginLeft: 6,
                textTransform: "uppercase",
              }}>
                / {total} known
              </span>
            </p>
          </div>
        )}
      </div>

      {/* ── Output ── */}
      <div className="sf-panel" style={{ padding: 32, minHeight: 180 }}>

        {/* Ghost */}
        {!cardset && !loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skeleton" style={{ height: 160, borderRadius: "var(--radius-lg)", opacity: 0.3 }} />
            <div style={{ marginTop: 8 }}>
              <p className="sf-label">Enter a topic on the left and click <strong style={{ fontWeight: 500, color: "var(--color-neutral-400)" }}>Generate flashcards</strong> to begin drilling.</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skeleton" style={{ height: 180, borderRadius: "var(--radius-lg)" }} />
            <div style={{ marginTop: 6 }}>
              <p className="sf-label" style={{ animation: "sf-pulse 1.2s ease-in-out infinite" }}>
                Building flashcard set…
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="sf-alert sf-alert-bad">{error}</div>}

        {/* Card */}
        {cardset && card && (
          <div>
            {/* Pip strip */}
            <div style={{ display: "flex", gap: 3, marginBottom: "var(--space-8)" }}>
              {cardset.cards.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 999,
                    background: known.has(i)
                      ? "var(--color-accent)"
                      : i === current
                        ? "var(--color-neutral-500)"
                        : "var(--color-neutral-900)",
                    transition: "background .25s ease",
                  }}
                />
              ))}
            </div>

            {/* Card face (tilt approach, no 3D flip) */}
            <FlashCardFace
              card={card}
              flipped={flipped}
              onFlip={() => setFlipped(f => !f)}
            />

            {/* Action row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
              marginTop: "var(--space-8)",
            }}>
              {!flipped ? (
                <>
                  <button
                    className="sf-btn sf-btn-primary"
                    style={{ fontSize: 14 }}
                    onClick={() => setFlipped(true)}
                  >
                    Reveal answer
                  </button>
                  <button
                    className="sf-btn sf-btn-ghost"
                    style={{ fontSize: 14 }}
                    onClick={handleSkip}
                  >
                    Skip
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="sf-btn sf-btn-primary"
                    style={{ fontSize: 14 }}
                    onClick={handleKnewIt}
                  >
                    Knew it
                  </button>
                  <button
                    className="sf-btn sf-btn-secondary"
                    style={{ fontSize: 14 }}
                    onClick={handleReviewAgain}
                  >
                    Review again
                  </button>
                </>
              )}
              {/* Spacer + counter */}
              <div style={{ flex: 1 }} />
              <span style={{
                fontSize: 12,
                color: "var(--color-neutral-700)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {known.size} of {total} marked known
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Card face sub-component ─────────────────────── */
function FlashCardFace({
  card,
  flipped,
  onFlip,
}: {
  card: { front_face: string; back_face: string };
  flipped: boolean;
  onFlip: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onFlip}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${hovered && !flipped ? "var(--color-neutral-700)" : "var(--color-neutral-800)"}`,
        borderRadius: "var(--radius-lg)",
        background: "linear-gradient(180deg, var(--sf-surface-top), var(--sf-fade))",
        boxShadow: "var(--shadow-md)",
        padding: "48px 40px",
        minHeight: 240,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        cursor: "pointer",
        transform: flipped ? "rotateX(0)" : "rotateX(2deg)",
        transition: "transform .4s cubic-bezier(.2,.7,.2,1), border-color .3s ease",
        userSelect: "none",
      }}
    >
      {/* Accent edge-light at 15% insets */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "15%",
        right: "15%",
        height: 1,
        background: "linear-gradient(90deg, transparent, var(--color-accent), transparent)",
        pointerEvents: "none",
      }} />

      {/* Side label */}
      <div style={{
        fontSize: 11,
        fontWeight: 400,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: "var(--color-accent-300)",
        marginBottom: "var(--space-8)",
      }}>
        {flipped ? "Answer" : "Prompt"}
      </div>

      {/* Face text */}
      <div style={{
        fontSize: 24,
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: "-.02em",
      }}>
        {flipped ? card.back_face : card.front_face}
      </div>

      {/* Hint */}
      <div style={{
        fontSize: 12,
        color: "var(--color-neutral-600)",
        marginTop: "var(--space-8)",
      }}>
        {flipped ? "Answer revealed" : "Click to reveal"}
      </div>
    </div>
  );
}
