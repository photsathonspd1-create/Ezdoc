# 🔱 MASTER BLUEPRINT: AI.EzDoc (Advanced Accountant Ecosystem)

## 1. Context Awareness & Accountant Logic
*   **Tax/Accounting Engine**: พัฒนาตัวถอดรหัสความตั้งใจของผู้ใช้ (Intent Parser) ให้รองรับ "ภาษีมูลค่าเพิ่ม (VAT), ภาษีหัก ณ ที่จ่าย (WHT), และการจัดหมวดหมู่บัญชี (Chart of Accounts)" ตามมาตรฐานกรมสรรพากรไทย
*   **Receipt OCR & Data Synthesis**: ยกระดับการประมวลผลรูปภาพใบเสร็จ (Vision API) ให้ตรวจจับเลขภาษี, ชื่อผู้ขาย, และวันที่ เพื่อตรวจสอบความถูกต้องของ VAT ก่อนนำเข้าสู่ระบบ
*   **Fiscal Compliance Guard**: เพิ่มโมดูลตรวจสอบ "ความผิดปกติของข้อมูล" (Anomaly Detection) เช่น เลขที่ใบกำกับภาษีซ้ำ หรือยอดเงินที่ขัดแย้งกับประวัติการซื้อขาย

## 2. Advanced AI.EzDoc Console (UI/UX)
*   **Universal AI Commander**: เปลี่ยนหน้า `/ai-ezdoc-dashboard` เป็น **AI.EzDoc Dashboard** ซึ่งไม่ใช่แค่แชท แต่เป็นหน้าสั่งการ (Command Center) 
*   **Voice-to-Task Pipeline (Production Ready)**: เชื่อมต่อระบบเสียงด้วย Web Speech API แบบ Latency ต่ำ และเพิ่มโมดูล TTS เพื่อให้บอทโต้ตอบกลับด้วยเสียงที่เป็นมิตร
*   **Real-time System Monitoring**: พัฒนาส่วนประกอบ (Component) ที่ดึงข้อมูลจากระบบมาแสดงผลแบบ Real-time เช่น "ยอดคงเหลือสุทธิ (Net Cashflow)", "ภาษีที่ต้องจ่ายในเดือนนี้" และแสดงแจ้งเตือนสำคัญ

## 3. Autonomous Backend (Backend Engine)
*   **Transactional State Machine**: แทนที่การส่งข้อมูลตรงไปกรอกฟอร์ม ให้สร้างระบบ "Task Queue" เพื่อให้ AI.EzDoc สามารถรันงานต่อเนื่องได้ เช่น "สแกนเอกสาร -> ตรวจภาษี -> บันทึกบัญชี -> ออกรายงานสรุป"
*   **Cross-Project API Gateway**: พัฒนา `Universal Gateway` ให้เป็นระบบ Micro-API ที่สามารถดึงข้อมูลจาก EzDoc และส่งออกไปยังระบบอื่นๆ (เช่น Acexflow หรือระบบจัดเก็บเอกสาร)
*   **Security & Auth Middleware**: ระบบตรวจสอบสิทธิ์ด้วย JWT (Tier-based: Free/Monthly/Yearly) เพื่อจำกัด Tool เข้าถึงสำหรับลูกค้าแต่ละกลุ่ม

## 4. Operational Roadmap
*   **[Phase 1: Rebranding & UI Polish]**: เปลี่ยนชื่อโปรเจกต์ทั้งหมด (Global Search & Replace) ให้เป็น AI.EzDoc พร้อมเปลี่ยน UI ให้ดูเป็น Accountant-focused.
*   **[Phase 2: Accountant Core Integration]**: สร้างฟังก์ชันให้ AI สามารถอ่านข้อมูลจากตาราง (Tables) ใน `transactions/page.tsx` และทำนายยอดคงเหลือสุทธิได้เอง
*   **[Phase 3: E2E Automation Integration]**: เขียนสคริปต์ Playwright เพื่อเทสว่าเมื่อ Master สั่งงานด้วยเสียง ระบบจะคลิกบันทึกและแสดงรายการเงินใหม่บนตารางได้จริง 100%
*   **[Phase 4: Security Hardening]**: ล็อคระบบไม่ให้ลูกค้าเข้าถึง Tool Admin โดยเด็ดขาด โดยตรวจสอบ User role จาก Backend ก่อนประมวลผลคำสั่ง
