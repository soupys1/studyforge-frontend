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

  function go(dir: "prev" | "next") {
    setFlipped(false);
    setCurrent(c => dir === "prev"
      ? Math.max(0, c - 1)
      : Math.min((cardset?.cards.length ?? 1) - 1, c + 1)
    );
  }

  function markKnown() {
    setKnown(prev => new Set([...prev, current]));
    setFlipped(false);
    if (cardset && current < cardset.cards.length - 1) {
      setCurrent(c => c + 1);
    }
  }

  const card  = cardset?.cards[current];
  const total = cardset?.cards.length ?? 0;

  return (
    <div className="sf-generator">
      {/* ── Sidebar ── */}
      <div>
        <span style={{
          fontFamily: '"Times New Roman", serif',
          fontSize: 68,
          color: "var(--sf-ink)",
          lineHeight: 1,
          display: "block",
          marginBottom: 10,
        }}>0{index}</span>

        <h3 style={{ fontSize: 18, letterSpacing: "0.04em", marginBottom: 12 }}>Flashcards</h3>
        <p style={{ fontSize: 13.5, color: "var(--color-muted)", lineHeight: 1.56, marginBottom: 24 }}>
          Q&A pairs for active recall. Click any card to reveal the answer.
        </p>

        <input
          className="sf-input"
          type="text"
          placeholder="Enter topic…"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleFlashcards()}
          style={{ marginBottom: 12 }}
        />
        <button
          className="sf-btn sf-btn-primary"
          style={{ width: "100%" }}
          onClick={handleFlashcards}
          disabled={!topic.trim() || loading}
        >
          {loading ? "Generating…" : "Generate flashcards"}
        </button>

        {cardset && (
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid var(--color-border)" }}>
            <p className="sf-label" style={{ marginBottom: 10 }}>Progress</p>
            <p style={{ fontFamily: '"Times New Roman", serif', fontSize: 40, lineHeight: 1 }}>
              {known.size}
              <span style={{
                fontSize: 13, fontFamily: "Arial", textTransform: "uppercase",
                letterSpacing: "0.08em", color: "var(--color-muted)", marginLeft: 6,
              }}>/ {total} known</span>
            </p>
          </div>
        )}
      </div>

      {/* ── Output ── */}
      <div className="sf-panel" style={{ padding: 32, minHeight: 180 }}>

        {/* Ghost */}
        {!cardset && !loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skeleton" style={{ height: 160, borderRadius: 14, opacity: 0.3 }} />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skeleton" style={{ height: 180, borderRadius: 14 }} />
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
            {/* Progress dots */}
            <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
              {cardset.cards.map((_, i) => (
                <div
                  key={i}
                  onClick={() => { setFlipped(false); setCurrent(i); }}
                  style={{
                    width: 9, height: 9, borderRadius: "50%", cursor: "pointer",
                    background: known.has(i)
                      ? "var(--sf-ok)"
                      : i === current
                        ? "var(--color-accent)"
                        : "var(--color-border)",
                    transition: "background 0.2s",
                  }}
                />
              ))}
            </div>

            {/* Flip card */}
            <div
              className="card-scene"
              style={{ height: 200, marginBottom: 20, cursor: "pointer", userSelect: "none" }}
              onClick={() => setFlipped(f => !f)}
            >
              <div className={`card-inner${flipped ? " flipped" : ""}`}>
                {/* Front */}
                <div className="card-face sf-panel">
                  <div>
                    <p className="sf-label" style={{ marginBottom: 12 }}>Question</p>
                    <p style={{ fontSize: 16, lineHeight: 1.55, fontWeight: 600 }}>
                      {card.front_face}
                    </p>
                    <p className="sf-label" style={{ marginTop: 18, opacity: 0.45 }}>
                      Tap to flip
                    </p>
                  </div>
                </div>
                {/* Back */}
                <div className="card-face card-face--back">
                  <div>
                    <p style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
                      textTransform: "uppercase", marginBottom: 12, opacity: 0.7,
                    }}>Answer</p>
                    <p style={{ fontSize: 16, lineHeight: 1.55, fontWeight: 600 }}>
                      {card.back_face}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 10 }}>
              <button
                className="sf-btn sf-btn-ghost"
                onClick={() => go("prev")}
                disabled={current === 0}
              >
                ← Prev
              </button>
              <button
                className="sf-btn sf-btn-primary"
                onClick={markKnown}
                disabled={known.has(current)}
                style={{ background: known.has(current) ? "var(--sf-ok)" : undefined }}
              >
                {known.has(current) ? "✓ Known" : "Mark known →"}
              </button>
              <button
                className="sf-btn sf-btn-ghost"
                onClick={() => go("next")}
                disabled={current === total - 1}
              >
                Next →
              </button>
            </div>

            <p className="sf-label" style={{ textAlign: "center", marginTop: 14 }}>
              {current + 1} / {total}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
