import {
  DataTable,
  TableConfig,
  UpdateParams,
  FetchParams,
  CreateParams,
  DeleteParams,
} from "./DataTable";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React from "react";
import "./tailwind.css";
import { Fields } from "./helper";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

function NextFastTable(props: TableConfig) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-center" />
      <DataTable {...props} />
    </QueryClientProvider>
  );
}
export {
  NextFastTable,
  Fields,
  type FetchParams,
  type CreateParams,
  type UpdateParams,
  type DeleteParams,
};
