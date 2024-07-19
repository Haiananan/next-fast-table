"use client";
import { NextFastTable, Fields } from "../../package/dist/index";
import { get, deleteData, updateData, addData } from "@/actions/payment";
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

  const onFetch = async ({ pagination, columnFilters, sorting }) => {
    const response = await get({ pagination, columnFilters, sorting });
    return response;
  };

  const onDelete = async (data) => {
    console.log("Delete data", data);
    deleteData(data);
  };

  const onCreate = async (data) => {
    console.log("Create data", data);
    await addData(data);
  };

  const onUpdate = async (data) => {
    console.log("Update data", data);
    await updateData(data);
  };

  return (
    <div className=" w-full  h-screen">
      <NextFastTable
        columns={columns}
        onFetch={onFetch}
        // onDelete={onDelete}
        // onCreate={onCreate}
        // onUpdate={onUpdate}
      />
    </div>
  );
}
