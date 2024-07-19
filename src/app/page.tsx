"use client";
import { NextFastTable, Fields } from "../../package/dist/index";
import { onCreate, onDelete, onFetch, onUpdate } from "@/actions/payment";
import { Chip } from "@nextui-org/react";

export default function DemoPage() {
  const field = Fields;

  const columns = [
    field.number("id"),
    field.number("amount"),
    field.enum("currency", { enum: ["USD", "EUR", "JPY"] }),
    field.enum("status"),
    field.string("email"),
    field.boolean("isChecked"),
    field.string("ip"),
    field.string("device"),
    field.string("referer"),
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
