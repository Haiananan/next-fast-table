const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const DataJson = require("./mock.json");

async function main() {
  for (let i = 0; i < DataJson.length; i++) {
    const data = DataJson[i];
    await prisma.payment.create({
      data: {
        ...data,
      },
    });
  }
}

main()
  .then(() => {
    console.log("Data seeded successfully");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
