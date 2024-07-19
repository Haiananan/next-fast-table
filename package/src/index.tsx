export { Fields } from "./helper.js";
import { DataTable, TableConfig } from "./data-table.js";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React from "react";
import "./tailwind.css";

const queryClient = new QueryClient();

export function NextFastTable(props: TableConfig) {
  return (
    <QueryClientProvider client={queryClient}>
      <DataTable {...props} />
    </QueryClientProvider>
  );
}
