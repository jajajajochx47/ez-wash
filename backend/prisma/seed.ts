import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

  await prisma.role.createMany({
    data: [
      { name: "ADMIN" },
      { name: "USER" }
    ],
    skipDuplicates: true
  })

}

main()