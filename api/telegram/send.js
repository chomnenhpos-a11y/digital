export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    const {
      chatId,
      text,
    } = req.body

    if (!chatId || !text) {
      return res.status(400).json({
        success: false,
        message:
          'chatId and text are required',
      })
    }

    const token =
      process.env.TELEGRAM_BOT_TOKEN

    if (!token) {
      return res.status(500).json({
        success: false,
        message:
          'Telegram bot token is not configured',
      })
    }

    const telegramResponse =
      await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
          }),
        }
      )

    const telegramData =
      await telegramResponse.json()

    if (
      !telegramResponse.ok ||
      !telegramData.ok
    ) {
      return res.status(400).json({
        success: false,
        message:
          telegramData.description ||
          'Failed to send Telegram message',
      })
    }

    return res.status(200).json({
      success: true,
      data: telegramData,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        'Telegram request failed',
    })
  }
}