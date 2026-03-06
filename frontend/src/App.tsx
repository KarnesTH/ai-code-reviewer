import { useCallback, useMemo, useRef, useState, type SubmitEvent } from 'react'
import { DEFAULT_CODE, LANGUAGES } from '../contants'
import { type Review } from '../types'

/**
 * Checks if the value is a Review.
 * This is a type guard function that checks if the value is a Review object.
 * It is used to ensure that the value is a Review object before accessing its properties.
 * 
 * @param value - The value to check if it is a Review.
 * @returns True if the value is a Review, false otherwise.
 */
const isReview = (value: unknown): value is Review => {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<Review>
  return (
    typeof v.summary === 'string' &&
    Array.isArray(v.security_issues) &&
    Array.isArray(v.performance_issues) &&
    Array.isArray(v.style_issues) &&
    Array.isArray(v.suggestions)
  )
};

/**
 * Displays a list of issues.
 * This is a React component that displays a list of issues.
 * It is used to display the issues in the review.
 * 
 * @param title - The title of the issue list.
 * @param items - The items to display in the issue list.
 * @returns A React component that displays the issue list.
 */
const IssueList = ({ title, items }: { title: string; items: string[] }) => {
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

/**
 * The main app component.
 * This is the main app component that displays the UI and handles the logic for the app.
 * 
 * @returns The main app component.
 */
const  App = () => {
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]['value']>('python')
  const [code, setCode] = useState<string>(DEFAULT_CODE)
  const [review, setReview] = useState<Review | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const canSubmit = useMemo(() => code.trim().length > 0 && !isLoading, [code, isLoading])
  const abortRef = useRef<AbortController | null>(null)

  /**
   * Aborts the current request.
   * This is a callback function that aborts the current request.
   * It is used to abort the current request when the user navigates away from the page or clicks the reset button.
   * 
   * @returns A callback function that aborts the current request.
   */
  const abortRequest = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  /**
   * Handles the submission of the form.
   * This is a function that handles the submission of the form.
   * It is used to submit the form and get the review from the backend.
   * 
   * @param e - The submit event.
   * @returns A promise that resolves when the form is submitted.
   * @throws An error if the form is not submitted correctly.
   */
  const onSubmit = async (e: SubmitEvent) => {
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

      const text = await res.text()
      let data: unknown
      try {
        data = text ? (JSON.parse(text) as unknown) : null
      } catch {
        throw new Error(
          res.ok
            ? 'Invalid response from server.'
            : `Request failed (${res.status}): ${text.slice(0, 200)}`
        )
      }
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
              <label htmlFor="code" className="sr-only">Code</label>
              <textarea
                id="code"
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
          <div className="fixed inset-0 z-100 grid place-items-center bg-overlay backdrop-blur-sm">
            <div className="rounded-3xl border border-border bg-surface p-8 shadow-xl text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-border bg-primary/15">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
              <p className="mt-4 font-medium text-text">Analyse your code…</p>
              <p className="mt-1 text-sm text-text-muted">
                This can take 1–5 minutes on CPU.
              </p>
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

export default App;
