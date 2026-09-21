import { useCallback, useEffect, useState } from "react"
import Swal from "sweetalert2"

export default function useCheckout({
  hasItems,
  grandTotal,
  setIsCartOpen,
  resetCheckoutForm,
  navigate,
  t,
}) {
  const [showQr, setShowQr] = useState(false)
  const [qrSeconds, setQrSeconds] = useState(0)
  const [qrCompleted, setQrCompleted] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState(null)

  const handlePaymentSuccess = useCallback(async () => {
    setQrCompleted(false)
    
    if (resetCheckoutForm) {
      resetCheckoutForm() 
    }
    setIsCartOpen(false)
    await Swal.fire({
      icon: "success",
      title: t('cart.orderSuccessTitle'),
      text: `${t('cart.orderSuccessText')} $${grandTotal.toFixed(2)}`,
      confirmButtonText: t('common.ok'),
      confirmButtonColor: "#16a34a",
      allowOutsideClick: false,
      timer: 3000,
      timerProgressBar: true,
    })

    const result = await Swal.fire({
      icon: "question",
      title: t('cart.printReceiptPrompt'),
      showCancelButton: true,
      confirmButtonText: t('cart.printReceipt'),
      cancelButtonText: t('cart.skip'),
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      allowOutsideClick: false,
    })

    if (result.isConfirmed && currentOrderId) {
      if (navigate) {
        navigate(`/print-receipt/${currentOrderId}`)
      }
    }
  }, [currentOrderId, grandTotal, navigate, resetCheckoutForm, setIsCartOpen, t])

  useEffect(() => {
    if (!showQr || !hasItems) {
      return
    }

    const interval = setInterval(() => {
      setQrSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)

          setShowQr(false)
          setQrCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [showQr, hasItems])

  useEffect(() => {
    if (!qrCompleted) {
      return
    }

    handlePaymentSuccess()
  }, [qrCompleted, handlePaymentSuccess])

  const startQrPayment = (orderId) => {
    setCurrentOrderId(orderId)
    setQrCompleted(false)
    setQrSeconds(10)
    setShowQr(true)
  }

  const closeQr = () => {
    setShowQr(false)
    setQrCompleted(false)
    setCurrentOrderId(null)
  }

  return {
    showQr,
    qrSeconds,
    startQrPayment,
    closeQr,
  }
}