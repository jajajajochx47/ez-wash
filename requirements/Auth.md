# 🧺 Ez-Wash Web Application: Auth Requirements
> **Target:** Small-Medium Business / SaaS / Personal Project (Professional Level)

เอกสารฉบับนี้ระบุข้อกำหนดด้านระบบความปลอดภัย (Authentication & Authorization) สำหรับเว็บแอปพลิเคชันบัญชีร้านเครื่องซักผ้าหยอดเหรียญ เพื่อให้รองรับการใช้งานจริงและมีความปลอดภัยสูง

---

## 1. Scope ของระบบ Authentication
ระบบถูกออกแบบมาให้รองรับ Flow การทำงานที่จำเป็นสำหรับธุรกิจร้านค้า:
* **Registration:** ระบบปิด (Closed System) เฉพาะ Owner เท่านั้นที่สมัครได้
* **Login/Logout:** การเข้าและออกจากระบบผ่านมาตรฐาน JWT
* **Token Management:** รองรับทั้ง Access Token และ Refresh Token
* **Password Management:** ระบบลืมรหัสผ่าน (Forgot Password) และการเปลี่ยนรหัสผ่าน (Change Password)
* **RBAC:** การควบคุมสิทธิ์ตามบทบาทหน้าที่ (Role-Based Access Control)

---

## 2. User Roles & Permissions (RBAC)
สิทธิ์ในการเข้าถึง API และข้อมูลในระบบแบ่งเป็น 3 ระดับ:

| Role | Permissions | Description |
| :--- | :--- | :--- |
| **OWNER** | Full Access | จัดการได้ทุกอย่าง (พนักงาน, ร้านค้า, การเงิน, ดูรายงาน) |
| **EMPLOYEE** | Write/Read | บันทึกรายรับ-รายจ่าย และดูประวัติรายการ |
| **VIEWER** | Read Only | (Optional) ดูรายงานสรุปผลได้อย่างเดียว แก้ไขไม่ได้ |

---

## 3. Authentication Flow
กระบวนการยืนยันตัวตนและการเข้าถึง API แบบ Stateless:

1.  **User Login:** ส่ง Email + Password ผ่าน HTTPS
2.  **Validation:** Backend ตรวจสอบ Credentials (Hash Matching)
3.  **Generate Tokens:** * **Access Token:** (JWT) อายุ 1 ชั่วโมง (สำหรับเรียก API)
    * **Refresh Token:** (Opaque/JWT) อายุ 7 วัน (สำหรับขอ Access Token ใหม่)
4.  **Storage:** * *Frontend:* เก็บ Access Token ใน Memory
    * *Backend:* ส่ง Refresh Token กลับทาง **HttpOnly Cookie** (เพื่อป้องกัน XSS)

---

## 4. Functional Requirements

### 4.1 Register (Owner Only)
เนื่องจากเป็นระบบร้านค้า ไม่เปิดให้ User ทั่วไปสมัครเองโดยไม่มีร้าน
* **Required Fields:** `email`, `password`, `shop_name`
* **Logic:** เมื่อ Register สำเร็จ ระบบต้องสร้าง **User**, **Shop**, และผูกสิทธิ์ **Owner** ทันที
* **Email Verification:** ต้องยืนยันตัวตนผ่าน Email ก่อน Account จะเป็น `is_active: true`

### 4.2 Login & Protection
* **Brute Force Protection:** จำกัดการเข้าระบบผิดไม่เกิน 5 ครั้ง/บัญชี หากเกินให้ Lock เป็นเวลา 15 นาที
* **Response:**
    ```json
    {
      "access_token": "JWT_TOKEN",
      "expires_in": 3600,
      "user_info": { "id": "uuid", "role": "OWNER", "shop_id": "uuid" }
    }
    ```

### 4.3 Forgot & Reset Password
* **Expiry:** Reset Link ต้องหมดอายุภายใน 15 นาที
* **One-time Use:** เมื่อใช้ Token รีเซ็ตแล้ว ต้องยกเลิก Token นั้นทันที

---

## 5. Database Schema (Auth Layer)

### Table: `users`
| Field | Type | Constraint |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `email` | Varchar | Unique, Indexed |
| `password_hash` | Varchar | Argon2 / bcrypt |
| `role` | Enum | OWNER, EMPLOYEE, VIEWER |
| `shop_id` | UUID | Foreign Key -> `shops.id` |
| `is_active` | Boolean | Default: False |

### Table: `shops`
| Field | Type | Constraint |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `name` | Varchar | Not Null |
| `owner_id` | UUID | Foreign Key -> `users.id` |

---

## 6. API Endpoints Reference

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | สมัครใช้งาน Owner + เปิดร้าน | Public |
| `POST` | `/auth/login` | เข้าสู่ระบบ (รับ Access + Refresh Token) | Public |
| `POST` | `/auth/refresh` | ใช้ Refresh Token ขอ Access Token ใหม่ | Public |
| `POST` | `/auth/logout` | ลบ Refresh Token ใน DB/Cookie | Private |
| `POST` | `/auth/forgot-password` | ส่งเมลรีเซ็ตรหัสผ่าน | Public |
| `POST` | `/auth/reset-password` | ตั้งรหัสผ่านใหม่ด้วย Token | Public |

---

## 7. Security Standards (ใช้งานจริง)
* **Password Hashing:** ต้องใช้ **Argon2** (แนะนำ) หรือ **bcrypt** เท่านั้น
* **HTTPS:** บังคับใช้ TLS 1.2+ ในการรับส่งข้อมูลทุกชนิด
* **JWT Revocation:** เมื่อพนักงานลาออก หรือ User กด Logout ต้องสามารถ Invalidate Refresh Token ใน DB ได้
* **Audit Log:** สำหรับระบบบัญชี แนะนำให้บันทึก Log ของการสร้าง/แก้ไข Transaction ทุกครั้ง โดยระบุ `user_id`

---

## 8. Recommended Tech Stack
* **Backend:** NestJS (Node.js) + Prisma ORM + PostgreSQL
* **Auth Lib:** `passport-jwt`, `bcrypt`, `argon2`
* **Frontend:** React / Next.js + Tailwind CSS
* **Infrastructure:** Docker + Nginx (Reverse Proxy)

---
*Created for ez-wash Project - 2026*