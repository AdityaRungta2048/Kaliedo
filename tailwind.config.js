/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic tokens -> CSS variables so theme morphs smoothly.
        canvas: 'rgb(var(--k-canvas) / <alpha-value>)',
        surface: 'rgb(var(--k-surface) / <alpha-value>)',
        raised: 'rgb(var(--k-raised) / <alpha-value>)',
        ink: 'rgb(var(--k-ink) / <alpha-value>)',
        muted: 'rgb(var(--k-muted) / <alpha-value>)',
        faint: 'rgb(var(--k-faint) / <alpha-value>)',
        line: 'rgb(var(--k-line) / <alpha-value>)',
        ember: 'rgb(var(--k-ember) / <alpha-value>)',
        moss: 'rgb(var(--k-moss) / <alpha-value>)',
        amber: 'rgb(var(--k-amber) / <alpha-value>)',
        iris: 'rgb(var(--k-iris) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Fraunces', 'Iowan Old Style', 'Georgia', 'serif'],
        read: ['Newsreader', 'Iowan Old Style', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: { xl: '14px', '2xl': '18px', '3xl': '26px' },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--k-shadow) / 0.05), 0 6px 18px -8px rgb(var(--k-shadow) / 0.12)',
        lift: '0 2px 6px rgb(var(--k-shadow) / 0.06), 0 18px 40px -14px rgb(var(--k-shadow) / 0.22)',
        float: '0 30px 80px -24px rgb(var(--k-shadow) / 0.42)',
      },
      maxWidth: { reader: '38rem' },
      transitionTimingFunction: { kaleida: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: { shimmer: 'shimmer 1.6s infinite', 'fade-up': 'fade-up .4s cubic-bezier(0.22,1,0.36,1) both' },
    },
  },
  plugins: [],
}
