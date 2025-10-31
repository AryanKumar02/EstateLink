import { createTheme, type PaletteMode } from '@mui/material/styles'

// Augment the Palette interface to include our custom background color
declare module '@mui/material/styles' {
  interface TypeBackground {
    section?: string
  }
  interface PaletteOptions {
    background?: Partial<TypeBackground>
  }
  interface Palette {
    background: TypeBackground
  }
}

export const createAppTheme = (mode: PaletteMode) => {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#3d82f7',
        light: isDark ? '#6fa4f9' : '#6fa4f9',
        dark: isDark ? '#2b5cbf' : '#2b5cbf',
      },
      secondary: {
        main: '#3d82f7',
        light: isDark ? '#6fa4f9' : '#6fa4f9',
        dark: isDark ? '#2b5cbf' : '#2b5cbf',
      },
      background: {
        default: isDark ? '#0a0e27' : '#f9fafb',
        paper: isDark ? '#131729' : '#ffffff',
        section: isDark ? '#1a1f3a' : '#f5f8ff',
      },
      text: {
        primary: isDark ? '#e4e6eb' : '#2d3748',
        secondary: isDark ? '#a0a3b1' : '#718096',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      success: {
        main: isDark ? '#4caf50' : '#4caf50',
        light: isDark ? '#81c784' : '#81c784',
        dark: isDark ? '#388e3c' : '#388e3c',
      },
      warning: {
        main: isDark ? '#ff9800' : '#ff9800',
        light: isDark ? '#ffb74d' : '#ffb74d',
        dark: isDark ? '#f57c00' : '#f57c00',
      },
      error: {
        main: isDark ? '#f44336' : '#d32f2f',
        light: isDark ? '#e57373' : '#ef5350',
        dark: isDark ? '#c62828' : '#c62828',
      },
      info: {
        main: isDark ? '#2196f3' : '#2196f3',
        light: isDark ? '#64b5f6' : '#64b5f6',
        dark: isDark ? '#1976d2' : '#1976d2',
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      h4: {
        fontWeight: 700,
        letterSpacing: '0.02em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            scrollBehavior: 'smooth',
          },
          body: {
            scrollbarColor: isDark ? '#1a1f3a #0a0e27' : '#cbd5e0 #f9fafb',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: isDark ? '#1a1f3a' : '#cbd5e0',
              minHeight: 24,
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: isDark ? '#0a0e27' : '#f9fafb',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            paddingTop: '0.65em',
            paddingBottom: '0.65em',
            fontSize: '1rem',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDark
              ? '0 1px 3px rgba(0, 0, 0, 0.4)'
              : '0 1px 3px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: isDark
                ? '0 4px 12px rgba(0, 0, 0, 0.5)'
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            fontSize: '0.98rem',
            padding: '7px 16px',
            minHeight: 'unset',
            lineHeight: 1.5,
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
          },
          standardError: {
            background: isDark ? 'rgba(244, 67, 54, 0.15)' : 'rgba(255, 76, 76, 0.09)',
            color: isDark ? '#f44336' : '#b71c1c',
            border: isDark ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid #ffb3b3',
            boxShadow: '0 1px 6px 0 rgba(220,53,69,0.06)',
          },
          filledError: {
            background: isDark ? 'rgba(244, 67, 54, 0.2)' : 'rgba(255, 76, 76, 0.13)',
            color: isDark ? '#e57373' : '#b71c1c',
          },
          outlinedError: {
            background: isDark ? 'rgba(244, 67, 54, 0.05)' : 'rgba(255, 76, 76, 0.05)',
            color: isDark ? '#f44336' : '#b71c1c',
            border: isDark ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid #ffb3b3',
            boxShadow: '0 1.5px 8px 0 rgba(220,53,69,0.07)',
          },
          standardSuccess: {
            background: isDark ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.09)',
            color: isDark ? '#4caf50' : '#2e7d32',
            border: isDark ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid #a5d6a7',
          },
          standardInfo: {
            background: isDark ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.09)',
            color: isDark ? '#2196f3' : '#1565c0',
            border: isDark ? '1px solid rgba(33, 150, 243, 0.3)' : '1px solid #90caf9',
          },
          standardWarning: {
            background: isDark ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.09)',
            color: isDark ? '#ff9800' : '#e65100',
            border: isDark ? '1px solid rgba(255, 152, 0, 0.3)' : '1px solid #ffcc80',
          },
        },
      },
    },
  })
}

// Export default light theme for backward compatibility
const theme = createAppTheme('light')
export default theme
