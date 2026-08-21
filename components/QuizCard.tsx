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

export default function QuizCard({ documentId, index }: QuizCardProps) {
  const [topic,     setTopic]     = useState("");
  const [quizset,   setQuizset]   = useState<QuizSet | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [answers,   setAnswers]   = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  async function handleQuiz() {
    if (!topic.trim()) return;
    setError(null);
    setQuizset(null);
    setAnswers({});
    setSubmitted(false);
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

  function select(qid: string, opt: string) {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qid]: opt }));
  }

  const allAnswered = quizset
    ? quizset.questions.every(q => answers[q.quiz_id] !== undefined)
    : false;

  const score = quizset && submitted
    ? quizset.questions.filter(q => answers[q.quiz_id] === q.correct_ans).length
    : null;

  const total = quizset?.questions.length ?? 0;

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

        <h3 style={{ fontSize: 18, letterSpacing: "0.04em", marginBottom: 12 }}>Quiz</h3>
        <p style={{ fontSize: 13.5, color: "var(--color-muted)", lineHeight: 1.56, marginBottom: 24 }}>
          Multiple-choice questions testing the most important concepts in your document.
        </p>

        <input
          className="sf-input"
          type="text"
          placeholder="Enter topic…"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleQuiz()}
          style={{ marginBottom: 12 }}
        />
        <button
          className="sf-btn sf-btn-primary"
          style={{ width: "100%" }}
          onClick={handleQuiz}
          disabled={!topic.trim() || loading}
        >
          {loading ? "Generating…" : "Generate quiz"}
        </button>

        {/* Score (post-submit) */}
        {submitted && score !== null && (
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid var(--color-border)" }}>
            <p className="sf-label" style={{ marginBottom: 10 }}>Score</p>
            <p style={{
              fontFamily: '"Times New Roman", serif',
              fontSize: 56,
              lineHeight: 1,
              color: score === total
                ? "var(--sf-ok)"
                : score >= total / 2
                  ? "var(--color-accent)"
                  : "var(--sf-bad)",
            }}>
              {score}
              <span style={{
                fontSize: 22, fontFamily: "Arial",
                color: "var(--color-muted)", marginLeft: 4,
              }}>/{total}</span>
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
                    <div key={j} className="skeleton" style={{ height: 36, borderRadius: 8, opacity: 0.15 }} />
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
                    <div key={j} className="skeleton" style={{ height: 36, borderRadius: 8 }} />
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

        {/* Quiz */}
        {quizset && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {quizset.questions.map((q, qi) => {
              const userAns  = answers[q.quiz_id];
              const isCorrect = userAns === q.correct_ans;

              return (
                <div key={q.quiz_id}>
                  {/* Question */}
                  <p style={{ fontWeight: 700, lineHeight: 1.48, marginBottom: 14 }}>
                    <span style={{
                      fontFamily: '"Times New Roman", serif',
                      color: "var(--sf-ink)",
                      marginRight: 8,
                    }}>
                      {qi + 1}.
                    </span>
                    {q.question}
                  </p>

                  {/* Options grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                    {q.options.map((opt, oi) => {
                      const isSelected = userAns === opt;
                      const isRight    = opt === q.correct_ans;

                      let bg          = "transparent";
                      let borderColor = "var(--color-border)";
                      let color       = "var(--color-text)";
                      let dotBg       = "transparent";
                      let dotBorder   = "var(--color-border)";
                      let dotLabel    = "";

                      if (submitted) {
                        if (isRight) {
                          bg = "color-mix(in srgb, var(--sf-ok) 10%, transparent)";
                          borderColor = "var(--sf-ok)";
                          color = "var(--sf-ok)";
                          dotBg = "var(--sf-ok)";
                          dotBorder = "var(--sf-ok)";
                          dotLabel = "✓";
                        } else if (isSelected) {
                          bg = "color-mix(in srgb, var(--sf-bad) 10%, transparent)";
                          borderColor = "var(--sf-bad)";
                          color = "var(--sf-bad)";
                          dotBg = "var(--sf-bad)";
                          dotBorder = "var(--sf-bad)";
                          dotLabel = "✗";
                        }
                      } else if (isSelected) {
                        bg = "color-mix(in srgb, var(--color-accent) 10%, transparent)";
                        borderColor = "var(--color-accent)";
                        dotBg = "var(--color-accent)";
                        dotBorder = "var(--color-accent)";
                      }

                      return (
                        <button
                          key={oi}
                          onClick={() => select(q.quiz_id, opt)}
                          disabled={submitted}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 12px",
                            background: bg,
                            border: `1.5px solid ${borderColor}`,
                            borderRadius: 8,
                            cursor: submitted ? "default" : "pointer",
                            textAlign: "left",
                            color,
                            fontSize: 13.5,
                            lineHeight: 1.4,
                            fontFamily: "Arial, Helvetica, sans-serif",
                            transition: "background 0.12s, border-color 0.12s",
                          }}
                        >
                          <span style={{
                            width: 15, height: 15, borderRadius: "50%", flexShrink: 0,
                            border: `1.5px solid ${dotBorder}`,
                            background: dotBg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 8, color: "#fff", fontWeight: 700,
                          }}>
                            {dotLabel}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation (post-submit) */}
                  {submitted && (
                    <div style={{
                      borderLeft: `3px solid ${isCorrect ? "var(--sf-ok)" : "var(--sf-bad)"}`,
                      paddingLeft: 14,
                      marginTop: 6,
                    }}>
                      <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--color-muted)" }}>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Submit */}
            {!submitted && (
              <div>
                <button
                  className="sf-btn sf-btn-primary"
                  style={{ minWidth: 140 }}
                  onClick={() => setSubmitted(true)}
                  disabled={!allAnswered}
                >
                  Submit quiz
                </button>
                {!allAnswered && (
                  <p className="sf-label" style={{ marginTop: 10 }}>
                    Answer all questions to submit
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
