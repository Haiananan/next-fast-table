//seed

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const datas = require("./data.json");

function randomStringArray(length) {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr.push(Math.random().toString(36).substring(7));
  }
  return arr;
}

function randomJSON(length) {
  const obj = {};
  for (let i = 0; i < length; i++) {
    obj[Math.random().toString(36).substring(7)] = Math.random()
      .toString(36)
      .substring(7);
  }
  return obj;
}

async function main() {
  for (let i = 0; i < 500; i++) {
    const data = datas[i];
    const c = await prisma.payment.create({
      data: {
        ...data,
        tags: randomStringArray(5),
        extra: randomJSON(5),
      },
    });
    console.log(c.id);
  }
}

main()
  .catch((e) => {
    console.error(e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
