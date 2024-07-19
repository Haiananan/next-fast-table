"use client";
import { NextFastTable, Fields } from "../../package/src/index";
import { onCreate, onDelete, onFetch, onUpdate } from "@/actions/payment";
import { Chip } from "@nextui-org/react";

export default function DemoPage() {
  const field = Fields;

  const columns = [
    field.number("id"),
    field.image("avatar"),
    field.string("username"),
    field.number("amount"),
    field.enum("currency", { enum: ["USD", "EUR", "JPY"] }),
    field.email("email"),
    field.enum("status", { enum: ["pending", "success", "fail"] }),
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
