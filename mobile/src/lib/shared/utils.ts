export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function timeAgo(minutes: number): string {
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${Math.round(minutes)}m`
  const h = minutes / 60
  if (h < 24) return `${Math.floor(h)}h`
  const d = h / 24
  if (d < 7) return `${Math.floor(d)}d`
  return `${Math.floor(d / 7)}w`
}

export function compact(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) {
    const v = n / 1000
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}K`
  }
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
}

export function readTime(paragraphs: string[]): number {
  const words = paragraphs.join(' ').split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}

export function excerpt(paragraphs: string[], chars = 150): string {
  const text = paragraphs[0] ?? ''
  if (text.length <= chars) return text
  const cut = text.slice(0, chars)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

/** Small deterministic PRNG so generated artwork is stable across renders. */
export function rng(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}
