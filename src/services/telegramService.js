import { settingService } from './settingService'

const getBotToken = () => {
  return import.meta.env.VITE_TELEGRAM_BOT_TOKEN || process.env.REACT_APP_TELEGRAM_BOT_TOKEN || '';
}
const getSettingFromResponse = (response) => {
  const rawData = response?.data ?? response ?? []

  if (Array.isArray(rawData)) {
    return rawData[0] || {}
  }

  return rawData
}

const resolveChatId = async (order) => {
  // Fast path: if chat_id is already embedded (passed from client cart),
  // skip the authenticated API call entirely — avoids 401 on public pages.
  if (order?.chat_id) {
    return String(order.chat_id)
  }

  const shopCode =
    order?.shop_code ||
    order?.shopCode

  if (!shopCode) {
    throw new Error(
      'Order shop_code is missing. Cannot determine Telegram chat.'
    )
  }

  const response =
    await settingService.getByShopCode(shopCode)

  const settings =
    getSettingFromResponse(response)

  if (!settings?.chat_id) {
    throw new Error(
      'Target shop does not have a Telegram chat ID configured.'
    )
  }

  return String(settings.chat_id)
}

const verifyGroup = async (group) => {
  if (!group?.trim()) {
    throw new Error('Telegram group is required.')
  }

  let formattedGroup = group.trim();
  
  // Extract username from t.me links
  const tmeMatch = formattedGroup.match(/(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]+)/);
  if (tmeMatch && tmeMatch[1]) {
    formattedGroup = `@${tmeMatch[1]}`;
  } else if (!formattedGroup.startsWith('@') && !formattedGroup.startsWith('-') && isNaN(Number(formattedGroup))) {
    // If it's a plain string like "my_group_name", prepend @
    formattedGroup = `@${formattedGroup}`;
  }

  const token = getBotToken();
  if (!token) throw new Error('Telegram Bot Token is not configured.');

  const response = await fetch(
    `https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(formattedGroup)}`
  )

  const data = await response.json()

  if (!data?.ok) {
    throw new Error(
      data?.description ||
      'Failed to verify Telegram group.'
    )
  }

  return {
    success: true,
    data: {
      chat_id: String(data.result.id),
      title: data.result.title,
      username: data.result.username,
      type: data.result.type
    }
  }
}

const sendMessage = async (text, chatId) => {
  if (!chatId) {
    throw new Error('Telegram chat ID is missing for this shop.')
  }

  if (!text) {
    throw new Error('Telegram message is empty.')
  }

  const token = getBotToken();
  if (!token) throw new Error('Telegram Bot Token is not configured.');

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: String(chatId),
        text,
        parse_mode: 'HTML',
      }),
    }
  )

  const data = await response.json()

  if (!data?.ok) {
    throw new Error(
      data?.description ||
      'Failed to send Telegram message.'
    )
  }

  return { success: true, data }
}

const getCourierName = (courier) => {
  if (!courier) {
    return 'N/A'
  }

  if (typeof courier === 'string') {
    return courier
  }

  return (
    courier?.name ||
    courier?.title ||
    courier?.providerName ||
    courier?.provider_name ||
    'N/A'
  )
}

const escapeHtml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const formatMoney = (value) => {
  const amount = Number(value || 0)

  return amount.toFixed(2)
}

const buildOrderMessage = (order, courier) => {
  const items = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.orderDetails)
      ? order.orderDetails
      : []
  const itemsText = items.length
    ? items
      .map((item, index) => {
        const productName =
          item?.product?.name ||
          item?.productName ||
          item?.product_name ||
          item?.name ||
          'Unknown Product'

        const quantity =
          item?.quantity || 0

        const price =
          item?.price ||
          item?.salePrice ||
          item?.product?.salePrice ||
          0

        return (
          `• ${escapeHtml(productName)} × ${quantity} — $${formatMoney(price)}`
        )
      })
      .join('\n')
    : 'No items'

  const orderNumber =
    order?.orderNo ||
    order?.order_no ||
    order?.id ||
    'N/A'

  let customerName =
    order?.customerName ||
    order?.customer_name ||
    order?.name ||
    'អតិថិជនទូទៅ'
  if (customerName === 'N/A') customerName = 'អតិថិជនទូទៅ'

  const phone =
    order?.customerPhone ||
    order?.customer_phone ||
    order?.phone ||
    'N/A'

  const address =
    order?.address ||
    order?.customerAddress ||
    order?.customer_address ||
    'N/A'

  const payment =
    order?.paymentMethod ||
    order?.payment_method ||
    order?.paymentStatus ||
    order?.payment ||
    'N/A'

  const status =
    order?.status ||
    'Pending'

  const deliveryProvider =
    getCourierName(courier) !== 'N/A'
      ? getCourierName(courier)
      : order?.deliveryProvider?.name || 'N/A'

  const deliveryFee =
    order?.deliveryFee ||
    order?.delivery_fee ||
    0

  const total =
    order?.total ||
    order?.totalAmount ||
    order?.total_amount ||
    0

  const orderDate =
    order?.createdAt ||
      order?.created_at ||
      order?.date
      ? new Date(order?.createdAt || order?.created_at || order?.date).toLocaleString()
      : new Date().toLocaleString()

  const subtotal =
    order?.subtotal ||
    order?.sub_total ||
    (Number(total) - Number(deliveryFee)) ||
    0

  return [
    '🛍 NEW ORDER',
    '',
    `🧾 <b>វិក្កយបត្រ:</b> ${escapeHtml(orderNumber)}`,
    `👤 <b>អតិថិជន:</b> ${escapeHtml(customerName)}`,
    `📲 <b>លេខទូរស័ព្ទ:</b> ${escapeHtml(phone)}`,
    `📍 <b>អាសយដ្ឋាន:</b> ${escapeHtml(address)}`,
    `📅 <b>កាលបរិច្ឆេទ:</b> ${escapeHtml(orderDate)}`,
    `🚚 <b>សេវាដឹក:</b> ${escapeHtml(deliveryProvider)}`,
    '------------------------',
    itemsText,
    '------------------------',
    `🔹 <b>Subtotal:</b> $${formatMoney(subtotal)}`,
    `🚚 <b>Delivery:</b> $${formatMoney(deliveryFee)}`,
    `💰 <b>Total:</b> $${formatMoney(total)}`,
    `📊 <b>Status:</b> ${escapeHtml(status)}`,
  ].join('\n')
}

const buildStickerMessage = (order, courier) => {
  const orderNumber =
    order?.orderNo ||
    order?.order_no ||
    order?.id ||
    'N/A'

  let customerName =
    order?.customerName ||
    order?.customer_name ||
    order?.name ||
    'អតិថិជនទូទៅ'
  if (customerName === 'N/A') customerName = 'អតិថិជនទូទៅ'

  const phone =
    order?.customerPhone ||
    order?.customer_phone ||
    order?.phone ||
    'N/A'

  const address =
    order?.address ||
    order?.customerAddress ||
    order?.customer_address ||
    'N/A'

  const deliveryProvider =
    getCourierName(courier) !== 'N/A'
      ? getCourierName(courier)
      : order?.deliveryProvider?.name || 'N/A'

  const total =
    order?.total ||
    order?.totalAmount ||
    order?.total_amount ||
    0

  return [
    '🏷️ <b>ORDER STICKER</b>',
    '',
    `📦 <b>Order:</b> #${escapeHtml(orderNumber)}`,
    `👤 <b>Name:</b> ${escapeHtml(customerName)}`,
    `📱 <b>Phone:</b> ${escapeHtml(phone)}`,
    `📍 <b>Address:</b> ${escapeHtml(address)}`,
    `🚚 <b>Delivery:</b> ${escapeHtml(deliveryProvider)}`,
    `💰 <b>Total:</b> $${formatMoney(total)}`,
  ].join('\n')
}

const sendOrderToTelegram = async (
  order,
  courier
) => {
  const chatId =
    await resolveChatId(order)

  const message =
    buildOrderMessage(
      order,
      courier
    )

  return sendMessage(
    message,
    chatId
  )
}

const sendStickerToTelegram = async (
  order,
  courier
) => {
  const chatId =
    await resolveChatId(order)

  const message =
    buildStickerMessage(
      order,
      courier
    )

  return sendMessage(
    message,
    chatId
  )
}

export const telegramService = {
  verifyGroup,
  sendMessage,
  resolveChatId,
  getCourierName,
  buildOrderMessage,
  buildStickerMessage,
  sendOrderToTelegram,
  sendStickerToTelegram,
}

export {
  verifyGroup,
  sendMessage,
  resolveChatId,
  getCourierName,
  buildOrderMessage,
  buildStickerMessage,
  sendOrderToTelegram,
  sendStickerToTelegram,
}