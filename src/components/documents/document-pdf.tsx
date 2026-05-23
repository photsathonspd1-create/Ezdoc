'use client'

import React from 'react'
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer'
import { formatCurrency, formatDate } from '@/lib/utils'

// Note: In a real enterprise app, you would load a Thai font like Sarabun here.
// Font.register({ family: 'Sarabun', src: '/fonts/Sarabun-Regular.ttf' })

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica', // Fallback
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  companyInfo: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 8,
  },
  docInfo: {
    alignItems: 'flex-end',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  table: {
    width: '100%',
    flexDirection: 'column',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  col1: { width: '5%', fontSize: 10, color: '#334155' },
  col2: { width: '45%', fontSize: 10, color: '#334155' },
  col3: { width: '15%', fontSize: 10, color: '#334155', textAlign: 'right' },
  col4: { width: '15%', fontSize: 10, color: '#334155', textAlign: 'right' },
  col5: { width: '20%', fontSize: 10, color: '#334155', textAlign: 'right' },
  
  colHeader: { fontSize: 10, fontWeight: 'bold', color: '#0f172a' },
  
  totalsContainer: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
    width: '40%',
  },
  totalLabel: {
    width: '50%',
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    width: '50%',
    fontSize: 10,
    color: '#0f172a',
    textAlign: 'right',
  },
  grandTotalLabel: {
    width: '50%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'right',
    paddingRight: 10,
  },
  grandTotalValue: {
    width: '50%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'right',
  },
  qrContainer: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  qrText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 8,
  }
})

export function DocumentPDF({ document, org, qrCodeDataUrl }: { document: any, org: any, qrCodeDataUrl?: string }) {
  const getDocTypeTitle = (type: string) => {
    switch (type) {
      case 'INVOICE': return 'INVOICE'
      case 'RECEIPT': return 'RECEIPT'
      case 'QUOTATION': return 'QUOTATION'
      case 'PV': return 'PAYMENT VOUCHER'
      case 'RV': return 'RECEIPT VOUCHER'
      default: return type
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{org.name}</Text>
            <Text style={styles.companyInfo}>{org.address || 'Company Address'}</Text>
            <Text style={styles.companyInfo}>Tax ID: {org.taxId || '-'}</Text>
          </View>
          <View style={styles.docInfo}>
            <Text style={[styles.title, { color: '#2563eb' }]}>{getDocTypeTitle(document.type)}</Text>
            <Text style={styles.companyInfo}>No: {document.docNumber}</Text>
            <Text style={styles.companyInfo}>Date: {formatDate(document.issuedDate)}</Text>
            {document.dueDate && <Text style={styles.companyInfo}>Due: {formatDate(document.dueDate)}</Text>}
          </View>
        </View>

        {/* Client Info */}
        {document.client && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{document.client.name}</Text>
            {document.client.address && <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{document.client.address}</Text>}
            {document.client.taxId && <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Tax ID: {document.client.taxId}</Text>}
          </View>
        )}

        {/* Table Header */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.colHeader]}>#</Text>
            <Text style={[styles.col2, styles.colHeader]}>Description</Text>
            <Text style={[styles.col3, styles.colHeader]}>Qty</Text>
            <Text style={[styles.col4, styles.colHeader]}>Unit Price</Text>
            <Text style={[styles.col5, styles.colHeader]}>Total</Text>
          </View>

          {/* Table Items */}
          {(document.items as any[]).map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.col1}>{idx + 1}</Text>
              <Text style={styles.col2}>{item.description}</Text>
              <Text style={styles.col3}>{item.quantity}</Text>
              <Text style={styles.col4}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.col5}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(document.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT ({document.vatAmount > 0 ? '7%' : '0%'})</Text>
            <Text style={styles.totalValue}>{formatCurrency(document.vatAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(document.total)}</Text>
          </View>
        </View>

        {/* PromptPay QR */}
        {qrCodeDataUrl && document.type === 'INVOICE' && (
          <View style={styles.qrContainer}>
            <Text style={styles.sectionTitle}>Scan to Pay (PromptPay)</Text>
            <Image src={qrCodeDataUrl} style={{ width: 100, height: 100 }} />
            <Text style={styles.qrText}>Amount: {formatCurrency(document.total)}</Text>
          </View>
        )}

      </Page>
    </Document>
  )
}
