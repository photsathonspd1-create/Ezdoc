'use client'

import React, { useState, useEffect } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { DocumentPDF } from './document-pdf'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'

export function PDFDownloadButton({ document, org, className }: { document: any, org: any, className?: string }) {
  const [isClient, setIsClient] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | undefined>()

  useEffect(() => {
    setIsClient(true)
    // Generate QR if INVOICE and org has PromptPay phone/taxId
    if (document.type === 'INVOICE') {
      const promptpayId = org.taxId || org.phone // Default to taxId or phone
      if (promptpayId) {
        const payload = generatePayload(promptpayId, { amount: Number(document.total) })
        QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 2 })
          .then(setQrCodeDataUrl)
          .catch(console.error)
      }
    }
  }, [document, org])

  if (!isClient) {
    return (
      <Button variant="outline" disabled className={className}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        เตรียมไฟล์ PDF...
      </Button>
    )
  }

  return (
    <PDFDownloadLink
      document={<DocumentPDF document={document} org={org} qrCodeDataUrl={qrCodeDataUrl} />}
      fileName={`${document.type}_${document.docNumber}.pdf`}
      className={className}
    >
      {({ blob, url, loading, error }) => (
        <span className="flex items-center w-full">
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังสร้าง PDF...</>
          ) : (
            <><Download className="mr-2 h-4 w-4" /> ดาวน์โหลด PDF</>
          )}
        </span>
      )}
    </PDFDownloadLink>
  )
}
