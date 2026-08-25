/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Apple-style palette: neutral surfaces + a single blue accent.
        accent: { DEFAULT: '#0071e3', hover: '#0077ed', soft: '#e8f2fc' },
        ink: { DEFAULT: '#1d1d1f', muted: '#6e6e73', subtle: '#86868b' },
        surface: '#f5f5f7',
        line: '#d2d2d7'
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'PingFang HK',
          'Microsoft JhengHei',
          'Segoe UI',
          'sans-serif'
        ],
        display: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'PingFang HK',
          'Microsoft JhengHei',
          'sans-serif'
        ]
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0, 0, 0, 0.06)',
        card: '0 1px 2px rgba(0, 0, 0, 0.04), 0 12px 32px -16px rgba(0, 0, 0, 0.14)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both'
      }
    }
  },
  plugins: []
}
