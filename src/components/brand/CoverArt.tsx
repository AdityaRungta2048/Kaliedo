import { memo, useMemo } from 'react'
import type { Art, ArtPalette, ArtRatio } from '@/lib/types'
import { rng } from '@/lib/utils'

const RATIO: Record<ArtRatio, number> = { '4:3': 3 / 4, '16:9': 9 / 16, '1:1': 1, '3:4': 4 / 3 }

/** Each palette is a small, deliberate set — not a random gradient generator. */
const PALETTES: Record<ArtPalette, { bg: string; ink: string; tones: string[] }> = {
  ember: { bg: '#2A1712', ink: '#F6E9DF', tones: ['#D14A28', '#E8763F', '#8C2F1D', '#F2B48C', '#4A1F16'] },
  moss:  { bg: '#0F2420', ink: '#E4F1EA', tones: ['#2F7D6B', '#4FA893', '#1B4A40', '#9ED3C2', '#12332C'] },
  amber: { bg: '#2B2110', ink: '#F7EEDB', tones: ['#BE8A20', '#E0AE43', '#7E5A12', '#F0D28C', '#463315'] },
  iris:  { bg: '#181A33', ink: '#E9E8FA', tones: ['#5A54C4', '#8079E8', '#37337F', '#B3AEF5', '#242247'] },
  ink:   { bg: '#17161B', ink: '#EFEDE8', tones: ['#4A4750', '#6E6A76', '#2A2830', '#9C97A3', '#1F1E24'] },
}

/**
 * Cover art is drawn, not fetched. It keeps the prototype offline-proof, gives
 * Kaleido a recognisable visual signature, and never shows a broken image.
 */
function CoverArtBase({ art, className, rounded = true }: { art: Art; className?: string; rounded?: boolean }) {
  const { seed, motif, palette, ratio } = art
  const p = PALETTES[palette] ?? PALETTES.ink
  const h = 100 * RATIO[ratio]

  const shapes = useMemo(() => {
    const r = rng(seed)
    const pick = () => p.tones[Math.floor(r() * p.tones.length)]
    const nodes: JSX.Element[] = []

    if (motif === 'facets') {
      for (let i = 0; i < 9; i++) {
        const cx = r() * 100, cy = r() * h, s = 14 + r() * 30, rot = r() * 360
        nodes.push(
          <polygon key={i} points={`0,${-s} ${s * 0.87},${s * 0.5} ${-s * 0.87},${s * 0.5}`}
            transform={`translate(${cx} ${cy}) rotate(${rot})`} fill={pick()} opacity={0.5 + r() * 0.45} />,
        )
      }
    } else if (motif === 'strata') {
      let y = -4
      for (let i = 0; y < h + 6; i++) {
        const band = 3 + r() * 12
        nodes.push(
          <path key={i} d={`M0 ${y} Q ${25 + r() * 50} ${y + (r() - 0.5) * 14}, 100 ${y + (r() - 0.5) * 10} L100 ${y + band} Q ${25 + r() * 50} ${y + band + (r() - 0.5) * 14}, 0 ${y + band} Z`}
            fill={pick()} opacity={0.45 + r() * 0.5} />,
        )
        y += band
      }
    } else if (motif === 'orbit') {
      const cx = 30 + r() * 40, cy = h * (0.3 + r() * 0.4)
      for (let i = 0; i < 11; i++) {
        nodes.push(<circle key={i} cx={cx} cy={cy} r={4 + i * (3 + r() * 2)} fill="none" stroke={pick()} strokeWidth={0.4 + r() * 1.6} opacity={0.75 - i * 0.05} />)
      }
      nodes.push(<circle key="core" cx={cx} cy={cy} r={3 + r() * 4} fill={p.tones[1]} />)
    } else if (motif === 'weave') {
      let x = 0
      for (let i = 0; x < 100; i++) {
        const w = 2 + r() * 13
        nodes.push(<rect key={`v${i}`} x={x} y={r() * h * 0.3} width={w} height={h * (0.55 + r() * 0.5)} fill={pick()} opacity={0.32 + r() * 0.5} />)
        x += w + r() * 5
      }
      let y = 0
      for (let j = 0; y < h; j++) {
        const bh = 1.5 + r() * 9
        nodes.push(<rect key={`h${j}`} x={-2 + r() * 20} y={y} width={100 + r() * 20} height={bh} fill={pick()} opacity={0.18 + r() * 0.34} />)
        y += bh + r() * 7
      }
    } else if (motif === 'dunes') {
      for (let i = 0; i < 7; i++) {
        const base = h * (0.25 + (i / 7) * 0.8)
        nodes.push(
          <path key={i} d={`M-2 ${base} C ${20 + r() * 20} ${base - 6 - r() * 14}, ${55 + r() * 25} ${base + 4 + r() * 10}, 102 ${base - 3 - r() * 8} L102 ${h + 4} L-2 ${h + 4} Z`}
            fill={pick()} opacity={0.55 + i * 0.05} />,
        )
      }
      nodes.push(<circle key="sun" cx={20 + r() * 60} cy={h * 0.18} r={4 + r() * 6} fill={p.ink} opacity={0.55} />)
    } else {
      // aperture
      const cx = 50, cy = h / 2
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 360
        nodes.push(
          <path key={i} d={`M${cx} ${cy} L${cx + 60} ${cy - 22} L${cx + 60} ${cy + 22} Z`}
            transform={`rotate(${a} ${cx} ${cy})`} fill={p.tones[i % p.tones.length]} opacity={0.35 + (i % 3) * 0.18} />,
        )
      }
      nodes.push(<circle key="c" cx={cx} cy={cy} r={8 + r() * 6} fill={p.bg} />)
    }
    return nodes
  }, [seed, motif, p, h])

  return (
    <svg
      viewBox={`0 0 100 ${h}`} className={className} role="img" aria-label={art.caption ?? 'Cover artwork'}
      preserveAspectRatio="xMidYMid slice"
      style={{ display: 'block', width: '100%', height: '100%', borderRadius: rounded ? undefined : 0 }}
    >
      <defs>
        <clipPath id={`clip-${seed}-${motif}`}><rect width="100" height={h} /></clipPath>
        <linearGradient id={`vig-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.bg} stopOpacity="0" />
          <stop offset="100%" stopColor={p.bg} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#clip-${seed}-${motif})`}>
        <rect width="100" height={h} fill={p.bg} />
        {shapes}
        <rect width="100" height={h} fill={`url(#vig-${seed})`} />
      </g>
    </svg>
  )
}

export const CoverArt = memo(CoverArtBase)

/** Avatars share the art system so the whole product looks like one hand made it. */
export function AvatarArt({ seed, palette, className }: { seed: number; palette: ArtPalette; className?: string }) {
  const p = PALETTES[palette] ?? PALETTES.ink
  const r = rng(seed)
  const shapes = Array.from({ length: 4 }, (_, i) => {
    const cx = r() * 100, cy = r() * 100, s = 26 + r() * 44, rot = r() * 360
    return (
      <polygon key={i} points={`0,${-s} ${s * 0.87},${s * 0.5} ${-s * 0.87},${s * 0.5}`}
        transform={`translate(${cx} ${cy}) rotate(${rot})`} fill={p.tones[i % p.tones.length]} opacity={0.85} />
    )
  })
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs><clipPath id={`av-${seed}`}><rect width="100" height="100" rx="50" /></clipPath></defs>
      <g clipPath={`url(#av-${seed})`}>
        <rect width="100" height="100" fill={p.bg} />
        {shapes}
      </g>
    </svg>
  )
}
