"use client";
import { NextFastTable, Fields } from "../../package/dist/index";
import { onCreate, onDelete, onFetch, onUpdate } from "@/actions/payment";
import { Chip } from "@nextui-org/react";

export default function DemoPage() {
  const field = Fields;

  const columns = [
    field.number("id", {
      label: "UID",
      render({ cell, row }) {
        return <div>{cell}</div>;
      },
    }),
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
