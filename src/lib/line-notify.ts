import * as line from '@line/bot-sdk'

export async function sendLineNotification(userId: string | null, message: string, customToken?: string) {
  const token = customToken || process.env.LINE_CHANNEL_ACCESS_TOKEN
  
  if (!token) {
    console.log('LINE OA is not configured. Message:', message)
    return false
  }

  const client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: token
  })

  // Fallback to a group or admin ID if specific userId is not provided
  const targetId = userId || process.env.LINE_ADMIN_ID

  if (!targetId) {
    console.log('No target LINE ID to send message to.')
    return false
  }

  try {
    await client.pushMessage({
      to: targetId,
      messages: [{ type: 'text', text: message }]
    })
    return true
  } catch (error) {
    console.error('Failed to send LINE message:', error)
    return false
  }
}
