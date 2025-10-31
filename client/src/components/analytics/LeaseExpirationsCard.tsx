import React, { useMemo, useCallback } from 'react'
import { Box, Typography, Card, CardContent, Chip, LinearProgress } from '@mui/material'
import { styled, alpha, useTheme } from '@mui/material/styles'
import { CalendarTodayOutlined } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { tenantsApi } from '../../api'

const StyledCard = styled(Card)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark'
  return {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 16,
    boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.45)' : '0 2px 12px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease-in-out',
    border: isDark ? `1px solid ${alpha(theme.palette.common.white, 0.08)}` : 'none',
    height: 350,
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      height: 330,
      borderRadius: 12,
    },
    '&:hover': {
      boxShadow: isDark ? '0 6px 18px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.12)',
      transform: 'translateY(-2px)',
    },
  }
})

const StyledLinearProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== 'progresscolor',
})<{ progresscolor: string }>(({ theme, progresscolor }) => ({
  height: 6,
  borderRadius: 3,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.12)
      : alpha(theme.palette.common.black, 0.06),
  '& .MuiLinearProgress-bar': {
    backgroundColor: progresscolor,
    borderRadius: 3,
  },
}))

const ProgressItem = styled(Box)({
  marginBottom: 12,
})

const LeaseItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isLast',
})<{ isLast?: boolean }>(({ theme, isLast }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: isLast ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.8)}`,
}))

interface LeaseExpirationData {
  period: string
  count: number
  color: string
  progress: number
}

interface UpcomingLease {
  tenant: string
  unit: string
  daysRemaining: number
  isUrgent: boolean
}

interface Tenant {
  _id?: string
  personalInfo?: {
    firstName?: string
    lastName?: string
  }
  leases?: Array<{
    _id?: string
    property?: string
    unit?: string
    startDate?: string
    endDate?: string
    status?: string
    monthlyRent?: string | number
  }>
}

const LeaseExpirationsCard: React.FC = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const scrollbarTrackColor = alpha(
    isDark ? theme.palette.common.white : theme.palette.common.black,
    isDark ? 0.12 : 0.08
  )
  const scrollbarThumbColor = alpha(
    isDark ? theme.palette.common.white : theme.palette.common.black,
    isDark ? 0.4 : 0.28
  )
  const scrollbarThumbHoverColor = alpha(
    isDark ? theme.palette.common.white : theme.palette.common.black,
    isDark ? 0.55 : 0.4
  )

  const getDaysChipStyle = useCallback(
    (days: number) => {
      if (days <= 15) {
        const color = theme.palette.error.main
        return {
          backgroundColor: color,
          color: theme.palette.getContrastText(color),
        }
      }
      if (days <= 30) {
        const color = theme.palette.warning.main
        return {
          backgroundColor: color,
          color: theme.palette.getContrastText(color),
        }
      }

      const neutralBg = isDark
        ? alpha(theme.palette.common.white, 0.22)
        : theme.palette.grey[600]
      const neutralText = isDark
        ? theme.palette.common.white
        : theme.palette.getContrastText(theme.palette.grey[600])

      return {
        backgroundColor: neutralBg,
        color: neutralText,
      }
    },
    [theme, isDark]
  )

  // Fetch tenants data
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Calculate lease expiration data from real tenants
  const { progressData, upcomingLeases } = useMemo(() => {
    if (!tenants.length) {
      return {
        progressData: [
          { period: 'This Month', count: 0, color: '#ff5252', progress: 0 },
          { period: 'Next Month', count: 0, color: '#ff9800', progress: 0 },
          { period: 'Next 3 Months', count: 0, color: '#2196f3', progress: 0 },
        ],
        upcomingLeases: [],
      }
    }

    const now = new Date()
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0)
    const threeMonthsEnd = new Date(now.getFullYear(), now.getMonth() + 4, 0)

    // Get all active leases with expiration dates
    const activeLeases: Array<{
      tenant: Tenant
      lease: NonNullable<Tenant['leases']>[0]
      daysRemaining: number
      endDate: Date
    }> = []

    tenants.forEach((tenant: Tenant) => {
      tenant.leases?.forEach((lease) => {
        if (lease.status === 'active' && lease.endDate) {
          const endDate = new Date(lease.endDate)
          const daysRemaining = Math.ceil(
            (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )

          // Only include leases expiring in the future within 3 months
          if (daysRemaining >= 0 && daysRemaining <= 90) {
            activeLeases.push({
              tenant,
              lease,
              daysRemaining,
              endDate,
            })
          }
        }
      })
    })

    // Sort by days remaining (most urgent first)
    activeLeases.sort((a, b) => a.daysRemaining - b.daysRemaining)

    // Count by periods
    const thisMonthCount = activeLeases.filter((l) => l.endDate <= thisMonthEnd).length
    const nextMonthCount = activeLeases.filter(
      (l) => l.endDate <= nextMonthEnd && l.endDate > thisMonthEnd
    ).length
    const threeMonthsCount = activeLeases.filter(
      (l) => l.endDate <= threeMonthsEnd && l.endDate > nextMonthEnd
    ).length

    const totalCount = Math.max(activeLeases.length, 1) // Avoid division by zero

    const progressData: LeaseExpirationData[] = [
      {
        period: 'This Month',
        count: thisMonthCount,
        color: '#ff5252',
        progress: (thisMonthCount / totalCount) * 100,
      },
      {
        period: 'Next Month',
        count: nextMonthCount,
        color: '#ff9800',
        progress: (nextMonthCount / totalCount) * 100,
      },
      {
        period: 'Next 2 Months',
        count: threeMonthsCount,
        color: '#2196f3',
        progress: (threeMonthsCount / totalCount) * 100,
      },
    ]

    // Get all upcoming leases for display (no limit)
    const upcomingLeases: UpcomingLease[] = activeLeases.map(
      ({ tenant, lease, daysRemaining }) => ({
        tenant:
          `${tenant.personalInfo?.firstName || ''} ${tenant.personalInfo?.lastName || ''}`.trim() ||
          'Unknown Tenant',
        unit: lease?.unit || 'Main Unit',
        daysRemaining,
        isUrgent: daysRemaining <= 15,
      })
    )

    return { progressData, upcomingLeases }
  }, [tenants])

  return (
    <StyledCard>
      <CardContent sx={{ p: 2, pb: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarTodayOutlined sx={{ fontSize: 16, color: 'secondary.main', mr: 1 }} />
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            Lease Expirations
          </Typography>
        </Box>

        {/* Progress Bars Section */}
        <Box sx={{ mb: 2 }}>
          {progressData.map((item, index) => (
            <ProgressItem key={index}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                  }}
                >
                  {item.period}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                  }}
                >
                  {item.count} {item.count === 1 ? 'lease' : 'leases'}
                </Typography>
              </Box>
              <StyledLinearProgress
                variant="determinate"
                value={item.progress}
                progresscolor={item.color}
              />
            </ProgressItem>
          ))}
        </Box>

        {/* Upcoming Section */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.7rem',
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Upcoming
          </Typography>

          <Box
            sx={{
              maxHeight: 200,
              overflowY: 'auto',
              pr: 0.5,
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: scrollbarTrackColor,
                borderRadius: '2px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: scrollbarThumbColor,
                borderRadius: '2px',
                '&:hover': {
                  background: scrollbarThumbHoverColor,
                },
              },
            }}
          >
            {isLoading ? (
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontSize: '0.7rem', textAlign: 'center', py: 2 }}
              >
                Loading...
              </Typography>
            ) : upcomingLeases.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontSize: '0.7rem', textAlign: 'center', py: 2 }}
              >
                No upcoming expirations
              </Typography>
            ) : (
              upcomingLeases.map((lease, index) => (
                <LeaseItem key={index} isLast={index === upcomingLeases.length - 1}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        lineHeight: 1.2,
                      }}
                    >
                      {lease.tenant}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.6rem',
                      }}
                    >
                      {lease.unit}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${lease.daysRemaining} days`}
                    size="small"
                    sx={{
                      ...getDaysChipStyle(lease.daysRemaining),
                      fontSize: '0.6rem',
                      fontWeight: 500,
                      height: 20,
                    }}
                  />
                </LeaseItem>
              ))
            )}
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  )
}

export default LeaseExpirationsCard
