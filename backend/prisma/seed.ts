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

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER" }
  })

  console.log("✅ Roles seeded")

  //////////////////////////////////////////////////
  // 2. Admin User
  //////////////////////////////////////////////////

  const passwordHash = await bcrypt.hash("admin1234", 10)

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

  //////////////////////////////////////////////////
  // 4. Default Branch
  //////////////////////////////////////////////////

  const branch = await prisma.branch.upsert({
    where: { name: "สาขาหลัก" },
    update: {},
    create: {
      name: "สาขาหลัก",
      location: "หน้าบ้าน"
    }
  })

  console.log("✅ Branch created")

  //////////////////////////////////////////////////
  // 5. Machines
  //////////////////////////////////////////////////

  const machines = [
    { code: "W01", type: MachineType.WASHER, price: 40 },
    { code: "W02", type: MachineType.WASHER, price: 40 },
    { code: "D01", type: MachineType.DRYER, price: 30 }
  ]

  for (const m of machines) {
    await prisma.machine.upsert({
      where: {
        machineCode_branchId: {
          machineCode: m.code,
          branchId: branch.id
        }
      },
      update: {},
      create: {
        machineCode: m.code,
        machineType: m.type,
        pricePerUse: m.price,
        branchId: branch.id
      }
    })
  }

  console.log("✅ Machines seeded")

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