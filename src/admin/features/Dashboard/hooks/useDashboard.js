import { useLowStockProductsQuery } from '../../../../queries/products/useProductQueries'
import { useOrdersQuery, useOrderStats } from '../../../../queries/orders/useOrderQueries'
import { PackageX, TrendingUp, Package, ClipboardList } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function useDashboard() {
    const { t } = useTranslation()
    const { totalLowStockProducts, isPending: isLowStockPending } = useLowStockProductsQuery()
    const { data: orders = [], isPending: isOrdersPending } = useOrdersQuery()
    const { totalRevenue, topSellingProducts, isPending: isStatsPending } = useOrderStats()

    const isLoading = isLowStockPending || isOrdersPending || isStatsPending

    const statsData = [
        {   title: t('dashboard.totalRevenue'), 
            value: `$${Number(totalRevenue || 0).toFixed(2)}`, 
            icon: TrendingUp, 
            trend: "+12.5", 
            color: "emerald" ,
            link: "/admin"},
        { title: t('dashboard.totalOrders'), value: orders.length.toString(), icon: ClipboardList, trend: "8", color: "blue", link: "/admin/orders" },
        {
            title: t('dashboard.lowStockProducts'),
            value: totalLowStockProducts?.toString() || "0",
            icon: PackageX,
            color: "amber",
            trend: "-2.4",
            warning: totalLowStockProducts > 0,
            note: t('dashboard.needsRestock'),
            link: "/admin/products",
        },
        {
            title: t('dashboard.topSellingProducts'),
            value: topSellingProducts.length.toString(),
            icon: Package,
            color: "purple",
            trend: "+5.2",
            note: topSellingProducts.length === 0 ? t('dashboard.noSalesData') : undefined,
            link: "/admin/products",
        },
    ]

    const recentOrders = [...orders]
        .sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateB - dateA;
        })
        .slice(0, 10);

    return { statsData, recentOrders, isLoading }
}