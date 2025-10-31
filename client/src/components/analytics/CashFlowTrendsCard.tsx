import React, { useMemo, useState } from 'react'
import { Box, Typography, Card, CardContent, useTheme } from '@mui/material'
import { styled } from '@mui/material/styles'
import { TrendingUpOutlined, TrendingDownOutlined, ShowChartOutlined } from '@mui/icons-material'
import useRealTimeAnalytics from '../../hooks/useRealTimeAnalytics'
import { useCurrency } from '../../hooks/useCurrency'
import { useHistoricalAnalyticsData } from '../../contexts/AnalyticsProvider'
import type { MonthlyAnalytics } from '../../api/analytics'

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
  borderRadius: 16,
  boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0, 0, 0, 0.3)' : '0 2px 12px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  border: 'none',
  height: 320,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    height: 320,
    borderRadius: 12,
  },
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}))

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 160,
  position: 'relative',
  margin: '16px 8px 8px 8px',
  border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
  borderRadius: 8,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
}))

const LineChart = styled('svg')({
  width: '100%',
  height: '100%',
  overflow: 'visible',
})

const DataPoint = styled('circle')<{ isPositive: boolean; isReal: boolean }>(
  ({ theme, isPositive, isReal }) => ({
    fill: !isReal
      ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')
      : isPositive ? theme.palette.secondary.main : '#e67e22',
    stroke: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
    strokeWidth: !isReal ? 3 : 2,
    r: 4,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    opacity: 1,
    '&:hover': {
      r: 6,
      strokeWidth: !isReal ? 4 : 3,
      opacity: 1,
    },
  })
)

const GridLine = styled('line')(({ theme }) => ({
  stroke: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  strokeWidth: 1,
  strokeDasharray: '2,2',
}))

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const extractMetrics = (source: unknown) => {
  if (!source || typeof source !== 'object') {
    return { revenue: 0, expenses: 0, cashFlow: 0 }
  }

  const record = source as Record<string, unknown>
  const revenueRecord =
    (record.monthlyRevenue as number | string | undefined) ??
    ((record.revenue as { total?: number | string } | undefined)?.total)
  const expensesRecord =
    (record.monthlyExpenses as number | string | undefined) ??
    ((record.expenses as { total?: number | string } | undefined)?.total)
  const performanceRecord = record.performance as { netOperatingIncome?: number | string } | null

  const revenue = toNumber(revenueRecord)
  const expenses = toNumber(expensesRecord)

  const netOperatingIncomeValue =
    (record.netOperatingIncome as number | string | undefined) ??
    (performanceRecord?.netOperatingIncome ?? null)

  let cashFlow = toNumber(netOperatingIncomeValue)
  if (netOperatingIncomeValue == null) {
    cashFlow = revenue - expenses
  }

  return { revenue, expenses, cashFlow }
}

type TrendDataPoint = {
  month: string
  year: number
  monthNumber: number
  cashFlow: number
  revenue: number
  expenses: number
  isReal: boolean
  source: 'realtime' | 'snapshot' | 'placeholder'
}

const CashFlowTrendsCard: React.FC = () => {
  const theme = useTheme()
  const { analytics } = useRealTimeAnalytics()
  const { formatPrice } = useCurrency()
  const { data: historicalAnalytics = [] } = useHistoricalAnalyticsData()
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  const trendsData = useMemo<TrendDataPoint[]>(() => {
    const now = new Date()
    const months: Array<{
      monthName: string
      year: number
      month: number
      isCurrentMonth: boolean
    }> = []

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        monthName: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        year: monthDate.getFullYear(),
        month: monthDate.getMonth() + 1,
        isCurrentMonth: i === 0,
      })
    }

    const analyticsByMonth = historicalAnalytics.reduce<Map<string, MonthlyAnalytics>>(
      (acc, entry) => {
        const key = `${entry.year}-${String(entry.month).padStart(2, '0')}`
        acc.set(key, entry)
        return acc
      },
      new Map()
    )

    return months.map((monthInfo) => {
      const key = `${monthInfo.year}-${String(monthInfo.month).padStart(2, '0')}`
      const snapshot = analyticsByMonth.get(key)

      let source: MonthlyAnalytics | typeof analytics | null = snapshot ?? null
      let sourceType: TrendDataPoint['source'] = snapshot ? 'snapshot' : 'placeholder'

      if (monthInfo.isCurrentMonth) {
        if (analytics) {
          source = analytics
          sourceType = 'realtime'
        } else if (snapshot) {
          sourceType = 'snapshot'
        } else {
          sourceType = 'placeholder'
        }
      }

      const metrics = extractMetrics(source)

      return {
        month: monthInfo.monthName,
        year: monthInfo.year,
        monthNumber: monthInfo.month,
        cashFlow: metrics.cashFlow,
        revenue: metrics.revenue,
        expenses: metrics.expenses,
        isReal: source !== null,
        source: sourceType,
      }
    })
  }, [analytics, historicalAnalytics])

  const currentMonthData = trendsData[trendsData.length - 1]
  const currentCashFlow = currentMonthData?.cashFlow ?? 0

  // Calculate chart dimensions and scaling
  const chartWidth = 280
  const chartHeight = 120
  const padding = { top: 20, right: 20, bottom: 20, left: 20 }
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom

  const realCashFlows = trendsData.filter((d) => d.isReal).map((d) => d.cashFlow)
  let minValue: number
  let maxValue: number

  if (realCashFlows.length > 0) {
    const minReal = Math.min(...realCashFlows)
    const maxReal = Math.max(...realCashFlows)
    const paddingAmount = Math.max(Math.abs(minReal), Math.abs(maxReal), 100) * 0.1
    minValue = minReal - paddingAmount
    maxValue = maxReal + paddingAmount

    if (minValue === maxValue) {
      minValue -= 100
      maxValue += 100
    }
  } else {
    minValue = -1000
    maxValue = 1000
  }

  const valueRange = maxValue - minValue || 1

  const points = trendsData.map((data, index) => {
    const x = padding.left + (index / Math.max(trendsData.length - 1, 1)) * plotWidth
    const unclampedY = padding.top + ((maxValue - data.cashFlow) / valueRange) * plotHeight
    const y = clamp(unclampedY, padding.top, padding.top + plotHeight)
    return { x, y, data }
  })

  const realIndices = trendsData.reduce<number[]>((acc, data, index) => {
    if (data.isReal) {
      acc.push(index)
    }
    return acc
  }, [])

  const lastValue = currentCashFlow
  let trendPercentage = 0
  let isPositiveTrend = true

  if (realIndices.length >= 2) {
    const firstIndex = realIndices[0]
    const lastIndex = realIndices[realIndices.length - 1]
    const firstValue = trendsData[firstIndex]?.cashFlow ?? 0
    const lastValueForTrend = trendsData[lastIndex]?.cashFlow ?? 0
    const baseline = Math.abs(firstValue)

    if (baseline > 0) {
      trendPercentage = ((lastValueForTrend - firstValue) / baseline) * 100
    } else if (Math.abs(lastValueForTrend) > 0) {
      trendPercentage = 100
    }

    isPositiveTrend = lastValueForTrend >= firstValue
  } else if (realIndices.length === 1) {
    const value = trendsData[realIndices[0]]?.cashFlow ?? 0
    isPositiveTrend = value >= 0
    trendPercentage = 0
  } else {
    trendPercentage = 0
    isPositiveTrend = true
  }

  if (!Number.isFinite(trendPercentage)) {
    trendPercentage = 0
  }

  const zeroPosition = padding.top + ((maxValue - 0) / valueRange) * plotHeight
  const zeroY = clamp(zeroPosition, padding.top, padding.top + plotHeight)
  const gridLines = [
    { y: padding.top },
    { y: zeroY },
    { y: padding.top + plotHeight },
  ]

  const realDataCount = trendsData.filter((d) => d.isReal).length
  const hoveredData = hoveredPoint !== null ? points[hoveredPoint] : null
  const hoveredFlowDescriptor =
    hoveredData && hoveredData.data.isReal
      ? `${hoveredData.data.cashFlow >= 0 ? 'Positive flow' : 'Negative flow'} • ${
          hoveredData.data.source === 'realtime' ? 'Live data' : 'Snapshot'
        }`
      : ''
  const hoveredSourceDescriptor =
    hoveredData && !hoveredData.data.isReal ? 'No snapshot yet' : ''
  const trendDisplay = Math.abs(trendPercentage).toFixed(1)

  return (
    <StyledCard>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShowChartOutlined sx={{ fontSize: 16, color: '#3d82f7', mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              Cash Flow Trends
            </Typography>
          </Box>
          {isPositiveTrend ? (
            <TrendingUpOutlined sx={{ color: 'secondary.main', fontSize: '1.2rem' }} />
          ) : (
            <TrendingDownOutlined sx={{ color: '#e67e22', fontSize: '1.2rem' }} />
          )}
        </Box>

        {/* Current vs Previous */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
              Current Month
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: lastValue >= 0 ? 'secondary.main' : '#e67e22',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              {formatPrice(lastValue)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
              6-Month Trend
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isPositiveTrend ? 'secondary.main' : '#e67e22',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.5,
              }}
            >
              {isPositiveTrend ? '↗' : '↘'} {trendDisplay}%
            </Typography>
          </Box>
        </Box>

        {/* Line Chart */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <ChartContainer>
            <LineChart viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              {/* Grid lines */}
              {gridLines.map((line, index) => (
                <GridLine
                  key={index}
                  x1={padding.left}
                  y1={line.y}
                  x2={chartWidth - padding.right}
                  y2={line.y}
                />
              ))}

              {/* Zero line (thicker) */}
              <line
                x1={padding.left}
                y1={zeroY}
                x2={chartWidth - padding.right}
                y2={zeroY}
                stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                strokeWidth={1.5}
              />

              {/* Area fill (gradient) */}
              <defs>
                <linearGradient id="positiveAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    style={{ stopColor: 'var(--mui-palette-secondary-main)', stopOpacity: 0.2 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: 'var(--mui-palette-secondary-main)', stopOpacity: 0.05 }}
                  />
                </linearGradient>
                <linearGradient id="negativeAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#e67e22', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: '#e67e22', stopOpacity: 0.05 }} />
                </linearGradient>
              </defs>

              {/* Area fills for each segment */}
              {points.map((point, index) => {
                if (index === 0) return null
                const prevPoint = points[index - 1]
                const isSegmentPositive = point.data.cashFlow >= 0
                const segmentPath = `M ${prevPoint.x} ${prevPoint.y} L ${point.x} ${point.y} L ${point.x} ${zeroY} L ${prevPoint.x} ${zeroY} Z`

                return (
                  <path
                    key={`area-${index}`}
                    d={segmentPath}
                    fill={`url(#${isSegmentPositive ? 'positive' : 'negative'}AreaGradient)`}
                  />
                )
              })}

              {/* Main line segments with dynamic colors */}
              {points.map((point, index) => {
                if (index === 0) return null
                const prevPoint = points[index - 1]
                const isSegmentPositive = point.data.cashFlow >= 0
                const segmentColor = isSegmentPositive
                  ? 'var(--mui-palette-secondary-main)'
                  : '#e67e22'
                const segmentOpacity = point.data.isReal ? 1 : 0.4

                return (
                  <line
                    key={`line-${index}`}
                    x1={prevPoint.x}
                    y1={prevPoint.y}
                    x2={point.x}
                    y2={point.y}
                    stroke={segmentColor}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    opacity={segmentOpacity}
                    strokeDasharray={!point.data.isReal ? '4,2' : 'none'}
                  />
                )
              })}

              {/* Data points */}
              {points.map((point, index) => (
                <DataPoint
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  isPositive={point.data.cashFlow >= 0}
                  isReal={point.data.isReal}
                  onMouseEnter={() => {
                    setHoveredPoint(index)
                  }}
                  onMouseLeave={() => {
                    setHoveredPoint(null)
                  }}
                />
              ))}

              {/* Customized SVG tooltip */}
              {hoveredData && (
                <g>
                  {/* Tooltip shadow */}
                  <rect
                    x={hoveredData.x - 65}
                    y={hoveredData.y - 62}
                    width="130"
                    height="50"
                    fill="rgba(0,0,0,0.15)"
                    rx="8"
                    transform="translate(2, 2)"
                  />

                  {/* Main tooltip background */}
                  <rect
                    x={hoveredData.x - 65}
                    y={hoveredData.y - 62}
                    width="130"
                    height="50"
                    fill={theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff'}
                    stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
                    strokeWidth="1"
                    rx="8"
                  />

                  {/* Month label */}
                  <text
                    x={hoveredData.x}
                    y={hoveredData.y - 45}
                    textAnchor="middle"
                    fill={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}
                    fontSize="9"
                    fontWeight="500"
                  >
                    {hoveredData.data.month} {hoveredData.data.year}
                  </text>

                  {/* Cash Flow amount */}
                  <text
                    x={hoveredData.x}
                    y={hoveredData.y - 32}
                    textAnchor="middle"
                    fill={hoveredData.data.cashFlow >= 0 ? '#1976d2' : '#e67e22'}
                    fontSize="12"
                    fontWeight="700"
                  >
                    {hoveredData.data.isReal
                      ? formatPrice(hoveredData.data.cashFlow)
                      : 'No snapshot'}
                  </text>

                  {/* Status indicator */}
                  <text
                    x={hoveredData.x}
                    y={hoveredData.y - 19}
                    textAnchor="middle"
                    fill={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                    fontSize="8"
                  >
                    {hoveredData.data.isReal ? hoveredFlowDescriptor : hoveredSourceDescriptor}
                  </text>

                  {/* Tooltip pointer */}
                  <polygon
                    points={`${hoveredData.x - 6},${hoveredData.y - 12} ${hoveredData.x + 6},${hoveredData.y - 12} ${hoveredData.x},${hoveredData.y - 5}`}
                    fill={theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff'}
                    stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
                    strokeWidth="1"
                  />
                </g>
              )}

              {/* Month labels */}
              {points.map((point, index) => (
                <text
                  key={`label-${index}`}
                  x={point.x}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}
                >
                  {point.data.month}
                </text>
              ))}
            </LineChart>
          </ChartContainer>
        </Box>

        {/* Footer Stats */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: 1,
            borderTop: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
              Real Data
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.primary' }}
            >
              {realDataCount}/6 months
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
              Current
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.7rem',
                color: currentCashFlow >= 0 ? 'secondary.main' : '#e67e22',
              }}
            >
              {formatPrice(currentCashFlow)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
              Status
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.7rem',
                color: currentCashFlow >= 0 ? 'secondary.main' : '#e67e22',
              }}
            >
              {currentCashFlow >= 0 ? 'Positive' : 'Negative'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  )
}

export default CashFlowTrendsCard
