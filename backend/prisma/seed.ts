import "dotenv/config"

import {
  ExpenseCategory,
  MachineStatus,
  MachineType,
  PrismaClient,
  RepairStatus,
  User,
} from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

type BranchSeed = {
  name: string
  location: string
  profile: "mall" | "condo" | "campus" | "market" | "suburb"
}

const DEMO_BRANCHES: BranchSeed[] = [
  { name: "Ma Der - Siam Square", location: "Siam Square, Bangkok", profile: "mall" },
  { name: "Ma Der - Ari", location: "Ari, Bangkok", profile: "condo" },
  { name: "Ma Der - Rangsit Campus", location: "Rangsit, Pathum Thani", profile: "campus" },
  { name: "Ma Der - Chiang Mai Nimman", location: "Nimmanhaemin, Chiang Mai", profile: "market" },
  { name: "Ma Der - Khon Kaen City", location: "Mueang, Khon Kaen", profile: "suburb" },
]

const EXPENSE_CATEGORIES = [
  "Electricity",
  "Water",
  "Rent",
  "Detergent & Supplies",
  "Machine Maintenance",
  "Cleaning Service",
  "Marketing",
  "Internet & Software",
]

const STAFF = [
  { email: "owner@maderwash.com", name: "Narin Demo Owner", role: "ADMIN" },
  { email: "manager.siam@maderwash.com", name: "Ploy Siam Manager", role: "USER" },
  { email: "manager.north@maderwash.com", name: "Krit North Manager", role: "USER" },
  { email: "collector@maderwash.com", name: "Mint Cash Collector", role: "USER" },
]

const PROBLEM_LIST = [
  "Coin acceptor jammed",
  "Drain pump clogged",
  "Door lock sensor error",
  "Dryer heating element weak",
  "Payment QR sticker damaged",
  "Vending slot stuck",
  "Water inlet valve slow",
]

function dayOffset(daysAgo: number, hour = 12) {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  date.setDate(date.getDate() - daysAgo)
  return date
}

function amountForMachine(type: MachineType, profile: BranchSeed["profile"], daysAgo: number, index: number) {
  const profileBoost = {
    mall: 1.35,
    condo: 1.05,
    campus: 1.25,
    market: 1.15,
    suburb: 0.95,
  }[profile]
  const weekendBoost = daysAgo % 7 === 0 || daysAgo % 7 === 6 ? 1.22 : 1
  const trendBoost = daysAgo < 14 ? 1.18 : daysAgo < 45 ? 1.08 : 1
  const machineBoost = 0.88 + (index % 5) * 0.07
  const baseUses = type === MachineType.DRYER ? 10 : type === MachineType.VENDING_MACHINE ? 18 : 14
  const price = type === MachineType.DRYER ? 40 : type === MachineType.VENDING_MACHINE ? 15 : 35
  const uses = Math.round(baseUses * profileBoost * weekendBoost * trendBoost * machineBoost)

  return uses * price
}

async function resetDemoData() {
  const branches = await prisma.branch.findMany({
    where: { name: { in: DEMO_BRANCHES.map((branch) => branch.name) } },
    select: { id: true },
  })
  const branchIds = branches.map((branch) => branch.id)

  if (branchIds.length === 0) return

  const machines = await prisma.machine.findMany({
    where: { branchId: { in: branchIds } },
    select: { id: true },
  })
  const machineIds = machines.map((machine) => machine.id)

  await prisma.income.deleteMany({ where: { branchId: { in: branchIds } } })
  await prisma.expense.deleteMany({ where: { branchId: { in: branchIds } } })
  await prisma.repair.deleteMany({ where: { machineId: { in: machineIds } } })
  await prisma.machineCollection.deleteMany({ where: { machineId: { in: machineIds } } })
  await prisma.machine.deleteMany({ where: { branchId: { in: branchIds } } })
  await prisma.branch.deleteMany({ where: { id: { in: branchIds } } })
}

async function main() {
  console.log("Start seeding demo data...")

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  })

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER" },
  })

  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin1234"
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: { passwordHash, roleId: adminRole.id, name: "System Admin" },
    create: {
      email: "admin@admin.com",
      name: "System Admin",
      passwordHash,
      roleId: adminRole.id,
    },
  })

  const staffUsers: User[] = []
  for (const staff of STAFF) {
    const user = await prisma.user.upsert({
      where: { email: staff.email },
      update: { name: staff.name, roleId: staff.role === "ADMIN" ? adminRole.id : userRole.id },
      create: {
        email: staff.email,
        name: staff.name,
        passwordHash,
        roleId: staff.role === "ADMIN" ? adminRole.id : userRole.id,
      },
    })
    staffUsers.push(user)
  }

  const categories: ExpenseCategory[] = []
  for (const name of EXPENSE_CATEGORIES) {
    const category = await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    categories.push(category)
  }

  await resetDemoData()

  let totalMachines = 0
  let totalCollections = 0
  let totalExpenses = 0
  let totalRepairs = 0

  for (const [branchIndex, branchSeed] of DEMO_BRANCHES.entries()) {
    const branch = await prisma.branch.create({
      data: {
        name: branchSeed.name,
        location: branchSeed.location,
      },
    })

    const machineData = [
      ...Array.from({ length: 6 }, (_, index) => ({
        machineCode: `W-${branchIndex + 1}${String(index + 1).padStart(2, "0")}`,
        machineType: MachineType.WASHER,
        pricePerUse: 35,
        status: index === 5 && branchIndex % 2 === 0 ? MachineStatus.MAINTENANCE : MachineStatus.ACTIVE,
      })),
      ...Array.from({ length: 4 }, (_, index) => ({
        machineCode: `D-${branchIndex + 1}${String(index + 1).padStart(2, "0")}`,
        machineType: MachineType.DRYER,
        pricePerUse: 40,
        status: index === 3 && branchIndex === 3 ? MachineStatus.DISABLED : MachineStatus.ACTIVE,
      })),
      {
        machineCode: `V-${branchIndex + 1}01`,
        machineType: MachineType.VENDING_MACHINE,
        pricePerUse: 15,
        status: MachineStatus.ACTIVE,
      },
    ]

    await prisma.machine.createMany({
      data: machineData.map((machine) => ({ ...machine, branchId: branch.id })),
    })

    const machines = await prisma.machine.findMany({
      where: { branchId: branch.id },
      orderBy: { machineCode: "asc" },
    })
    totalMachines += machines.length

    for (const [machineIndex, machine] of machines.entries()) {
      for (let daysAgo = 89; daysAgo >= 0; daysAgo -= 3) {
        const amount = amountForMachine(machine.machineType, branchSeed.profile, daysAgo, machineIndex)
        const collectedAt = dayOffset(daysAgo, 20)
        const collector = staffUsers[(branchIndex + machineIndex + daysAgo) % staffUsers.length]

        const collection = await prisma.machineCollection.create({
          data: {
            machineId: machine.id,
            collectedById: collector.id,
            amount,
            collectedAt,
            createdAt: collectedAt,
          },
        })

        await prisma.income.create({
          data: {
            machineId: machine.id,
            branchId: branch.id,
            amount,
            note: `Demo collection ${machine.machineCode}`,
            incomeDate: collectedAt,
            createdAt: collectedAt,
            collectionId: collection.id,
          },
        })
        totalCollections += 1
      }
    }

    for (let daysAgo = 88; daysAgo >= 0; daysAgo -= 7) {
      const expenseDate = dayOffset(daysAgo, 10)
      const weeklyBase = 1800 + branchIndex * 350 + (daysAgo % 5) * 120
      const expenseRows = [
        { category: "Electricity", amount: weeklyBase * 1.6, description: "Weekly electricity bill" },
        { category: "Water", amount: weeklyBase * 0.75, description: "Weekly water bill" },
        { category: "Detergent & Supplies", amount: weeklyBase * 0.45, description: "Detergent and softener stock" },
        { category: "Cleaning Service", amount: 900 + branchIndex * 80, description: "Shop cleaning service" },
      ]

      if (daysAgo % 14 === 4) {
        expenseRows.push({ category: "Marketing", amount: 1200, description: "Local promotion campaign" })
      }
      if (daysAgo % 28 === 11) {
        expenseRows.push({ category: "Rent", amount: 12000 + branchIndex * 1500, description: "Monthly rental allocation" })
      }

      for (const row of expenseRows) {
        const category = categories.find((item) => item.name === row.category)
        if (!category) continue

        await prisma.expense.create({
          data: {
            branchId: branch.id,
            categoryId: category.id,
            amount: Math.round(row.amount),
            description: row.description,
            expenseDate,
            createdAt: expenseDate,
          },
        })
        totalExpenses += 1
      }
    }

    for (const [repairIndex, machine] of machines.entries()) {
      if (repairIndex % 4 !== branchIndex % 4) continue

      const isPending = repairIndex % 7 === 0
      const createdAt = dayOffset(10 + repairIndex * 3 + branchIndex, 14)
      const repairDate = isPending ? null : dayOffset(8 + repairIndex * 3 + branchIndex, 16)

      await prisma.repair.create({
        data: {
          machineId: machine.id,
          problem: PROBLEM_LIST[(repairIndex + branchIndex) % PROBLEM_LIST.length],
          repairCost: isPending ? null : 650 + repairIndex * 180 + branchIndex * 90,
          repairDate,
          status: isPending ? RepairStatus.PENDING : RepairStatus.FIXED,
          createdAt,
        },
      })
      totalRepairs += 1
    }
  }

  console.log("Demo seed completed")
  console.log(`Login: admin@admin.com / ${adminPassword}`)
  console.log(`Branches: ${DEMO_BRANCHES.length}`)
  console.log(`Machines: ${totalMachines}`)
  console.log(`Collections/Incomes: ${totalCollections}`)
  console.log(`Expenses: ${totalExpenses}`)
  console.log(`Repairs: ${totalRepairs}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
