import "dotenv/config"

import { PrismaClient, MachineType } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {

  console.log("🌱 Start seeding...")

  //////////////////////////////////////////////////
  // 1. Roles
  //////////////////////////////////////////////////

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" }
  })

  await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER" }
  })

  console.log("✅ Roles seeded")

  //////////////////////////////////////////////////
  // 2. Admin User
  //////////////////////////////////////////////////

  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin1234"
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      name: "System Admin",
      passwordHash: passwordHash,
      roleId: adminRole.id
    }
  })

  console.log("✅ Admin user created")

  //////////////////////////////////////////////////
  // 3. Expense Categories
  //////////////////////////////////////////////////

  const categories = [
    "ค่าไฟ",
    "ค่าน้ำ",
    "ค่าซ่อมเครื่อง",
    "ค่าอุปกรณ์",
    "ค่าเช่าสถานที่"
  ]

  for (const name of categories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  console.log("✅ Expense categories seeded")

  console.log("🌱 Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })