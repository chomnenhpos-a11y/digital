import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { clientOrderSchema } from "../schemas/clientOrderSchema"
import { getStaffReferralId } from "../utils/staffReferral"

/**
 * Order form state for the customer (client) flow.
 *
 * @param {object} [options]
 * @param {string} [options.shopCode] - Current shop code. The sale-by attribution
 *   is strictly scoped to this shop: a referral captured on another shop is
 *   never applied, so URL manipulation cannot move an order to a different
 *   staff member or shop.
 */
export default function useClientOrder({ shopCode } = {}) {
  const { t } = useTranslation()
  const location = useLocation()

  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [note, setNote] = useState("")
  const [deliveryMethod, setDeliveryMethod] = useState("")
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [saleBy, setSaleBy] = useState(() => getStaffReferralId(shopCode))
  const [errors, setErrors] = useState({})

  // Sync saleBy whenever URL query parameters change (e.g., client navigation with new staff_reff).
  // The referral resolution is shop-scoped: when there is no valid referral for
  // this shop, the order is submitted WITHOUT a sale-by attribution.
  useEffect(() => {
    const referralId = getStaffReferralId(shopCode)
    setSaleBy(referralId ?? null)
  }, [location?.search, shopCode])

  const validateOrderForm = () => {
    const dataToValidate = {
      phone,
      address,
      deliveryMethod,
      deliveryFee,
      saleBy,
    }

    const result = clientOrderSchema(t).safeParse(dataToValidate)

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      const formattedErrors = {}

      for (const key in fieldErrors) {
        formattedErrors[key] = fieldErrors[key][0]
      }

      setErrors(formattedErrors)

      return {
        isValid: false,
        formattedPhone: null,
        saleBy: null,
      }
    }

    setErrors({})

    return {
      isValid: true,
      formattedPhone: result.data.phone,
      saleBy: result.data.saleBy ?? null,
    }
  }

  const resetForm = () => {
    setCustomerName("")
    setPhone("")
    setAddress("")
    setNote("")
    setDeliveryMethod("")
    setDeliveryFee(0)
    setErrors({})
    setSaleBy(getStaffReferralId(shopCode) ?? null)
  }

  return {
    customerName,
    setCustomerName,

    phone,
    setPhone,

    address,
    setAddress,

    note,
    setNote,

    deliveryMethod,
    setDeliveryMethod,

    deliveryFee,
    setDeliveryFee,

    saleBy,
    setSaleBy,
    setsaleBy: setSaleBy,

    errors,
    setErrors,

    validateOrderForm,
    resetForm,
  }
}
