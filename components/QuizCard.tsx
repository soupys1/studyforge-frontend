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

  const sidebarScore = showResults && quizset !== null;

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
          Quiz
        </h3>
        <p style={{ fontSize: 13.5, color: "var(--ln-ink-subtle)", lineHeight: 1.56, marginBottom: 24 }}>
          Multiple-choice questions testing the most important concepts in your document.
        </p>

        <input
          className="sf-input"
          type="text"
          placeholder="Enter topic…"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleQuiz()}
          style={{ marginBottom: 10 }}
        />
        <button
          className="sf-btn sf-btn-primary"
          style={{ width: "100%" }}
          onClick={handleQuiz}
          disabled={!topic.trim() || loading}
        >
          {loading ? "Generating…" : "Generate quiz"}
        </button>

        {/* Score */}
        {sidebarScore && (
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid var(--ln-hair)" }}>
            <p className="sf-label" style={{ marginBottom: 8 }}>Score</p>
            <p style={{
              fontSize: 48,
              fontWeight: 600,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.04em",
              color: score === total
                ? "var(--ln-success)"
                : score >= total / 2
                  ? "var(--ln-accent)"
                  : "var(--ln-error)",
            }}>
              {score}
              <span style={{ fontSize: 20, fontWeight: 400, color: "var(--ln-ink-tertiary)", marginLeft: 4 }}>
                /{total}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Output */}
      <div className="sf-panel" style={{ padding: 32, minHeight: 180 }}>

        {/* Ghost */}
        {!quizset && !loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[55, 65, 50].map((w, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton" style={{ height: 14, width: `${w}%`, opacity: 0.6 - i * 0.1 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="skeleton" style={{ height: 36, borderRadius: "var(--radius-md)", opacity: 0.3 }} />
                  ))}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 4 }}>
              <p className="sf-label">Enter a topic on the left and click <strong style={{ fontWeight: 500, color: "var(--ln-ink-subtle)" }}>Generate quiz</strong> to test your knowledge.</p>
            </div>
          </div>
        )}

        {/* Loading */}
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

        {error && <div className="sf-alert sf-alert-bad">{error}</div>}

        {quizset && !showResults && (
          <QuizQuestionPanel
            q={quizset.questions[qIndex]}
            qIndex={qIndex}
            total={total}
            answers={answers}
            questions={quizset.questions}
            onPick={pickAnswer}
            onNext={goNext}
          />
        )}

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

function QuizQuestionPanel({
  q, qIndex, total, answers, questions, onPick, onNext,
}: {
  q: QuizQuestion;
  qIndex: number;
  total: number;
  answers: Record<string, string>;
  questions: QuizQuestion[];
  onPick: (qid: string, opt: string) => void;
  onNext: () => void;
}) {
  const userAns  = answers[q.quiz_id];
  const answered = userAns !== undefined;
  const isLast   = qIndex === total - 1;

  return (
    <div>
      {/* Pip strip */}
      <div style={{ display: "flex", gap: 3, marginBottom: 36 }}>
        {questions.map((qq, i) => {
          const a = answers[qq.quiz_id];
          let bg = "var(--ln-hair)";
          if (a !== undefined) {
            bg = a === qq.correct_ans ? "var(--ln-accent)" : "var(--ln-hair-strong)";
          } else if (i === qIndex) {
            bg = "var(--ln-ink-subtle)";
          }
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 2,
                borderRadius: 999,
                background: bg,
                transition: "background .2s ease",
              }}
            />
          );
        })}
      </div>

      <p className="sf-label" style={{ marginBottom: 16 }}>
        Question {qIndex + 1} of {total}
      </p>

      <h2 style={{
        fontSize: 24,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.03em",
        marginBottom: 36,
        color: "var(--ln-ink)",
      }}>
        {q.question}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, oi) => {
          const letter    = OPTION_LETTERS[oi] ?? String(oi + 1);
          const isPicked  = userAns === opt;
          const isCorrect = opt === q.correct_ans;

          let borderColor = "var(--ln-hair)";
          let bg          = "transparent";
          let letterColor = "var(--ln-ink-tertiary)";
          let mark        = "";

          if (answered) {
            if (isCorrect) {
              bg          = "color-mix(in srgb, var(--ln-accent) 12%, transparent)";
              borderColor = "var(--ln-accent)";
              letterColor = "var(--ln-accent-hover)";
              mark        = "✓";
            } else if (isPicked) {
              borderColor = "var(--ln-hair-strong)";
              letterColor = "var(--ln-ink-subtle)";
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

      <div style={{ marginTop: 28 }}>
        {!answered ? (
          <p style={{ fontSize: 13, color: "var(--ln-ink-tertiary)" }}>
            Pick an answer to see the passage it came from.
          </p>
        ) : (
          <div>
            <div style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--ln-ink-subtle)",
              borderLeft: "2px solid var(--ln-accent)",
              paddingLeft: 16,
              marginBottom: 20,
            }}>
              {q.explanation}
            </div>
            <button
              className="sf-btn sf-btn-primary"
              style={{ fontSize: 14 }}
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

function OptionButton({
  opt, letter, mark, bg, borderColor, letterColor, answered, onClick,
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
        gap: 14,
        textAlign: "left",
        border: `1px solid ${hovered && !answered ? "var(--ln-hair-strong)" : borderColor}`,
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        fontSize: 14,
        lineHeight: 1.5,
        cursor: answered ? "default" : "pointer",
        background: hovered && !answered && !bg ? "var(--ln-s1)" : bg,
        color: "var(--ln-ink)",
        fontFamily: "var(--font-body)",
        transform: hovered && !answered ? "translateX(2px)" : "translateX(0)",
        transition: "all .15s ease",
        width: "100%",
      }}
    >
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
      <span style={{ flex: 1 }}>{opt}</span>
      <span style={{
        fontSize: 12,
        lineHeight: 1.8,
        flexShrink: 0,
        color: mark === "✓" ? "var(--ln-accent-hover)" : "var(--ln-ink-subtle)",
      }}>
        {mark}
      </span>
    </button>
  );
}

function QuizResults({
  questions, answers, score, total, onRetake,
}: {
  questions: QuizQuestion[];
  answers: Record<string, string>;
  score: number;
  total: number;
  onRetake: () => void;
}) {
  return (
    <div>
      <p style={{
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.4px",
        textTransform: "uppercase",
        color: "var(--ln-ink-subtle)",
        marginBottom: 16,
      }}>
        Result
      </p>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
        <span style={{
          fontSize: 80,
          fontWeight: 600,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          color: score === total
            ? "var(--ln-success)"
            : score >= total / 2
              ? "var(--ln-accent)"
              : "var(--ln-error)",
        }}>
          {score}
        </span>
        <span style={{
          fontSize: 28,
          fontWeight: 400,
          color: "var(--ln-ink-tertiary)",
          fontVariantNumeric: "tabular-nums",
        }}>
          / {total}
        </span>
      </div>

      <p style={{
        fontSize: 15,
        color: "var(--ln-ink-subtle)",
        maxWidth: "42ch",
        lineHeight: 1.6,
        marginBottom: 48,
        letterSpacing: "-0.01em",
      }}>
        {score === total
          ? "Perfect score. You've mastered this material."
          : score >= total / 2
            ? "Good work. Review the questions you missed and try again."
            : "Keep studying. A retake will help reinforce the concepts."}
      </p>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {questions.map((q) => {
          const userAns = answers[q.quiz_id];
          const correct = userAns === q.correct_ans;
          const pageMatch = q.explanation?.match(/page\s*(\d+)/i);
          const pageTag   = pageMatch ? `p.${pageMatch[1]}` : null;

          return (
            <div
              key={q.quiz_id}
              style={{
                display: "grid",
                gridTemplateColumns: "16px 1fr auto",
                gap: 16,
                padding: "14px 0",
                borderTop: "1px solid var(--ln-hair)",
                alignItems: "start",
              }}
            >
              <span style={{
                fontSize: 12,
                color: correct ? "var(--ln-success)" : "var(--ln-error)",
                lineHeight: 1.6,
                fontWeight: 600,
              }}>
                {correct ? "✓" : "✕"}
              </span>
              <span style={{ fontSize: 13.5, color: "var(--ln-ink-subtle)", lineHeight: 1.5 }}>
                {q.question}
              </span>
              {pageTag && (
                <span style={{
                  fontSize: 11,
                  color: "var(--ln-ink-tertiary)",
                  letterSpacing: "0.02em",
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

      <div style={{ display: "flex", gap: 8, marginTop: 32, flexWrap: "wrap" }}>
        <button className="sf-btn sf-btn-primary" style={{ fontSize: 14 }} onClick={onRetake}>
          Retake the quiz
        </button>
        <button className="sf-btn sf-btn-ghost" style={{ fontSize: 14 }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Back to top
        </button>
      </div>
    </div>
  );
}
