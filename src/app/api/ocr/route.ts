import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // In a real production app, we would send this buffer to an OCR service like:
    // - AWS Textract
    // - Google Vision AI
    // - Tesseract.js (running on server)
    // - Or an LLM with vision capabilities (like Gemini Flash 1.5)

    // For this prototype, we simulate a very intelligent AI response
    // That "identifies" common receipt patterns or uses the filename to simulate detection
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock data based on common receipt scenarios
    // In a real scenario, we'd use the file buffer
    const mockResults = [
      { amount: 1250.00, description: '7-Eleven - สินค้าอุปโภคบริโภค', category: 'EXPENSE', date: new Date().toISOString() },
      { amount: 450.00, description: 'Starbucks - Coffee & Cake', category: 'EXPENSE', date: new Date().toISOString() },
      { amount: 2800.00, description: 'เติมน้ำมัน ปตท.', category: 'EXPENSE', date: new Date().toISOString() },
      { amount: 159.00, description: 'GrabFood - มื้อเที่ยง', category: 'EXPENSE', date: new Date().toISOString() }
    ]

    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]

    return NextResponse.json(randomResult)
  } catch (error) {
    console.error('OCR Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
