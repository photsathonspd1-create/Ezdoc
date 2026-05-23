import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageBase64, orgId } = await request.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 })
    }

    let apiKey = process.env.OPENAI_API_KEY
    if (orgId) {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { openaiKey: true }
      })
      if (org?.openaiKey) {
        apiKey = org.openaiKey
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API Key is not configured. Please add it in Settings > Integrations.' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey })



    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert OCR AI that extracts structured data from receipts and invoices.
Return ONLY a raw JSON object with the following structure (no markdown formatting, no backticks, no comments):
{
  "vendorName": "String (Name of the shop or company)",
  "totalAmount": "Number (Total amount including tax)",
  "vatAmount": "Number (Tax amount if available, otherwise 0)",
  "date": "String (Date in YYYY-MM-DD format if found)",
  "description": "String (Brief summary of what was bought)"
}
If a field is not found, leave it as null (for strings) or 0 (for numbers).`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the data from this receipt."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0,
    })

    const resultText = response.choices[0].message.content || '{}'
    
    // Clean up potential markdown formatting if the AI ignores the instruction
    const cleanedText = resultText.replace(/```json/g, '').replace(/```/g, '').trim()
    const extractedData = JSON.parse(cleanedText)

    return NextResponse.json({ data: extractedData })
  } catch (error) {
    console.error('OCR Error:', error)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
}
