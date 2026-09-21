import Swal from "sweetalert2";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useCart } from "../../../../context/CartContext";
import { useCreateOrderMutation } from "../../../../queries/orders/useOrderQueries";
import { sendOrderToTelegram } from "../../../../services/telegramService";

import CartHeader from "./CartHeader";
import CartItemList from "./CartItemList";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import DeliveryForm from "./DeliveryForm";

import useClientOrder from "../hooks/useClientOrder";
import { useTranslation } from "react-i18next";

export default function CartDrawer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shop_code } = useParams();

  const [settingId, setSettingId] = useState(null);
  const [deliveryProviderId, setDeliveryProviderId] = useState(null);
  const [chatId, setChatId] = useState(null);

  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    cartTotal,
    clearCart,
  } = useCart();

  const createOrderMutation = useCreateOrderMutation();

  const {
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
    validateOrderForm,
    resetForm,
  } = useClientOrder();

  const hasItems = cartItems.length > 0;
  const grandTotal = cartTotal + (hasItems ? deliveryFee : 0);

  const handleCreateOrder = async (formattedPhone) => {
    const payload = {
      shop_code,
      setting_id: settingId,
      delivery_provider_id: deliveryProviderId,
      items: cartItems,
      subtotal: cartTotal,
      delivery: deliveryFee,
      customerInfo: {
        name: customerName,
        phone: formattedPhone,
        address,
        note,
        deliveryMethod,
      },
    };

    return createOrderMutation.mutateAsync(payload);
  };

  const resetCheckoutForm = () => {
    resetForm();
    setSettingId(null);
    setDeliveryProviderId(null);
    setChatId(null);
    clearCart();
  };

  // Toggle-unselect handler: clears all delivery state without clearing the cart
  const handleDeliveryClear = () => {
    setDeliveryMethod(null);
    setDeliveryProviderId(null);
    setSettingId(null);
    setChatId(null);
    setDeliveryFee(0);
  };

  const handleOrder = async () => {
    const { isValid, formattedPhone } = validateOrderForm();

    if (!isValid) return;

    if (!settingId) {
      await Swal.fire({
        icon: "warning",
        title: t('cart.pleaseSelectDelivery'),
        text: t('cart.pleaseSelectDeliveryBefore'),
        confirmButtonColor: "#7f1d1d",
      });
      return;
    }

    if (!deliveryProviderId) {
      await Swal.fire({
        icon: "warning",
        title: t('cart.pleaseSelectDeliveryProvider'),
        text: t('cart.pleaseSelectDeliveryBefore'),
        confirmButtonColor: "#7f1d1d",
      });
      return;
    }

    try {
      const newOrder = await handleCreateOrder(formattedPhone);
      const orderData = newOrder?.data ?? newOrder;

      if (!orderData?.id || !orderData?.orderNo) {
        await Swal.fire({
          icon: "error",
          title: t('cart.orderNumberNotFound'),
          text: t('cart.orderCreatedCannotOpenReceipt'),
          confirmButtonColor: "#7f1d1d",
        });
        return;
      }

      // Capture snapshot before resetCheckoutForm clears deliveryFee & cart
      const finalTotal = grandTotal;

      // Enrich orderData with settingId AND chatId so Telegram can resolve
      // the chat without an authenticated API call (avoids 401 on public pages)
      const enrichedOrder = { ...orderData, setting_id: settingId, chat_id: chatId, shop_code: orderData?.shop_code || shop_code };

      resetCheckoutForm();

      sendOrderToTelegram(enrichedOrder).catch((error) => {
        console.error("Failed to send order to Telegram:", error);
      });

      await Swal.fire({
        icon: "success",
        title: t('cart.orderSuccessful'),
        text: t('cart.totalAmount', { amount: finalTotal.toFixed(2) }),
        confirmButtonText: t('cart.ok'),
        confirmButtonColor: "#7f1d1d",
        allowOutsideClick: false,
      });

      const result = await Swal.fire({
        icon: "question",
        title: t('cart.printReceiptQ'),
        text: t('cart.doYouWantToPrintReceipt'),
        showCancelButton: true,
        confirmButtonText: t('cart.printReceiptBtn'),
        cancelButtonText: t('cart.skip'),
        confirmButtonColor: "#7f1d1d",
        cancelButtonColor: "#64748b",
      });

      if (result.isConfirmed) {
        navigate(`/print-receipt/${orderData.orderNo}`, {
          state: {
            orderId: orderData.id,
            orderData: enrichedOrder,
          },
        });
      } else {
        setIsCartOpen(false);
      }
    } catch (error) {
      console.error("Create order error:", error);

      await Swal.fire({
        icon: "error",
        title: t('cart.failed'),
        text:
          error?.response?.data?.message ||
          error?.message ||
          t('cart.problemCreatingOrder'),
        confirmButtonColor: "#7f1d1d",
      });
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          isCartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] md:w-[480px] bg-white flex flex-col shadow-2xl md:rounded-l-3xl overflow-hidden transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <CartHeader />

        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6">
          {hasItems ? (
            <>
              <CartItemList />

              <DeliveryForm
                customerName={customerName}
                setCustomerName={setCustomerName}
                phone={phone}
                setPhone={setPhone}
                address={address}
                setAddress={setAddress}
                note={note}
                setNote={setNote}
                deliveryMethod={deliveryMethod}
                setDeliveryMethod={setDeliveryMethod}
                setSettingId={setSettingId}
                setDeliveryProviderId={setDeliveryProviderId}
                setChatId={setChatId}
                deliveryFee={deliveryFee}
                setDeliveryFee={setDeliveryFee}
                onDeliveryClear={handleDeliveryClear}
                errors={errors}
              />
            </>
          ) : (
            <EmptyCart />
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white p-5 space-y-4">
          <CartSummary
            cartTotal={cartTotal}
            deliveryFee={deliveryFee}
            grandTotal={grandTotal}
            hasItems={hasItems}
          />

          <button
            type="button"
            onClick={handleOrder}
            disabled={!hasItems || createOrderMutation.isPending}
            className={`w-full py-2 rounded-full font-semibold transition ${
              hasItems && !createOrderMutation.isPending
                ? "bg-red-900 text-white hover:bg-red-800"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {createOrderMutation.isPending
              ? t('cart.processing')
              : t('cart.proceedToCheckout')}
          </button>
        </div>
      </div>
    </>
  );
}
