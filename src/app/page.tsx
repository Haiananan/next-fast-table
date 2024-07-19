"use client";
import { NextFastTable, Fields } from "../../package/src/index";
import { onCreate, onDelete, onFetch, onUpdate } from "@/actions/payment";
import { Chip } from "@nextui-org/react";

export default function DemoPage() {
  const field = Fields;

  const columns = [
    field.number("id"),
    field.number("amount"),
    field.enum("currency", { enum: ["USD", "EUR", "JPY"] }),
    field.enum("status"),
    field.email("email"),
    field.boolean("isChecked"),
    field.ip("ip"),
    field.ua("device"),
    field.link("referer"),
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
