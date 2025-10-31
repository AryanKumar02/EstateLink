import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Switch,
  Tabs,
  Tab,
  Divider,
  useTheme,
  useMediaQuery,
  Stack,
  Card,
  CardContent,
} from '@mui/material'
import Sidebar from '../../components/common/Sidebar'
import Titlebar from '../../components/basic/Titlebar'
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle as AccountIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
} from '@mui/icons-material'
import { useThemeMode, useToggleTheme } from '../../stores/themeStore'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const Settings: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [activeTab, setActiveTab] = useState(0)
  const themeMode = useThemeMode()
  const toggleTheme = useToggleTheme()

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const isDarkMode = themeMode === 'dark'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Titlebar at the top */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: { xs: 0, md: '280px' },
          right: 0,
          zIndex: 1200,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Titlebar title="Settings" hideSearch hideAddButton />
      </Box>

      {/* Main layout with sidebar and content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '80px', md: '100px' } }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: 'background.default',
            minHeight: 'calc(100vh - 100px)',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              maxWidth: 900,
              mx: 'auto',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant={isMobile ? 'fullWidth' : 'standard'}
                sx={{
                  px: { xs: 1, sm: 2 },
                  '& .MuiTab-root': {
                    minHeight: { xs: 56, sm: 64 },
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    fontWeight: 500,
                    textTransform: 'none',
                  },
                }}
              >
                <Tab
                  icon={<PaletteIcon fontSize="small" />}
                  label="Appearance"
                  iconPosition="start"
                />
                <Tab
                  icon={<AccountIcon fontSize="small" />}
                  label="Account"
                  iconPosition="start"
                />
                <Tab
                  icon={<SecurityIcon fontSize="small" />}
                  label="Security"
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Appearance Tab */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ px: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  Appearance Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Customize how HomeIQ looks on your device
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Dark Mode Setting */}
                <Card
                  variant="outlined"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[2],
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: isDarkMode
                              ? 'primary.main'
                              : 'action.hover',
                            color: isDarkMode
                              ? 'primary.contrastText'
                              : 'text.secondary',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {isDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: 'text.primary',
                              mb: 0.5,
                            }}
                          >
                            Dark Mode
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {isDarkMode
                              ? 'Dark theme is currently active'
                              : 'Light theme is currently active'}
                          </Typography>
                        </Box>
                      </Box>

                      <Switch
                        checked={isDarkMode}
                        onChange={toggleTheme}
                        color="primary"
                        inputProps={{ 'aria-label': 'toggle dark mode' }}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'primary.main',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'primary.main',
                          },
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: isDarkMode
                      ? 'rgba(61, 130, 247, 0.1)'
                      : 'action.hover',
                    border: '1px solid',
                    borderColor: isDarkMode
                      ? 'rgba(61, 130, 247, 0.2)'
                      : 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Your theme preference is automatically saved and will be applied across all your
                    devices when you sign in.
                  </Typography>
                </Box>
              </Box>
            </TabPanel>

            {/* Account Tab */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ px: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  Account Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Manage your account information and preferences
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <AccountIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1">
                    Account settings coming soon
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Manage your profile, email, and password here
                  </Typography>
                </Box>
              </Box>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={activeTab} index={2}>
              <Box sx={{ px: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  Security Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Manage your security preferences and login options
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1">
                    Security settings coming soon
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Two-factor authentication and session management
                  </Typography>
                </Box>
              </Box>
            </TabPanel>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default Settings
