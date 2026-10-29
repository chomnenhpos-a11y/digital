import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { clientOrderSchema } from "../schemas/clientOrderSchema"
import useSharedSaleBy from "./useSharedSaleBy"

/**
 * Order form state for the customer (client) flow.
 *
 * @param {object} [options]
 * @param {string} [options.shopCode] - Current shop code. The sell-by attribution
 *   is strictly scoped to this shop: the shared staff (share_by) returned by
 *   the settings API for this shop_code is never applied to another shop, so
 *   URL manipulation cannot move an order to a different staff member or shop.
 */
export default function useClientOrder({ shopCode } = {}) {
  const { t } = useTranslation()

  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [note, setNote] = useState("")
  const [deliveryMethod, setDeliveryMethod] = useState("")
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [saleBy, setSaleBy] = useState(null)
  const [errors, setErrors] = useState({})

  // Share-by -> sell-by: the shared staff comes from the settings response
  // (data.sharedBy), resolved for the customer's shared link. Attribution is
  // updated whenever the settings API answers (e.g. shared link resolved,
  // different token in the URL after navigation).
  const sharedSaleBy = useSharedSaleBy({ shopCode })

  useEffect(() => {
    setSaleBy(sharedSaleBy)
  }, [sharedSaleBy])

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
    setSaleBy(sharedSaleBy)
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
