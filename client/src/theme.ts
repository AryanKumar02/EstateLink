import { createTheme, type PaletteMode } from '@mui/material/styles'

// Extend the theme interface to include custom colors
declare module '@mui/material/styles' {
  interface TypeBackground {
    section?: string
  }
  interface Palette {
    border: {
      light: string
      main: string
    }
    text: {
      primary: string
      secondary: string
      disabled: string
    }
  }
  interface PaletteOptions {
    background?: Partial<TypeBackground>
    border?: {
      light?: string
      main?: string
    }
  }
}

export const createAppTheme = (mode: PaletteMode) => {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#3d82f7',
        light: '#6fa4f9',
        dark: '#2b5cbf',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#3d82f7',
        light: '#6fa4f9',
        dark: '#2b5cbf',
        contrastText: '#ffffff',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
        contrastText: '#ffffff',
      },
      info: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
        contrastText: '#ffffff',
      },
      error: {
        main: isDark ? '#f44336' : '#d32f2f',
        light: isDark ? '#e57373' : '#ef5350',
        dark: isDark ? '#c62828' : '#c62828',
      },
      grey: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
      },
      background: {
        default: isDark ? '#0a0e27' : '#f7f8fa',
        paper: isDark ? '#131729' : '#ffffff',
        section: isDark ? '#1a1f3a' : '#f5f8ff',
      },
      text: {
        primary: isDark ? '#e4e6eb' : '#2d3748',
        secondary: isDark ? '#a0a3b1' : '#718096',
        disabled: isDark ? '#6b6f7f' : '#9e9e9e',
      },
      border: {
        light: isDark ? '#2a2f45' : '#e0e3e7',
        main: isDark ? '#3a3f55' : '#bdbdbd',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 500,
      },
      h2: {
        fontWeight: 500,
      },
      h3: {
        fontWeight: 500,
      },
      h4: {
        fontWeight: 500,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
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
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
            padding: '10px 24px',
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            boxShadow: isDark
              ? '0 4px 14px 0 rgba(0,0,0,0.4)'
              : '0 4px 14px 0 rgba(61, 130, 247, 0.2)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDark
                ? '0 6px 20px 0 rgba(0,0,0,0.6)'
                : '0 6px 20px 0 rgba(61, 130, 247, 0.3)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)',
            color: isDark ? '#fff' : 'inherit',
            '&:hover': {
              borderWidth: '1.5px',
              borderColor: isDark ? '#fff' : 'rgba(0, 0, 0, 0.3)',
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.02)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '& fieldset': {
                borderWidth: '1.5px',
                transition:
                  'border-color 0.35s cubic-bezier(0.4,0,0.2,1), border-width 0.25s cubic-bezier(0.4,0,0.2,1)',
              },
              '&:hover fieldset': {
                borderWidth: '2px',
              },
              '&.Mui-focused fieldset': {
                borderWidth: '2px',
              },
            },
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
            borderRadius: 12,
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
      MuiChip: {
        styleOverrides: {
          root: {
            '&.MuiChip-colorSuccess': {
              '& .MuiChip-label': {
                color: '#ffffff',
              },
            },
            '&.MuiChip-colorWarning': {
              '& .MuiChip-label': {
                color: '#ffffff',
              },
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
