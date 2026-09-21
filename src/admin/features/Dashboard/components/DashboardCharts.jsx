import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Legend,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/admin/components/ui/card'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/admin/components/ui/chart'

import { useOrdersQuery } from '../../../../queries/orders/useOrderQueries'
import { useProductsQuery } from '../../../../queries/products/useProductQueries'

export default function DashboardCharts() {
  const { t } = useTranslation()
  const { data: orders = [] } = useOrdersQuery()
  const { data: products = [] } = useProductsQuery()

  const barChartData = useMemo(() => {
    const monthlySales = orders
      .filter((order) => order.paymentStatus === 'Paid')
      .reduce((acc, order) => {
        const date = new Date(order.createdAt)

        if (isNaN(date.getTime())) return acc

        const month = date.toLocaleString('default', {
          month: 'short',
        })

        const year = date.getFullYear()
        const key = `${month} ${year}`

        if (!acc[key]) {
          acc[key] = {
            month: key,
            total: 0,
          }
        }

        acc[key].total += Number(order.totalAmount || 0)

        return acc
      }, {})

    return Object.values(monthlySales)
  }, [orders])

  const barChartConfig = {
    total: {
      label: t('dashboard.totalSales'),
      color: '#870d4c',
    },
  }

  const pieChartData = useMemo(() => {
    const stockByCategory = products.reduce((acc, product) => {
      const category = product.categoryName || 'Other'

      if (!acc[category]) {
        acc[category] = {
          name: category,
          value: 0,
        }
      }

      acc[category].value += Number(product.stockQuantity || 0)

      return acc
    }, {})

    const COLORS = [
      '#870d4c',
      '#b31b6b',
      '#5d0a35',
      '#c92a7e',
      '#44092e',
      '#db4d98',
    ]

    return Object.values(stockByCategory).map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length],
    }))
  }, [products])

  const pieChartConfig = {
    value: {
      label: t('dashboard.stock'),
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.monthlySalesTitle')}</CardTitle>
          <CardDescription>
            {t('dashboard.monthlySalesSubtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ChartContainer
            config={barChartConfig}
            className="h-[300px] w-full"
          >
            <BarChart data={barChartData}>
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  value.split(' ')[0]
                }
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />

              <ChartTooltip
                content={<ChartTooltipContent />}
              />

              <Bar
                dataKey="total"
                fill="var(--color-total)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.stockByCategoryTitle')}</CardTitle>
          <CardDescription>
            {t('dashboard.stockByCategorySubtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center items-center">
          <ChartContainer
            config={pieChartConfig}
            className="h-[300px] w-full"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent hideLabel />
                }
              />

              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                label
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                  />
                ))}
              </Pie>

              <Legend />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}