import { NextResponse } from 'next/server'
import * as line from '@line/bot-sdk'

// Optional LINE configuration
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
}

// Initialize client if token exists
const client = config.channelAccessToken ? new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken
}) : null

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Webhook Verification (LINE sends an empty events array to verify)
    if (body.events && body.events.length === 0) {
      return NextResponse.json({ status: 'ok' })
    }

    // 2. Handle events
    for (const event of body.events) {
      if (event.type === 'message' && event.message.type === 'text') {
        // Echo message or handle specific commands
        if (client && event.replyToken) {
          await client.replyMessage({
            replyToken: event.replyToken,
            messages: [{
              type: 'text',
              text: `ได้รับข้อความของคุณแล้ว: ${event.message.text}\n(ระบบ WorkflowOS กำลังพัฒนา)`
            }]
          })
        }
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('LINE Webhook Error:', error)
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}
