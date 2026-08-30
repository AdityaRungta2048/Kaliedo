import { memo, useMemo } from 'react'
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg'
import type { Art, ArtPalette, ArtRatio } from '@/lib/shared/types'
import { rng } from '@/lib/shared/utils'

const RATIO: Record<ArtRatio, number> = { '4:3': 3 / 4, '16:9': 9 / 16, '1:1': 1, '3:4': 4 / 3 }

const PALETTES: Record<ArtPalette, { bg: string; ink: string; tones: string[] }> = {
  ember: { bg: '#2A1712', ink: '#F6E9DF', tones: ['#D14A28', '#E8763F', '#8C2F1D', '#F2B48C', '#4A1F16'] },
  moss:  { bg: '#0F2420', ink: '#E4F1EA', tones: ['#2F7D6B', '#4FA893', '#1B4A40', '#9ED3C2', '#12332C'] },
  amber: { bg: '#2B2110', ink: '#F7EEDB', tones: ['#BE8A20', '#E0AE43', '#7E5A12', '#F0D28C', '#463315'] },
  iris:  { bg: '#181A33', ink: '#E9E8FA', tones: ['#5A54C4', '#8079E8', '#37337F', '#B3AEF5', '#242247'] },
  ink:   { bg: '#17161B', ink: '#EFEDE8', tones: ['#4A4750', '#6E6A76', '#2A2830', '#9C97A3', '#1F1E24'] },
}

/**
 * The identical generator the web app uses, ported to react-native-svg. Artwork is
 * drawn rather than downloaded: no network, no cache, no broken image ever.
 */
function CoverArtBase({ art, width, radius = 0 }: { art: Art; width: number; radius?: number }) {
  const { seed, motif, palette, ratio } = art
  const p = PALETTES[palette] ?? PALETTES.ink
  const vh = 100 * RATIO[ratio]
  const height = width * RATIO[ratio]
  const uid = `${seed}-${motif}`

  const shapes = useMemo(() => {
    const r = rng(seed)
    const pick = () => p.tones[Math.floor(r() * p.tones.length)]
    const nodes: React.ReactNode[] = []

    if (motif === 'facets') {
      for (let i = 0; i < 9; i++) {
        const cx = r() * 100, cy = r() * vh, s = 14 + r() * 30, rot = r() * 360
        nodes.push(
          <Polygon key={i} points={`0,${-s} ${s * 0.87},${s * 0.5} ${-s * 0.87},${s * 0.5}`}
            transform={`translate(${cx} ${cy}) rotate(${rot})`} fill={pick()} opacity={0.5 + r() * 0.45} />)
      }
    } else if (motif === 'strata') {
      let y = -4
      for (let i = 0; y < vh + 6; i++) {
        const band = 3 + r() * 12
        nodes.push(
          <Path key={i}
            d={`M0 ${y} Q ${25 + r() * 50} ${y + (r() - 0.5) * 14}, 100 ${y + (r() - 0.5) * 10} L100 ${y + band} Q ${25 + r() * 50} ${y + band + (r() - 0.5) * 14}, 0 ${y + band} Z`}
            fill={pick()} opacity={0.45 + r() * 0.5} />)
        y += band
      }
    } else if (motif === 'orbit') {
      const cx = 30 + r() * 40, cy = vh * (0.3 + r() * 0.4)
      for (let i = 0; i < 11; i++) {
        nodes.push(<Circle key={i} cx={cx} cy={cy} r={4 + i * (3 + r() * 2)} fill="none" stroke={pick()} strokeWidth={0.4 + r() * 1.6} opacity={0.75 - i * 0.05} />)
      }
      nodes.push(<Circle key="core" cx={cx} cy={cy} r={3 + r() * 4} fill={p.tones[1]} />)
    } else if (motif === 'weave') {
      let x = 0
      for (let i = 0; x < 100; i++) {
        const w = 2 + r() * 13
        nodes.push(<Rect key={`v${i}`} x={x} y={r() * vh * 0.3} width={w} height={vh * (0.55 + r() * 0.5)} fill={pick()} opacity={0.32 + r() * 0.5} />)
        x += w + r() * 5
      }
      let y = 0
      for (let j = 0; y < vh; j++) {
        const bh = 1.5 + r() * 9
        nodes.push(<Rect key={`h${j}`} x={-2 + r() * 20} y={y} width={100 + r() * 20} height={bh} fill={pick()} opacity={0.18 + r() * 0.34} />)
        y += bh + r() * 7
      }
    } else if (motif === 'dunes') {
      for (let i = 0; i < 7; i++) {
        const base = vh * (0.25 + (i / 7) * 0.8)
        nodes.push(
          <Path key={i}
            d={`M-2 ${base} C ${20 + r() * 20} ${base - 6 - r() * 14}, ${55 + r() * 25} ${base + 4 + r() * 10}, 102 ${base - 3 - r() * 8} L102 ${vh + 4} L-2 ${vh + 4} Z`}
            fill={pick()} opacity={0.55 + i * 0.05} />)
      }
      nodes.push(<Circle key="sun" cx={20 + r() * 60} cy={vh * 0.18} r={4 + r() * 6} fill={p.ink} opacity={0.55} />)
    } else {
      const cx = 50, cy = vh / 2
      for (let i = 0; i < 8; i++) {
        nodes.push(
          <Path key={i} d={`M${cx} ${cy} L${cx + 60} ${cy - 22} L${cx + 60} ${cy + 22} Z`}
            transform={`rotate(${(i / 8) * 360} ${cx} ${cy})`} fill={p.tones[i % p.tones.length]} opacity={0.35 + (i % 3) * 0.18} />)
      }
      nodes.push(<Circle key="c" cx={cx} cy={cy} r={8 + r() * 6} fill={p.bg} />)
    }
    return nodes
  }, [seed, motif, p, vh])

  return (
    <Svg width={width} height={height} viewBox={`0 0 100 ${vh}`} style={{ borderRadius: radius }}>
      <Defs>
        <ClipPath id={`clip-${uid}`}><Rect width="100" height={vh} /></ClipPath>
        <LinearGradient id={`vig-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={p.bg} stopOpacity="0" />
          <Stop offset="1" stopColor={p.bg} stopOpacity="0.55" />
        </LinearGradient>
      </Defs>
      <G clipPath={`url(#clip-${uid})`}>
        <Rect width="100" height={vh} fill={p.bg} />
        {shapes}
        <Rect width="100" height={vh} fill={`url(#vig-${uid})`} />
      </G>
    </Svg>
  )
}

export const CoverArt = memo(CoverArtBase)

export function AvatarArt({ seed, palette, size }: { seed: number; palette: ArtPalette; size: number }) {
  const p = PALETTES[palette] ?? PALETTES.ink
  const shapes = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: 4 }, (_, i) => {
      const cx = r() * 100, cy = r() * 100, s = 26 + r() * 44, rot = r() * 360
      return (
        <Polygon key={i} points={`0,${-s} ${s * 0.87},${s * 0.5} ${-s * 0.87},${s * 0.5}`}
          transform={`translate(${cx} ${cy}) rotate(${rot})`} fill={p.tones[i % p.tones.length]} opacity={0.85} />
      )
    })
  }, [seed, p])

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs><ClipPath id={`av-${seed}`}><Rect width="100" height="100" rx="50" /></ClipPath></Defs>
      <G clipPath={`url(#av-${seed})`}>
        <Rect width="100" height="100" fill={p.bg} />
        {shapes}
      </G>
    </Svg>
  )
}

/** The Kaleida mark. Facets at 40° so the rotations stay visible. */
export function LogoMark({ size = 28, tile = true, colors }: { size?: number; tile?: boolean; colors?: { ink: string } }) {
  const ink = colors?.ink ?? '#141210'
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {tile && <Rect width="64" height="64" rx="15" fill={ink} />}
      <G transform="translate(32 32)">
        <Path d="M0 -19 L16.5 9.5 L-16.5 9.5 Z" fill="#D14A28" opacity={0.78} />
        <Path d="M0 -19 L16.5 9.5 L-16.5 9.5 Z" fill="#2F7D6B" opacity={0.78} transform="rotate(40)" />
        <Path d="M0 -19 L16.5 9.5 L-16.5 9.5 Z" fill="#BE8A20" opacity={0.78} transform="rotate(80)" />
        <Circle r="4.2" fill={ink} />
      </G>
    </Svg>
  )
}
