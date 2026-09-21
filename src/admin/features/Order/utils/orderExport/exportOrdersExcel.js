import * as XLSX from 'xlsx'

export function exportOrdersToExcel(orders, selectedMonth) {
  if (!orders || orders.length === 0) return

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.createAt)
    const dateB = new Date(b.createdAt || b.createAt)

    return dateA - dateB
  })

  const [year, month] = selectedMonth.split('-')

  const monthDate = new Date(
    Number(year),
    Number(month) - 1,
    1
  )

  const monthName = monthDate.toLocaleString('en-US', {
    month: 'long',
  })

  const exportData = sortedOrders.map((order) => {
    const date = new Date(order.createdAt || order.createAt)

    const day = String(date.getDate()).padStart(2, '0')

    const shortMonth = date.toLocaleString('en-US', {
      month: 'short',
    })

    return [
      `${day} ${shortMonth}`,
      order.orderNo || `#${order.id || ''}`,
      order.customerPhone || '-',
      Number(order.totalAmount || 0),
      order.paymentStatus || '-',
      order.status || '-',
    ]
  })

  const totalOrders = sortedOrders.length

  const totalSales = sortedOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  )

  const paidAmount = sortedOrders
    .filter((order) => order.paymentStatus === 'Paid')
    .reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    )

  const unpaidAmount = sortedOrders
    .filter((order) => order.paymentStatus === 'Unpaid')
    .reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    )

  const worksheetData = [
    [],

    [`MONTHLY ORDER REPORT - ${monthName.toUpperCase()} ${year}`],

    [],

    ['Total Orders', totalOrders],
    ['Total Sales', totalSales],
    ['Paid', paidAmount],
    ['Unpaid', unpaidAmount],

    [],

    [
      'Date',
      'Order No',
      'Customer',
      'Total',
      'Payment',
      'Status',
    ],

    ...exportData,

    [],

    ['Total Orders', totalOrders],
    ['Total Sales', totalSales],
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  // Column width
  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 26 },
    { wch: 22 },
    { wch: 16 },
    { wch: 16 },
    { wch: 20 },
  ]

  // Row height
  worksheet['!rows'] = []

  worksheet['!rows'][0] = { hpt: 10 }
  worksheet['!rows'][1] = { hpt: 28 }
  worksheet['!rows'][2] = { hpt: 10 }

  worksheet['!rows'][3] = { hpt: 22 }
  worksheet['!rows'][4] = { hpt: 22 }
  worksheet['!rows'][5] = { hpt: 22 }
  worksheet['!rows'][6] = { hpt: 22 }

  worksheet['!rows'][7] = { hpt: 10 }
  worksheet['!rows'][8] = { hpt: 26 }

  // Merge title
  worksheet['!merges'] = [
    {
      s: { r: 1, c: 0 },
      e: { r: 1, c: 5 },
    },
  ]

  // Title
  if (worksheet['A2']) {
    worksheet['A2'].s = {
      font: {
        bold: true,
        sz: 16,
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center',
      },
    }
  }

  // Summary labels
  const summaryRows = [3, 4, 5, 6]

  summaryRows.forEach((row) => {
    const labelCell = worksheet[`A${row + 1}`]

    if (labelCell) {
      labelCell.s = {
        font: {
          bold: true,
        },
        alignment: {
          horizontal: 'left',
          vertical: 'center',
        },
      }
    }
  })

  // Summary currency
  if (worksheet['B5']) {
    worksheet['B5'].z = '$#,##0.00'
  }

  if (worksheet['B6']) {
    worksheet['B6'].z = '$#,##0.00'
  }

  if (worksheet['B7']) {
    worksheet['B7'].z = '$#,##0.00'
  }

  // Table header
  const headerRow = 8

  for (let col = 0; col < 6; col++) {
    const cellAddress = XLSX.utils.encode_cell({
      r: headerRow,
      c: col,
    })

    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: {
          bold: true,
          color: {
            rgb: 'FFFFFF',
          },
        },
        fill: {
          fgColor: {
            rgb: '2563EB',
          },
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
        },
      }
    }
  }

  // Table rows
  const firstDataRow = 9

  for (
    let row = firstDataRow;
    row < firstDataRow + exportData.length;
    row++
  ) {
    worksheet['!rows'][row] = {
      hpt: 22,
    }

    const totalCell = XLSX.utils.encode_cell({
      r: row,
      c: 3,
    })

    if (worksheet[totalCell]) {
      worksheet[totalCell].z = '$#,##0.00'
      worksheet[totalCell].s = {
        alignment: {
          horizontal: 'right',
          vertical: 'center',
        },
      }
    }
  }

  // Bottom summary
  const bottomSummaryStart =
    firstDataRow + exportData.length + 1

  worksheet[`A${bottomSummaryStart + 1}`].s = {
    font: {
      bold: true,
    },
  }

  worksheet[`A${bottomSummaryStart + 2}`].s = {
    font: {
      bold: true,
    },
  }

  worksheet[`B${bottomSummaryStart + 2}`].z = '$#,##0.00'

  // Freeze header
  worksheet['!freeze'] = {
    xSplit: 0,
    ySplit: headerRow + 1,
  }

  // Filter
  worksheet['!autofilter'] = {
    ref: `A${headerRow + 1}:F${
      firstDataRow + exportData.length - 1
    }`,
  }

  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Orders'
  )

  XLSX.writeFile(
    workbook,
    `orders-${selectedMonth}.xlsx`
  )
}