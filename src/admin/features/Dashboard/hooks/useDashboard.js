import { useMemo } from 'react'
import { useLowStockProductsQuery, useProductsQuery } from '../../../../queries/products/useProductQueries'
import { useOrdersQuery, useOrderStats } from '../../../../queries/orders/useOrderQueries'
import { PackageX, TrendingUp, Package, ClipboardList } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function getOrderDate(order) {
    if (!order) return null
    const rawDate = order.createdAt || order.createAt || (order.date ? `${order.date} ${order.time || '00:00'}` : null)
    if (!rawDate) return null
    const parsed = new Date(rawDate)
    return isNaN(parsed.getTime()) ? null : parsed
}

function calculatePercentageChange(current, previous) {
    if (previous === 0) {
        return current > 0 ? 100 : 0
    }
    const change = ((current - previous) / previous) * 100
    return Number(change.toFixed(1))
}

export default function useDashboard() {
    const { t } = useTranslation()
    const { totalLowStockProducts, isPending: isLowStockPending } = useLowStockProductsQuery()
    const { data: products = [], isPending: isProductsPending } = useProductsQuery()
    const { data: orders = [], isPending: isOrdersPending } = useOrdersQuery()
    const { totalRevenue, topSellingProducts, isPending: isStatsPending } = useOrderStats()

    const isLoading = isLowStockPending || isOrdersPending || isStatsPending || isProductsPending

    const statsData = useMemo(() => {
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth()

        // Previous month date reference
        const prevMonthRef = new Date(currentYear, currentMonth - 1, 1)
        const prevYear = prevMonthRef.getFullYear()
        const prevMonth = prevMonthRef.getMonth()

        let currentMonthRevenue = 0
        let prevMonthRevenue = 0
        let currentMonthOrdersCount = 0
        let prevMonthOrdersCount = 0
        let currentMonthUnitsSold = 0
        let prevMonthUnitsSold = 0

        // Track units sold by product in current month for low-stock trend analysis
        const currentMonthSalesByProduct = {}

        for (const order of orders) {
            const date = getOrderDate(order)
            if (!date) continue

            const orderYear = date.getFullYear()
            const orderMonth = date.getMonth()

            const isCurrent = orderYear === currentYear && orderMonth === currentMonth
            const isPrev = orderYear === prevYear && orderMonth === prevMonth

            if (!isCurrent && !isPrev) continue

            // Count all orders created in the respective month
            if (isCurrent) currentMonthOrdersCount += 1
            if (isPrev) prevMonthOrdersCount += 1

            // Count revenue & item sales only for Paid orders
            if (order.paymentStatus === 'Paid') {
                const amount = Number(order.totalAmount || 0)
                const items = order.orderDetails || order.items || []
                const units = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

                if (isCurrent) {
                    currentMonthRevenue += amount
                    currentMonthUnitsSold += units

                    for (const item of items) {
                        const pid = item.productId || item.product_id || item.id
                        if (pid) {
                            currentMonthSalesByProduct[pid] = (currentMonthSalesByProduct[pid] || 0) + Number(item.quantity || 0)
                        }
                    }
                }

                if (isPrev) {
                    prevMonthRevenue += amount
                    prevMonthUnitsSold += units
                }
            }
        }

        // Calculate trends
        const revenueTrend = calculatePercentageChange(currentMonthRevenue, prevMonthRevenue)
        const ordersTrend = calculatePercentageChange(currentMonthOrdersCount, prevMonthOrdersCount)
        const salesVolumeTrend = calculatePercentageChange(currentMonthUnitsSold, prevMonthUnitsSold)

        // Low stock: estimate products that were low stock at start of this month before current month sales
        const currentLowStock = Number(totalLowStockProducts || 0)
        const prevLowStock = (products || []).filter((p) => {
            const currentStock = Number(p.stockQuantity ?? p.stock ?? 0)
            const soldThisMonth = currentMonthSalesByProduct[p.id] || 0
            const initialStock = currentStock + soldThisMonth
            return initialStock > 0 && initialStock <= 10
        }).length

        const lowStockTrend = calculatePercentageChange(currentLowStock, prevLowStock)

        return [
            {
                title: t('dashboard.totalRevenue'),
                value: `$${Number(totalRevenue || 0).toFixed(2)}`,
                icon: TrendingUp,
                trend: revenueTrend,
                color: "emerald",
                link: "/admin",
            },
            {
                title: t('dashboard.totalOrders'),
                value: orders.length.toString(),
                icon: ClipboardList,
                trend: ordersTrend,
                color: "blue",
                link: "/admin/orders",
            },
            {
                title: t('dashboard.lowStockProducts'),
                value: currentLowStock.toString(),
                icon: PackageX,
                color: "amber",
                trend: lowStockTrend,
                invertTrendColor: true, // Increase in low stock is a warning (red), decrease is good (green)
                warning: currentLowStock > 0,
                note: t('dashboard.needsRestock'),
                link: "/admin/products",
            },
            {
                title: t('dashboard.topSellingProducts'),
                value: topSellingProducts.length.toString(),
                icon: Package,
                color: "purple",
                trend: salesVolumeTrend,
                note: topSellingProducts.length === 0 ? t('dashboard.noSalesData') : undefined,
                link: "/admin/products",
            },
        ]
    }, [orders, products, totalRevenue, topSellingProducts, totalLowStockProducts, t])

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => {
                const dateA = getOrderDate(a) || new Date(0)
                const dateB = getOrderDate(b) || new Date(0)
                return dateB - dateA
            })
            .slice(0, 10)
    }, [orders])

    return { statsData, recentOrders, isLoading }
}
