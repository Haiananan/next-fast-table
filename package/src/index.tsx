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

const queryClient = new QueryClient();

function NextFastTable(props: TableConfig) {
  return (
    <QueryClientProvider client={queryClient}>
      <DataTable {...props} />
    </QueryClientProvider>
  );
}
export {
  NextFastTable,
  Fields,
  FetchParams,
  CreateParams,
  UpdateParams,
  DeleteParams,
};
