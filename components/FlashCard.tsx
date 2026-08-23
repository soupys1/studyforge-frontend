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

  const card  = cardset?.cards[current];
  const total = cardset?.cards.length ?? 0;

  return (
    <div className="sf-generator">
      {/* Sidebar */}
      <div>
        <span style={{
          fontFamily: "var(--font-heading)",
          fontSize: 56,
          fontWeight: 600,
          color: "var(--ln-hair-tertiary)",
          lineHeight: 1,
          display: "block",
          marginBottom: 12,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.04em",
        }}>
          0{index}
        </span>

        <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 8, color: "var(--ln-ink)" }}>
          Flashcards
        </h3>
        <p style={{ fontSize: 13.5, color: "var(--ln-ink-subtle)", lineHeight: 1.56, marginBottom: 24 }}>
          Q&A pairs for active recall. Click any card to reveal the answer.
        </p>

        <input
          className="sf-input"
          type="text"
          placeholder="Enter topic…"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleFlashcards()}
          style={{ marginBottom: 10 }}
        />
        <button
          className="sf-btn sf-btn-primary"
          style={{ width: "100%" }}
          onClick={handleFlashcards}
          disabled={!topic.trim() || loading}
        >
          {loading ? "Generating…" : "Generate flashcards"}
        </button>

        {/* Progress */}
        {cardset && (
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid var(--ln-hair)" }}>
            <p className="sf-label" style={{ marginBottom: 8 }}>Progress</p>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontSize: 36,
              fontWeight: 600,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.04em",
              color: "var(--ln-ink)",
            }}>
              {known.size}
              <span style={{
                fontSize: 13,
                fontWeight: 400,
                color: "var(--ln-ink-tertiary)",
                marginLeft: 6,
              }}>
                / {total} known
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Output */}
      <div className="sf-panel" style={{ padding: 32, minHeight: 180 }}>

        {/* Ghost */}
        {!cardset && !loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skeleton" style={{ height: 160, borderRadius: "var(--radius-lg)", opacity: 0.5 }} />
            <div style={{ marginTop: 8 }}>
              <p className="sf-label">Enter a topic on the left and click <strong style={{ fontWeight: 500, color: "var(--ln-ink-subtle)" }}>Generate flashcards</strong> to begin drilling.</p>
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

        {error && <div className="sf-alert sf-alert-bad">{error}</div>}

        {/* Card */}
        {cardset && card && (
          <div>
            {/* Pip strip */}
            <div style={{ display: "flex", gap: 3, marginBottom: 32 }}>
              {cardset.cards.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 2,
                    borderRadius: 999,
                    background: known.has(i)
                      ? "var(--ln-accent)"
                      : i === current
                        ? "var(--ln-ink-subtle)"
                        : "var(--ln-hair)",
                    transition: "background .2s ease",
                  }}
                />
              ))}
            </div>

            <FlashCardFace card={card} flipped={flipped} onFlip={() => setFlipped(f => !f)} />

            {/* Actions */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 24,
            }}>
              {!flipped ? (
                <>
                  <button className="sf-btn sf-btn-primary" style={{ fontSize: 14 }} onClick={() => setFlipped(true)}>
                    Reveal answer
                  </button>
                  <button className="sf-btn sf-btn-ghost" style={{ fontSize: 14 }} onClick={advance}>
                    Skip
                  </button>
                </>
              ) : (
                <>
                  <button className="sf-btn sf-btn-primary" style={{ fontSize: 14 }} onClick={handleKnewIt}>
                    Knew it
                  </button>
                  <button className="sf-btn sf-btn-secondary" style={{ fontSize: 14 }} onClick={handleReviewAgain}>
                    Review again
                  </button>
                </>
              )}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: "var(--ln-ink-tertiary)", fontVariantNumeric: "tabular-nums" }}>
                {known.size} of {total} marked known
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FlashCardFace({
  card, flipped, onFlip,
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
        border: `1px solid ${flipped ? "var(--ln-accent)" : hovered ? "var(--ln-hair-strong)" : "var(--ln-hair)"}`,
        borderRadius: "var(--radius-lg)",
        background: flipped ? "color-mix(in srgb, var(--ln-accent) 8%, var(--ln-s2))" : "var(--ln-s2)",
        padding: "40px 36px",
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        cursor: "pointer",
        transition: "border-color .2s ease, background .2s ease",
        userSelect: "none",
      }}
    >
      <div style={{
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.4px",
        textTransform: "uppercase",
        color: flipped ? "var(--ln-accent-hover)" : "var(--ln-ink-subtle)",
        marginBottom: 20,
        transition: "color .2s ease",
      }}>
        {flipped ? "Answer" : "Prompt"}
      </div>

      <div style={{
        fontSize: 22,
        fontWeight: 500,
        lineHeight: 1.45,
        letterSpacing: "-0.02em",
        color: "var(--ln-ink)",
      }}>
        {flipped ? card.back_face : card.front_face}
      </div>

      <div style={{ fontSize: 12, color: "var(--ln-ink-tertiary)", marginTop: 20 }}>
        {flipped ? "Answer revealed" : "Click to reveal"}
      </div>
    </div>
  );
}
