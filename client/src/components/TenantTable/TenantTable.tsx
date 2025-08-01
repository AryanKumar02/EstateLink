import React, { useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantsApi } from '../../api/tenants'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Skeleton,
  useTheme,
  useMediaQuery,
  type SelectChangeEvent,
} from '@mui/material'
import {
  Person as PersonIcon,
  Home as PropertyIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Label as StatusIcon,
  Settings as ActionsIcon,
} from '@mui/icons-material'
import type { TenantTableProps, TenantTableData, PaginationInfo } from '../../types/tenantTable'
import { usePaginationText, tenantTableKeys } from '../../hooks/useTenantsTable'
import TenantRow from './TenantRow'

/**
 * Loading skeleton for table rows
 */
const TableRowSkeleton: React.FC = () => (
  <TableRow>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="80%" height={16} />
        </Box>
      </Box>
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width="70%" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width="80%" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" width="60%" />
    </TableCell>
    <TableCell>
      <Skeleton variant="rectangular" width={80} height={24} />
    </TableCell>
    <TableCell>
      <Skeleton variant="circular" width={32} height={32} />
    </TableCell>
  </TableRow>
)

/**
 * Empty state component
 */
const EmptyState: React.FC<{ isSearch: boolean; searchTerm?: string }> = ({
  isSearch,
  searchTerm,
}) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
        background: `radial-gradient(ellipse at center,
          ${theme.palette.secondary.main}08 0%,
          ${theme.palette.secondary.main}04 50%,
          transparent 100%)`,
        borderRadius: 3,
        border: `2px dashed ${theme.palette.secondary.main}30`,
        mx: 2,
        mb: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `conic-gradient(from 0deg,
            transparent 0deg,
            ${theme.palette.secondary.main}08 90deg,
            transparent 180deg)`,
          animation: 'rotate 20s linear infinite',
          opacity: 0.3,
        },
        '@keyframes rotate': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      }}
    >
      <PersonIcon
        sx={{
          fontSize: 64,
          background: `linear-gradient(135deg,
            ${theme.palette.secondary.main} 0%,
            ${theme.palette.secondary.main} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 2px 4px rgba(3, 108, 163, 0.2))',
          mb: 2,
          position: 'relative',
          zIndex: 1,
        }}
      />
      <Typography
        variant="h6"
        sx={{ mb: 1, color: theme.palette.grey[600], position: 'relative', zIndex: 1 }}
      >
        {isSearch ? 'No tenants found' : 'No tenants yet'}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: theme.palette.grey[500], position: 'relative', zIndex: 1 }}
      >
        {isSearch
          ? `No tenants match "${searchTerm}". Try adjusting your search terms.`
          : 'Get started by adding your first tenant to the system.'}
      </Typography>
    </Box>
  )
}

/**
 * TenantTable component displays tenant data in a responsive table format
 * with pagination, status indicators, and action buttons
 *
 * @param props - Component props
 * @returns Complete tenant table with pagination and controls
 */
const TenantTable: React.FC<TenantTableProps> = ({
  tenants = [],
  searchTerm = '',
  isLoading: externalLoading = false,
  onTenantView = () => {},
  onTenantEdit = () => {},
  onTenantDelete = () => {},
}) => {
  // Type guard function to check if an item is a valid TenantTableData
  const isValidTenant = (item: unknown): item is TenantTableData => {
    return (
      item !== null &&
      typeof item === 'object' &&
      'id' in item &&
      'name' in item &&
      'email' in item
    )
  }

  // Ensure we have a properly typed tenant array - filter out invalid items
  const allTenants: TenantTableData[] = useMemo(() => {
    if (!tenants || !Array.isArray(tenants)) return []
    return tenants.filter(isValidTenant)
  }, [tenants])
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Client-side pagination
  const totalPages: number = Math.ceil(allTenants.length / pageSize)
  const startIndex: number = (page - 1) * pageSize
  const paginatedTenants: TenantTableData[] = allTenants.slice(startIndex, startIndex + pageSize)

  // Loading state - use external loading state with type safety
  const isLoading: boolean = Boolean(externalLoading)
  const isEmpty = allTenants.length === 0
  const isEmptySearch = isEmpty && !!searchTerm

  // Create pagination info for display
  const pagination: PaginationInfo = {
    page,
    limit: pageSize,
    total: allTenants.length,
    totalPages,
  }

  const paginationText = usePaginationText(pagination)

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value))
    setPage(1) // Reset to first page when changing page size
  }

  // Set up delete mutation
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: tenantsApi.delete,
    onSuccess: () => {
      // Invalidate and refetch tenants data
      void queryClient.invalidateQueries({ queryKey: tenantTableKeys.all })
    },
    onError: (error: unknown) => {
      console.error('Failed to delete tenant:', error)
      // Check if it's a 400 error (business logic prevention)
      if (error && typeof error === 'object' && 'response' in error) {
        const response = error.response as { status?: number; data?: { message?: string } }
        if (response.status === 400) {
          alert(
            response.data?.message ||
              'Cannot delete tenant with active leases. Please terminate leases first.'
          )
          return
        }
      }
      alert('Failed to delete tenant. Please try again.')
    },
  })

  const handleDeleteTenant = (tenantId: string) => {
    try {
      deleteMutation.mutate(tenantId)
      if (onTenantDelete && typeof onTenantDelete === 'function') {
        onTenantDelete(tenantId)
      }
    } catch (error: unknown) {
      console.error('Error deleting tenant:', error)
    }
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Table Container */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
          minWidth: isMobile ? 350 : 650,
          flex: 1,
          mt: 2,
          boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <Table
          sx={{
            width: '100%',
            minWidth: isMobile ? 350 : 650,
            tableLayout: 'fixed',
          }}
          aria-label="Tenant management table"
        >
          <TableHead>
            <TableRow
              sx={{
                background: `linear-gradient(135deg,
                  ${theme.palette.secondary.main}08 0%,
                  ${theme.palette.secondary.main}06 50%,
                  ${theme.palette.secondary.main}04 100%)`,
                borderBottom: `2px solid ${theme.palette.secondary.main}20`,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: `linear-gradient(90deg,
                    transparent 0%,
                    ${theme.palette.secondary.main}40 20%,
                    ${theme.palette.secondary.main}60 50%,
                    ${theme.palette.secondary.main}40 80%,
                    transparent 100%)`,
                },
              }}
            >
              <TableCell sx={{ px: isMobile ? 1 : 3, py: 2, width: isMobile ? '35%' : '30%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon
                    fontSize="small"
                    sx={{
                      color: theme.palette.secondary.main,
                      filter: 'drop-shadow(0 1px 2px rgba(3, 108, 163, 0.2))',
                    }}
                  />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Tenant
                  </Typography>
                </Box>
              </TableCell>

              {!isMobile && (
                <TableCell sx={{ px: 3, py: 2, width: '25%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PropertyIcon
                      fontSize="small"
                      sx={{
                        color: theme.palette.secondary.main,
                        filter: 'drop-shadow(0 1px 2px rgba(61, 130, 247, 0.2))',
                      }}
                    />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Property
                    </Typography>
                  </Box>
                </TableCell>
              )}

              {!isMobile && (
                <TableCell sx={{ px: 3, py: 2, width: '20%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon
                      fontSize="small"
                      sx={{
                        color: theme.palette.warning.main,
                        filter: 'drop-shadow(0 1px 2px rgba(255, 152, 0, 0.2))',
                      }}
                    />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Lease Ends
                    </Typography>
                  </Box>
                </TableCell>
              )}

              {/* Rent Column - Show on mobile, hide on tablet */}
              {(isMobile || !isTablet) && (
                <TableCell
                  align="right"
                  sx={{ px: isMobile ? 2 : 3, py: 2, width: isMobile ? '20%' : '15%' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <MoneyIcon
                      fontSize="small"
                      sx={{
                        color: theme.palette.success.main,
                        filter: 'drop-shadow(0 1px 2px rgba(76, 175, 80, 0.2))',
                      }}
                    />
                    {!isMobile && (
                      <Typography variant="subtitle2" fontWeight={600}>
                        Rent
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              )}

              <TableCell sx={{ px: isMobile ? 3 : 3, py: 2, width: isMobile ? '23%' : '15%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StatusIcon
                    fontSize="small"
                    sx={{
                      color: theme.palette.info.main,
                      filter: 'drop-shadow(0 1px 2px rgba(33, 150, 243, 0.2))',
                    }}
                  />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Status
                  </Typography>
                </Box>
              </TableCell>

              <TableCell
                align="right"
                sx={{ px: isMobile ? 3 : 3, py: 2, width: isMobile ? '22%' : '80px' }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}
                >
                  <ActionsIcon
                    fontSize="small"
                    sx={{
                      color: theme.palette.grey[600],
                      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                    }}
                  />
                  {!isMobile && (
                    <Typography variant="subtitle2" fontWeight={600}>
                      Actions
                    </Typography>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Loading State */}
            {isLoading && (
              <>
                {Array.from({ length: pageSize }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))}
              </>
            )}

            {/* Data Rows */}
            {!isLoading &&
              paginatedTenants.map((tenant) => (
                <TenantRow
                  key={tenant.id}
                  tenant={tenant}
                  onView={onTenantView}
                  onEdit={onTenantEdit}
                  onDelete={handleDeleteTenant}
                />
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Empty State */}
      {(isEmpty || isEmptySearch) && !isLoading && (
        <EmptyState isSearch={!!isEmptySearch} searchTerm={searchTerm} />
      )}

      {/* Pagination and Controls */}
      {!isLoading && !isEmpty && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'space-between',
            alignItems: 'center',
            mt: 3,
            mb: 2,
            flexWrap: 'wrap',
            gap: isMobile ? 2 : 3,
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          {/* Pagination Info */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              minWidth: 'fit-content',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                letterSpacing: '0.02em',
                textAlign: isMobile ? 'center' : 'left',
              }}
            >
              {paginationText}
            </Typography>
          </Box>

          {/* Pagination Component */}
          {pagination.totalPages > 1 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flex: '1',
                justifyContent: 'center',
                minWidth: 'fit-content',
              }}
            >
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="small"
                showFirstButton
                showLastButton
                aria-label="Tenant table pagination"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontWeight: 500,
                    borderRadius: 2,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: `1px solid transparent`,
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                      background: `linear-gradient(135deg,
                        ${theme.palette.secondary.main}08 0%,
                        ${theme.palette.secondary.main}06 100%)`,
                      border: `1px solid ${theme.palette.secondary.main}20`,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 2px 8px rgba(3, 108, 163, 0.15)`,
                    },
                    '&.Mui-selected': {
                      background: `linear-gradient(135deg,
                        ${theme.palette.secondary.main} 0%,
                        ${theme.palette.secondary.main} 100%)`,
                      color: 'white',
                      fontWeight: 600,
                      boxShadow: `0 2px 12px rgba(3, 108, 163, 0.3)`,
                      '&:hover': {
                        background: `linear-gradient(135deg,
                          ${theme.palette.primary.dark} 0%,
                          ${theme.palette.secondary.dark} 100%)`,
                        transform: 'translateY(-1px)',
                      },
                    },
                  },
                }}
              />
            </Box>
          )}

          {/* Page Size Selector */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 1 : 2,
              minWidth: 'fit-content',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                whiteSpace: 'nowrap',
              }}
            >
              Show:
            </Typography>
            <FormControl
              size="small"
              variant="outlined"
              sx={{
                minWidth: 80,
                '& .MuiOutlinedInput-root': {
                  background: `linear-gradient(135deg,
                    ${theme.palette.background.paper} 0%,
                    ${theme.palette.secondary.main}04 100%)`,
                  borderRadius: 2,
                  fontWeight: 500,
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `1px solid ${theme.palette.divider}40`,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&:hover': {
                    background: `linear-gradient(135deg,
                      ${theme.palette.secondary.main}06 0%,
                      ${theme.palette.secondary.main}04 100%)`,
                    border: `1px solid ${theme.palette.secondary.main}30`,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 2px 12px rgba(3, 108, 163, 0.12)`,
                  },
                  '&.Mui-focused': {
                    background: `linear-gradient(135deg,
                      ${theme.palette.secondary.main}08 0%,
                      ${theme.palette.secondary.main}06 100%)`,
                    border: `1px solid ${theme.palette.secondary.main}50`,
                    boxShadow: `0 0 0 3px ${theme.palette.secondary.main}15`,
                    transform: 'translateY(-1px)',
                  },
                },
              }}
            >
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                disabled={isLoading}
                displayEmpty
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '& .MuiSelect-select': {
                    py: 1,
                    px: 1.5,
                  },
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default TenantTable
