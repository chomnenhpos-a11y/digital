import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getOrderExportSummary } from './orderExportSummary'

export function exportOrdersToPDF(orders, selectedMonth) {
  if (!orders || orders.length === 0) return

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const [year, monthStr] = selectedMonth.split('-')
  const yearNumber = Number(year)
  const monthNumber = Number(monthStr)

  const monthDate = new Date(yearNumber, monthNumber - 1, 1)

  const monthName = monthDate.toLocaleString('en-US', {
    month: 'long',
  })

  const title = `Monthly Order Report - ${monthName} ${year}`

  const summary = getOrderExportSummary(orders)

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.createAt)
    const dateB = new Date(b.createdAt || b.createAt)

    return dateA - dateB
  })

  const tableData = sortedOrders.map((order) => {
    const orderDate = new Date(order.createdAt || order.createAt)

    const day = String(orderDate.getDate()).padStart(2, '0')

    const shortMonth = orderDate.toLocaleString('en-US', {
      month: 'short',
    })

    return [
      `${day} ${shortMonth}`,
      order.orderNo || `#${order.id || ''}`,
      order.customerPhone || '-',
      `$${Number(order.totalAmount || 0).toFixed(2)}`,
      order.paymentStatus || '-',
      order.status || '-',
    ]
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.text(title, 14, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)

  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-GB')}`,
    14,
    25
  )

  doc.setTextColor(0, 0, 0)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  doc.text('Summary', 14, 35)

  doc.setFont('helvetica', 'normal')

  doc.text(`Total Orders: ${summary.totalOrders}`, 14, 42)
  doc.text(
    `Total Sales: $${Number(summary.totalSales || 0).toFixed(2)}`,
    14,
    48
  )

  doc.text(
    `Paid: $${Number(summary.paidAmount || 0).toFixed(2)}`,
    75,
    42
  )

  doc.text(
    `Unpaid: $${Number(summary.unpaidAmount || 0).toFixed(2)}`,
    75,
    48
  )

  doc.text(
    `Completed: ${summary.completedOrders || 0}`,
    140,
    42
  )

  doc.text(
    `Pending: ${summary.pendingOrders || 0}`,
    140,
    48
  )

  doc.text(
    `Cancelled: ${summary.cancelledOrders || 0}`,
    200,
    42
  )

  autoTable(doc, {
    startY: 57,

    head: [
      [
        'Date',
        'Order No',
        'Customer',
        'Total',
        'Payment',
        'Status',
      ],
    ],

    body: tableData,

    theme: 'grid',

    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
      lineWidth: 0.1,
    },

    headStyles: {
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
    },

    columnStyles: {
      0: {
        cellWidth: 25,
        halign: 'center',
      },
      1: {
        cellWidth: 55,
      },
      2: {
        cellWidth: 55,
      },
      3: {
        cellWidth: 30,
        halign: 'right',
      },
      4: {
        cellWidth: 35,
        halign: 'center',
      },
      5: {
        cellWidth: 35,
        halign: 'center',
      },
    },

    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },

    margin: {
      top: 15,
      right: 14,
      bottom: 15,
      left: 14,
    },

    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages()

      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)

      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 35,
        doc.internal.pageSize.getHeight() - 8
      )
    },
  })

  doc.save(`orders-${selectedMonth}.pdf`)
}