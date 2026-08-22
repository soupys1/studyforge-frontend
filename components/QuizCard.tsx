"use client";
import { useState } from "react";
import { generateQuiz } from "@/lib/api";

interface QuizQuestion {
  quiz_id: string;
  question: string;
  options: string[];
  correct_ans: string;
  explanation: string;
}

interface QuizSet {
  set_id: string;
  questions: QuizQuestion[];
}

interface QuizCardProps {
  documentId: string;
  index: number;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function QuizCard({ documentId, index }: QuizCardProps) {
  const [topic,       setTopic]       = useState("");
  const [quizset,     setQuizset]     = useState<QuizSet | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [answers,     setAnswers]     = useState<Record<string, string>>({});
  const [qIndex,      setQIndex]      = useState(0);
  const [showResults, setShowResults] = useState(false);

  async function handleQuiz() {
    if (!topic.trim()) return;
    setError(null);
    setQuizset(null);
    setAnswers({});
    setQIndex(0);
    setShowResults(false);
    setLoading(true);
    try {
      const res = await generateQuiz(documentId, topic);
      setQuizset(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function pickAnswer(qid: string, opt: string) {
    setAnswers(prev => ({ ...prev, [qid]: opt }));
  }

  function goNext() {
    if (!quizset) return;
    if (qIndex < quizset.questions.length - 1) {
      setQIndex(i => i + 1);
    } else {
      setShowResults(true);
    }
  }

  function retake() {
    setAnswers({});
    setQIndex(0);
    setShowResults(false);
  }

  const total = quizset?.questions.length ?? 0;

  const score = quizset
    ? quizset.questions.filter(q => answers[q.quiz_id] === q.correct_ans).length
    : 0;

  // Sidebar score display: show when results are shown
  const sidebarScore = showResults && quizset !== null;

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
          Quiz
        </h3>
        <p style={{ fontSize: 13.5, color: "var(--color-neutral-500)", lineHeight: 1.56, marginBottom: 24 }}>
          Multiple-choice questions testing the most important concepts in your document.
        </p>

        <input
          className="sf-input"
          type="text"
          placeholder="Enter topic…"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleQuiz()}
          style={{ marginBottom: 16 }}
        />
        <button
          className="sf-btn sf-btn-primary"
          style={{ width: "100%" }}
          onClick={handleQuiz}
          disabled={!topic.trim() || loading}
        >
          {loading ? "Generating…" : "Generate quiz"}
        </button>

        {/* Score (results screen) */}
        {sidebarScore && (
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid var(--color-neutral-900)" }}>
            <p className="sf-label" style={{ marginBottom: 10 }}>Score</p>
            <p style={{
              fontSize: 56,
              fontWeight: 500,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              color: score === total
                ? "var(--sf-ok)"
                : score >= total / 2
                  ? "var(--color-accent)"
                  : "var(--sf-bad)",
            }}>
              {score}
              <span style={{
                fontSize: 22,
                fontWeight: 400,
                color: "var(--color-neutral-600)",
                marginLeft: 4,
              }}>
                /{total}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* ── Output ── */}
      <div className="sf-panel" style={{ padding: 32, minHeight: 180 }}>

        {/* Ghost */}
        {!quizset && !loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[55, 65, 50].map((w, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton" style={{ height: 14, width: `${w}%`, opacity: 0.3 - i * 0.06 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="skeleton" style={{ height: 36, borderRadius: "var(--radius-md)", opacity: 0.15 }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton" style={{ height: 14, width: `${55 + i * 10}%` }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="skeleton" style={{ height: 36, borderRadius: "var(--radius-md)" }} />
                  ))}
                </div>
              </div>
            ))}
            <p className="sf-label" style={{ marginTop: 4, animation: "sf-pulse 1.2s ease-in-out infinite" }}>
              Writing questions…
            </p>
          </div>
        )}

        {/* Error */}
        {error && <div className="sf-alert sf-alert-bad">{error}</div>}

        {/* Quiz — one question at a time */}
        {quizset && !showResults && (
          <QuizQuestion
            q={quizset.questions[qIndex]}
            qIndex={qIndex}
            total={total}
            answers={answers}
            questions={quizset.questions}
            onPick={pickAnswer}
            onNext={goNext}
          />
        )}

        {/* Results screen */}
        {quizset && showResults && (
          <QuizResults
            questions={quizset.questions}
            answers={answers}
            score={score}
            total={total}
            onRetake={retake}
          />
        )}
      </div>
    </div>
  );
}

/* ── Single-question panel ───────────────────────── */
function QuizQuestion({
  q,
  qIndex,
  total,
  answers,
  questions,
  onPick,
  onNext,
}: {
  q: QuizQuestion;
  qIndex: number;
  total: number;
  answers: Record<string, string>;
  questions: QuizQuestion[];
  onPick: (qid: string, opt: string) => void;
  onNext: () => void;
}) {
  const userAns   = answers[q.quiz_id];
  const answered  = userAns !== undefined;
  const isLast    = qIndex === total - 1;

  return (
    <div>
      {/* Pip strip */}
      <div style={{ display: "flex", gap: 4, marginBottom: 40 }}>
        {questions.map((qq, i) => {
          const a = answers[qq.quiz_id];
          let bg = "var(--color-neutral-900)";
          if (a !== undefined) {
            bg = a === qq.correct_ans ? "var(--color-accent)" : "var(--color-neutral-600)";
          } else if (i === qIndex) {
            bg = "var(--color-neutral-600)";
          }
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 999,
                background: bg,
                transition: "background .25s ease",
              }}
            />
          );
        })}
      </div>

      {/* Eyebrow */}
      <p className="sf-label" style={{ marginBottom: "var(--space-6)" }}>
        Question {qIndex + 1} of {total}
      </p>

      {/* Question */}
      <h2 style={{
        fontSize: 28,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: "-.025em",
        marginBottom: 40,
      }}>
        {q.question}
      </h2>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {q.options.map((opt, oi) => {
          const letter     = OPTION_LETTERS[oi] ?? String(oi + 1);
          const isPicked   = userAns === opt;
          const isCorrect  = opt === q.correct_ans;

          let borderColor = "var(--color-neutral-800)";
          let bg          = "transparent";
          let letterColor = "var(--color-neutral-500)";
          let mark        = "";

          if (answered) {
            if (isCorrect) {
              bg          = "var(--color-accent-900)";
              borderColor = "var(--color-accent)";
              letterColor = "var(--color-accent-200)";
              mark        = "✓";
            } else if (isPicked) {
              borderColor = "var(--color-neutral-600)";
              letterColor = "var(--color-neutral-400)";
              mark        = "✕";
            }
          }

          return (
            <OptionButton
              key={oi}
              opt={opt}
              letter={letter}
              mark={mark}
              bg={bg}
              borderColor={borderColor}
              letterColor={letterColor}
              answered={answered}
              onClick={() => !answered && onPick(q.quiz_id, opt)}
            />
          );
        })}
      </div>

      {/* Hint / explanation */}
      <div style={{ marginTop: "var(--space-8)" }}>
        {!answered ? (
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
            Pick an answer to see the passage it came from.
          </p>
        ) : (
          <div>
            <div style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--color-neutral-400)",
              borderLeft: "2px solid var(--color-accent)",
              paddingLeft: "var(--space-8)",
            }}>
              {q.explanation}
            </div>
            <button
              className="sf-btn sf-btn-primary"
              style={{ fontSize: 14, marginTop: "var(--space-8)" }}
              onClick={onNext}
            >
              {isLast ? "See your result" : "Next question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Option button ───────────────────────────────── */
function OptionButton({
  opt,
  letter,
  mark,
  bg,
  borderColor,
  letterColor,
  answered,
  onClick,
}: {
  opt: string;
  letter: string;
  mark: string;
  bg: string;
  borderColor: string;
  letterColor: string;
  answered: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={answered}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-6)",
        textAlign: "left",
        border: `1px solid ${hovered && !answered ? "var(--color-neutral-600)" : borderColor}`,
        borderRadius: "var(--radius-md)",
        padding: "var(--space-6) var(--space-8)",
        fontSize: 15,
        lineHeight: 1.5,
        cursor: answered ? "default" : "pointer",
        background: bg,
        color: "var(--color-text)",
        fontFamily: "var(--font-body)",
        transform: hovered && !answered ? "translateX(3px)" : "translateX(0)",
        transition: "all .18s ease",
        width: "100%",
      }}
    >
      {/* Letter */}
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        width: 12,
        lineHeight: 2,
        flexShrink: 0,
        color: letterColor,
      }}>
        {letter}
      </span>

      {/* Text */}
      <span style={{ flex: 1 }}>{opt}</span>

      {/* Mark */}
      <span style={{
        fontSize: 13,
        lineHeight: 1.6,
        flexShrink: 0,
        color: mark === "✓" ? "var(--color-accent-200)" : "var(--color-neutral-500)",
      }}>
        {mark}
      </span>
    </button>
  );
}

/* ── Results screen ──────────────────────────────── */
function QuizResults({
  questions,
  answers,
  score,
  total,
  onRetake,
}: {
  questions: QuizQuestion[];
  answers: Record<string, string>;
  score: number;
  total: number;
  onRetake: () => void;
}) {
  return (
    <div>
      {/* Eyebrow */}
      <p style={{
        fontSize: 11,
        fontWeight: 400,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: "var(--color-accent-300)",
        marginBottom: "var(--space-6)",
      }}>
        Result
      </p>

      {/* Score display */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        marginBottom: 16,
      }}>
        <span style={{
          fontSize: 92,
          fontWeight: 500,
          letterSpacing: "-.05em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          color: score === total
            ? "var(--sf-ok)"
            : score >= total / 2
              ? "var(--color-accent)"
              : "var(--sf-bad)",
        }}>
          {score}
        </span>
        <span style={{
          fontSize: 34,
          fontWeight: 400,
          color: "var(--color-neutral-700)",
          fontVariantNumeric: "tabular-nums",
        }}>
          / {total}
        </span>
      </div>

      {/* Note */}
      <p style={{
        fontSize: 16,
        color: "var(--color-neutral-400)",
        maxWidth: "46ch",
        lineHeight: 1.6,
        marginBottom: 48,
      }}>
        {score === total
          ? "Perfect score — you've mastered this material."
          : score >= total / 2
            ? "Good work. Review the questions you missed and try again."
            : "Keep studying — a retake will help reinforce the concepts."}
      </p>

      {/* Per-question breakdown */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {questions.map((q, i) => {
          const userAns  = answers[q.quiz_id];
          const correct  = userAns === q.correct_ans;
          // Try to extract page from explanation (e.g. "page 105" → "p.105")
          const pageMatch = q.explanation?.match(/page\s*(\d+)/i);
          const pageTag   = pageMatch ? `p.${pageMatch[1]}` : null;

          return (
            <div
              key={q.quiz_id}
              style={{
                display: "grid",
                gridTemplateColumns: "16px 1fr auto",
                gap: "var(--space-6)",
                padding: "var(--space-6) 0",
                borderTop: "1px solid var(--color-neutral-900)",
                alignItems: "start",
              }}
            >
              {/* Mark */}
              <span style={{
                fontSize: 13,
                color: correct ? "var(--sf-ok)" : "var(--sf-bad)",
                lineHeight: 1.5,
                fontWeight: 500,
              }}>
                {correct ? "✓" : "✕"}
              </span>

              {/* Question */}
              <span style={{ fontSize: 14, color: "var(--color-neutral-400)", lineHeight: 1.5 }}>
                {q.question}
              </span>

              {/* Page tag */}
              {pageTag && (
                <span style={{
                  fontSize: 11,
                  color: "var(--color-neutral-600)",
                  letterSpacing: ".06em",
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {pageTag}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "var(--space-4)", marginTop: 32, flexWrap: "wrap" }}>
        <button
          className="sf-btn sf-btn-primary"
          style={{ fontSize: 14 }}
          onClick={onRetake}
        >
          Retake the quiz
        </button>
        <button
          className="sf-btn sf-btn-ghost"
          style={{ fontSize: 14 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Back to top
        </button>
      </div>
    </div>
  );
}
