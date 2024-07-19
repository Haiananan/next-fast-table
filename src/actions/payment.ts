"use server";
import { Payment } from "@prisma/client";
import prisma from "@/lib/db";
function isDate(obj: any) {
  return obj instanceof Date && !isNaN(obj as any);
}
export async function get(obj: {
  pagination?: { pageSize: number; pageIndex: number };
  sorting?: { desc: boolean; id: string }[];
  columnFilters?: { id: string; value: any }[];
}) {
  console.log(obj);

  const pageSize = obj.pagination?.pageSize ?? 10;
  const pageIndex = obj.pagination?.pageIndex ?? 0;

  const sorting =
    obj.sorting?.map((sort) => {
      return { [sort.id]: sort.desc ? "desc" : "asc" };
    }) || [];

  const filters =
    obj.columnFilters?.map((filter) => {
      if (isDate(filter.value?.gte) && isDate(filter.value?.lte)) {
        return {
          [filter.id]: {
            gte: filter.value.gte,
            lte: filter.value.lte,
          },
        };
      } else if (
        typeof filter.value === "number" ||
        typeof filter.value === "boolean"
      ) {
        return {
          [filter.id]: {
            equals: filter.value,
          },
        };
      } else if (typeof filter.value === "string") {
        return { [filter.id]: { contains: filter.value } };
      } else if (isDate(filter.value)) {
        return {
          [filter.id]: {
            gte: filter.value,
          },
        };
      }
    }) || [];

  const total = await prisma.payment.count({
    where: {
      AND: filters as any,
    },
  });
  const pageCount = Math.ceil(total / pageSize);

  const payments = await prisma.payment.findMany({
    take: pageSize,
    skip: pageIndex * pageSize,
    orderBy: sorting.length > 0 ? sorting : [{ id: "desc" }],
    where: {
      AND: filters as any,
    },
  });

  return {
    list: payments,
    pageCount,
    total,
  };
}
export async function addData(paymentData: any) {
  const newPayment = await prisma.payment.create({
    data: paymentData,
  });
  return newPayment;
}

export async function deleteData(data: Payment | Payment[]) {
  const deletePayments = await prisma.payment.deleteMany({
    where: {
      id: {
        in: [data].flat().map((d) => d.id),
      },
    },
  });
  return deletePayments;
}

export async function updateData(paymentData: Partial<Payment>) {
  const updatedPayment = await prisma.payment.update({
    where: {
      id: paymentData.id,
    },
    data: paymentData,
  });
  return updatedPayment;
}
