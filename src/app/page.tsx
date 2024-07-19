"use client";
import { NextFastTable, Fields } from "next-fast-table";
import { onCreate, onDelete, onFetch, onUpdate } from "@/actions/payment";
const currencyEnum = [
  "USD", // United States Dollar
  "EUR", // Euro
  "JPY", // Japanese Yen
  "GBP", // British Pound Sterling
  "AUD", // Australian Dollar
  "CAD", // Canadian Dollar
  "CHF", // Swiss Franc
  "CNY", // Chinese Yuan
  "SEK", // Swedish Krona
  "NZD", // New Zealand Dollar
  "MXN", // Mexican Peso
  "SGD", // Singapore Dollar
  "HKD", // Hong Kong Dollar
  "NOK", // Norwegian Krone
  "KRW", // South Korean Won
  "TRY", // Turkish Lira
  "RUB", // Russian Ruble
  "INR", // Indian Rupee
  "BRL", // Brazilian Real
  "ZAR", // South African Rand
];

export default function DemoPage() {
  const field = Fields;

  const columns = [
    field.number("id"),
    field.image("avatar"),
    field.string("username"),
    field.number("amount"),
    field.enum("currency", { enum: currencyEnum }),
    field.email("email"),
    field.enum("status", { enum: ["pending", "success", "failure"] }),
    field.boolean("isChecked"),
    field.ip("ip"),
    field.ua("ua"),
    field.date("createdAt"),
    field.date("updatedAt"),
    field.link("referer"),
    field.array("tags"),
    field.json("extra"),
  ];

  return (
    <div className=" w-full  h-screen">
      <NextFastTable
        columns={columns}
        onFetch={onFetch}
        onDelete={onDelete}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </div>
  );
}
