import { useState } from "react"
import { useTranslation } from "react-i18next"
import { clientOrderSchema } from "../schemas/clientOrderSchema"

export default function useClientOrder() {
  const { t } = useTranslation()

  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [note, setNote] = useState("")
  const [deliveryMethod, setDeliveryMethod] = useState("")
  const [deliveryFee, setDeliveryFee] = useState(2.0)
  const [errors, setErrors] = useState({})

  const validateOrderForm = () => {
    const dataToValidate = {
      phone,
      address,
      deliveryMethod,
      deliveryFee,
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
      }
    }

    setErrors({})

    return {
      isValid: true,
      formattedPhone: result.data.phone,
    }
  }

  const resetForm = () => {
    setCustomerName("")
    setPhone("")
    setAddress("")
    setNote("")
    setDeliveryMethod("")
    setDeliveryFee(2.0)
    setErrors({})
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

    errors,
    setErrors,

    validateOrderForm,
    resetForm,
  }
}
