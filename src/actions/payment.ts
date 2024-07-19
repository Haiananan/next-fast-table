"use server";
import { Payment } from "@prisma/client";
import prisma from "@/lib/db";
import {
  FetchParams,
  CreateParams,
  DeleteParams,
  UpdateParams,
} from "../../package/src/index";

function isDate(obj: any) {
  return obj instanceof Date && !isNaN(obj as any);
}

export async function onFetch(obj: FetchParams) {
  const pageSize = obj.pagination?.pageSize ?? 10;
  const pageIndex = obj.pagination?.pageIndex ?? 0;

  const sorting =
    obj.sorting?.map((sort) => {
      return { [sort.id]: sort.desc ? "desc" : "asc" };
    }) || [];

  const filters =
    obj.columnFilters?.map((filter) => {
      if (
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

  const payments = await prisma.payment.findMany({
    take: pageSize,
    skip: pageIndex * pageSize,
    orderBy: sorting.length > 0 ? sorting : [{ id: "desc" }],
    where: {
      AND: filters as any,
    },
  });

  return {
    list: payments.map((payment) => {
      return {
        ...payment,
        // to fix Warning: Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.
        amount: +payment.amount!.toString(),
      };
    }),
    total,
  };
}

export async function onCreate(data: CreateParams<Payment>) {
  await prisma.payment.create({
    data: data,
  });
}

export async function onDelete(data: DeleteParams<number>) {
  await prisma.payment.deleteMany({
    where: {
      id: {
        in: [data].flat().map((d) => d.id),
      },
    },
  });
}

export async function onUpdate(data: UpdateParams<Payment>) {
  await prisma.payment.update({
    where: {
      id: data.id,
    },
    data: data,
  });
}
