import { useCallback, useMemo, useRef, useState, type FormEvent } from 'react'

type Review = {
  summary: string
  security_issues: string[]
  performance_issues: string[]
  style_issues: string[]
  suggestions: string[]
}

const DEFAULT_CODE = `def add(a, b):
    return a + b
`

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'bash', label: 'Bash' },
] as const

function isReview(value: unknown): value is Review {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<Review>
  return (
    typeof v.summary === 'string' &&
    Array.isArray(v.security_issues) &&
    Array.isArray(v.performance_issues) &&
    Array.isArray(v.style_issues) &&
    Array.isArray(v.suggestions)
  )
}

function IssueList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-xl border border-border bg-surface-elevated p-4">
      <h3 className="text-sm font-semibold tracking-wide text-text">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">No issues found.</p>
      ) : (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-muted">
          {items.map((item, idx) => (
            <li key={`${title}-${idx}`}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function App() {
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]['value']>('python')
  const [code, setCode] = useState<string>(DEFAULT_CODE)
  const [review, setReview] = useState<Review | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const canSubmit = useMemo(() => code.trim().length > 0 && !isLoading, [code, isLoading])
  const abortRef = useRef<AbortController | null>(null)

  const abortRequest = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    abortRequest()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    setIsLoading(true)
    setError(null)
    setReview(null)

    try {
      const res = await fetch('/analyse/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
        signal,
      })

      const data = (await res.json()) as unknown
      if (!res.ok) {
        const message =
          typeof data === 'object' && data && 'detail' in data
            ? String((data as { detail?: unknown }).detail ?? 'Request failed')
            : 'Request failed'
        throw new Error(message)
      }

      if (!isReview(data)) {
        throw new Error('Unexpected response format from backend.')
      }

      setReview(data)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      abortRef.current = null
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background text-text">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="text-5xl font-semibold tracking-tight">AI Code Reviewer</h1>
          <p className="text-sm text-text-muted">
            Paste your code, select a language and start the analysis.
          </p>
        </header>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-[0_0_0_1px_var(--color-border-subtle)]">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3 text-sm text-text-muted">
                <span className="min-w-20 text-text-muted">Language</span>
                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as (typeof LANGUAGES)[number]['value'])
                  }
                  className="h-10 rounded-lg border border-border bg-input px-3 text-sm text-text outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    abortRequest()
                    setCode(DEFAULT_CODE)
                    setReview(null)
                    setError(null)
                  }}
                  className="h-10 rounded-lg border border-border bg-transparent px-3 text-sm text-text-muted hover:bg-white/5"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Analyse
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-input p-3">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here…"
                spellCheck={false}
                className="min-h-56 w-full resize-y bg-transparent font-mono text-sm leading-6 text-text outline-none placeholder:text-text-faint"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-text-subtle">
                <span>{code.length.toLocaleString('en-US')} characters</span>
              </div>
            </div>
          </form>
        </div>

        {isLoading && (
          <div className="fixed inset-0 z-[100] grid place-items-center bg-overlay backdrop-blur-sm">
            <div className="rounded-3xl border border-border bg-surface p-8 shadow-xl text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-border bg-primary/15">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
              <p className="mt-4 font-medium text-text">Analyse your code…</p>
              <p className="mt-1 text-sm text-text-muted">This can take a few seconds.</p>
            </div>
          </div>
        )}

        {(error || review) && (
          <div className="mt-6">
            {error && (
              <div className="rounded-xl border border-error bg-red-950/30 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            {review && (
              <div className="space-y-4">
                <section className="rounded-xl border border-border bg-surface-elevated p-4">
                  <h2 className="text-sm font-semibold tracking-wide text-text">
                    Summary
                  </h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-text-muted">
                    {review.summary || '—'}
                  </p>
                </section>

                <div className="grid gap-4 md:grid-cols-2">
                  <IssueList title="Security" items={review.security_issues} />
                  <IssueList title="Performance" items={review.performance_issues} />
                  <IssueList title="Style" items={review.style_issues} />
                  <IssueList title="Suggestions" items={review.suggestions} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
