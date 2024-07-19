"use client";
import React, { useEffect, useMemo, useState } from "react";
import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useMedia } from "react-use";
import { Controller, useForm } from "react-hook-form";
import { parseAbsoluteToLocal } from "@internationalized/date";
import { typedIcon } from "./helper";
import { MyTableBody } from "./TableBody";

dayjs.extend(utc);
dayjs.extend(timezone);

type DataWithID<T = Record<string, any>> = {
  id: number | string;
} & Partial<T>;

interface DataOnlyId<T = number | string> {
  id: T;
}

export interface FetchParams {
  pagination: PaginationState;
  columnFilters: ColumnFiltersState;
  sorting: SortingState;
}

export type DeleteParams<T> = DataOnlyId<T> | DataOnlyId<T>[];

export type UpdateParams<T = Record<string, any>> = DataWithID<T>;

export type CreateParams<T = Record<string, any>> = DataWithID<T>;

/**
 * Table configuration options.
 */
export interface TableConfig {
  /**
   * The name of the table, used to generate the key for tanstack-query. Defaults to 'next-table'.
   */
  name?: string;

  /**
   * The columns configuration for the table.
   */
  columns: any;

  /**
   * Function to fetch data for the table.
   * @param args - The fetch arguments including pagination, column filters, and sorting state.
   * @returns A promise that resolves with the total number of items and the list of data with ID.
   * @example
   * async function fetchData({ pagination, sorting, columnFilters }) {
   *   const data = await fetchDataFromAPI({
   *     pagination,
   *     sorting,
   *     columnFilters,
   *   });
   *   const total = await fetchTotalCount();
   *   return {
   *     list: data,
   *     total,
   *   };
   * }
   */
  onFetch: (
    args: FetchParams
  ) => Promise<{ total: number; list: DataWithID[] }>;

  /**
   * Function to delete data.
   * @param data - The data to be deleted, either a single ID or an array of IDs.
   * @returns A promise that resolves when the deletion is complete.
   * @example
   * async function deleteData(data) {
   *   await deleteDataFromAPI(data);
   * }
   */
  onDelete?: (data: any) => Promise<void>;

  /**
   * Function to create new data.
   * @param data - The data to be created.
   * @returns A promise that resolves when the creation is complete.
   * @example
   * async function createData(data) {
   *   const newData = await createDataInAPI(data);
   *   return newData;
   * }
   */
  onCreate?: (data: any) => Promise<void>;

  /**
   * Function to update existing data.
   * @param data - The data to be updated. Only the ID and fields to be updated will be sent.
   * @returns A promise that resolves when the update is complete.
   * @example
   * async function updateData(data) {
   *   const updatedData = await updateDataInAPI(data);
   *   return updatedData;
   * }
   */
  onUpdate?: (data: any) => Promise<void>;
}
export function DataTable({
  name = "next-table",
  columns,
  onFetch,
  onDelete,
  onCreate,
  onUpdate,
}: TableConfig) {
  const initalHiddenColumns = columns
    .filter((col) => col?.meta?.list?.hidden)
    .map((item) => item.accessorKey)
    .reduce((acc, cur) => ({ ...acc, [cur]: false }), {});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(initalHiddenColumns);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: 20,
    pageIndex: 0,
  });
  const [data, setData] = useState<DataWithID[]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);

  const table = useReactTable({
    pageCount,
    data,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      columnOrder,
      columnPinning,
    },
  });

  const isMobile = useMedia("(max-width: 768px)", true);

  const getQuery = useQuery({
    queryKey: [name, { sorting, columnFilters, pagination }],
    queryFn: () => onFetch({ pagination, columnFilters, sorting }),
  });

  const deleteMutation = useMutation({
    mutationFn: onDelete,
    onSuccess: (data, variables) => {
      toast.success("Row deleted successfully");
      getQuery.refetch();

      onClose();
    },
    onError: (err, variables) => {
      toast.error("Failed to delete rows", { description: err.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: onUpdate,
    onSuccess: () => {
      toast.success("Row updated successfully");
      getQuery.refetch();
      onClose();
    },
    onError: (e) => {
      toast.error("Failed to update row", { description: e.message });
    },
  });

  const createMutation = useMutation({
    mutationFn: onCreate,
    onSuccess: (data, variables) => {
      toast.success("Row created successfully");
      getQuery.refetch();
      onClose();
    },
    onError: (e) => {
      toast.error("Failed to create row", { description: e.message });
    },
  });

  useEffect(() => {
    if (getQuery.isSuccess) {
      setPageCount(Math.ceil(getQuery.data.total / pagination.pageSize) ?? 1);
      setData((getQuery.data?.list as any) ?? []);
      setTotal(getQuery.data?.total ?? 0);
    }
  }, [getQuery.isSuccess, getQuery.data, pagination.pageSize]);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure({
    onClose() {
      setMode(undefined);
      reset({});
    },
  });
  // const [targetRow, setTargetRow] = useState<any>({});
  const [mode, setMode] = useState<
    "create" | "edit" | "filter" | "view" | "delete" | undefined
  >(undefined);
  const {
    control,
    handleSubmit,
    formState: { dirtyFields, isDirty, defaultValues },
    register,
    reset,
    getValues,
    setValue,
    watch,
  } = useForm({});
  // it will slow down the input
  const [formData, setFormData] = useState<any>({});
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const formData = watch();
      setFormData(formData);
    }
  }, []);
  const convertToDate = (data) => {
    const { year, month, day, hour, minute, second, millisecond, timeZone } =
      data;

    // 创建一个 Day.js 对象
    const date = dayjs.tz(
      `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}`,
      timeZone
    );

    return date.toDate();
  };

  const onSubmit = (data: any) => {
    const dirtyData = Object.keys(dirtyFields).reduce((acc, cur) => {
      return { ...acc, [cur]: data[cur] };
    }, {});

    const dirtyDataWithPrimaryKey = {
      ...dirtyData,
      [primaryKey]: data[primaryKey],
    };

    console.log({ dirtyDataWithPrimaryKey, dirtyData, data, primaryKey });

    if (mode === "create") {
      createMutation.mutate(dirtyData as any);
    } else if (mode === "edit") {
      updateMutation.mutate(dirtyDataWithPrimaryKey as any);
    } else if (mode === "filter") {
      const arr = Object.entries(dirtyData)
        .filter(([key, value]) => value !== undefined && value !== "")
        .map(([key, value]) => ({ id: key, value }));

      setColumnFilters(arr);
      onClose();
    } else if (mode === "view") {
      navigator.clipboard.writeText(JSON.stringify(data));
      toast.success("Copied to clipboard");
      onClose();
    } else if (mode === "delete") {
      deleteMutation.mutate({ [primaryKey]: data[primaryKey] });
    } else {
      console.log("No mode selected");
      toast.error("No mode selected");
    }
  };

  const visibleColumnIds = table
    .getVisibleFlatColumns()
    .map((column) => column.id);
  const isFilterDirty =
    table
      .getState()
      .columnFilters.filter(
        (item) => item.id && item.value !== undefined && item.value !== ""
      ).length > 0;

  const onCreateButtonClick = () => {
    setMode("create");
    reset({});
    onOpen();
  };

  const onResetButtonClick = () => {
    table.resetColumnFilters();
    onClose();
  };

  const onDeleteButtonClick = () => {
    const rows = table.getSelectedRowModel().rows;
    const items = rows.map((row) => ({
      id: row.original.id,
    }));
    table.resetRowSelection();
    deleteMutation.mutate(items as any);
  };

  const onTableSelectionChange = (value) => {
    if (value === "all") return table.toggleAllRowsSelected();

    table.setRowSelection(
      [...value].reduce((acc, cur) => ({ ...acc, [+cur]: true }), {})
    );
  };

  const isCreateOrEditMode = mode === "create" || mode === "edit";

  const primaryKey = "id";

  const inputDefaultValue = (key: string): any | undefined => {
    if (mode === "edit" || mode === "view") {
      // return targetRow[key];
      return getValues(key);
    } else if (mode === "create") {
      return undefined;
    } else if (mode === "filter") {
      const filter = table
        .getState()
        .columnFilters.find((item) => item.id === key);
      if (filter !== undefined) {
        return filter.value;
      }
    }
    return undefined;
  };

  const iconClasses =
    "text-xl text-default-500 pointer-events-none flex-shrink-0";

  const memoizedTable = useMemo(
    () => (
      <MyTableBody
        table={table}
        getQuery={getQuery}
        onOpen={onOpen}
        reset={reset}
        setMode={setMode}
        hideEdit={onUpdate === undefined}
        hideDelete={onDelete === undefined}
      />
    ),
    [table, isMobile, getQuery]
  );

  return (
    <div id="container" className="space-y-2 p-2 flex flex-col h-full   ">
      {/* <div
        id="debugger"
        className=" w-1/5 p-2 rounded-xl  bg-black/50 pointer-events-none top-20  absolute z-[999999]"
      >
        {Object.entries({
          defaultValues,
          formData,
          isDirty,
          dirtyFields,
          mode,
          columnFilters,
        }).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <span>{key}</span>
            <pre>{JSON.stringify(value, null, 2)}</pre>
          </div>
        ))}
      </div> */}
      <Modal
        id="modal"
        isOpen={isOpen}
        placement="bottom-center"
        size="3xl"
        scrollBehavior="inside"
        onOpenChange={onOpenChange}
        onClose={onClose}
        backdrop="blur"
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader>
            <span>{mode}</span>
          </ModalHeader>
          <ModalBody>
            <form id="addDataForm" onSubmit={handleSubmit(onSubmit)}>
              {columns.map((column) => (
                <div key={column.accessorKey} className="mb-2">
                  <div>
                    {["string", "number", "longtext"].includes(
                      column.meta?.type
                    ) && (
                      <Input
                        {...register(column.accessorKey, {
                          setValueAs(value) {
                            const type = column.meta?.type;
                            if (
                              typeof value === "string" &&
                              value?.trim() === ""
                            ) {
                              return undefined;
                            }
                            if (type === "number") return Number(value);
                            if (type === "string" || type === "longtext")
                              return String(value);
                          },
                        })}
                        defaultValue={inputDefaultValue(column.accessorKey)}
                        type={
                          column.meta?.type === "longtext" ? "textarea" : "text"
                        }
                        onClick={() => {
                          if (mode !== "view") return;
                          navigator.clipboard.writeText(
                            getValues(column.accessorKey)
                          );
                          toast.success("Copied to clipboard");
                        }}
                        className={column.enableColumnFilter ? "" : "hidden"}
                        endContent={typedIcon(column.meta?.type)}
                        label={column.header}
                        isReadOnly={mode === "view"}
                        isDisabled={
                          column.meta?.input?.disabled && isCreateOrEditMode
                        }
                        isRequired={
                          column.meta?.input?.required && mode !== "filter"
                        }
                      />
                    )}

                    {column.meta?.type === "boolean" && (
                      <Controller
                        name={column.accessorKey}
                        control={control}
                        render={({ field }) => (
                          <Select
                            label={column.header}
                            isDisabled={mode === "view" || mode === "delete"}
                            defaultSelectedKeys={[
                              inputDefaultValue(column.accessorKey)?.toString(),
                            ]}
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) => {
                              const select = e.target.value;
                              if (select === "true") {
                                return field.onChange(true);
                              }
                              if (select === "false") {
                                return field.onChange(false);
                              }
                              return field.onChange(undefined);
                            }}
                          >
                            {["false", "true"].map((str) => (
                              <SelectItem key={str} value={str}>
                                {str}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />
                    )}
                    {column.meta?.type === "date" && (
                      <Controller
                        control={control}
                        name={column.accessorKey}
                        render={({ field }) => (
                          <DatePicker
                            granularity="second"
                            label={column.header}
                            value={
                              field.value
                                ? parseAbsoluteToLocal(
                                    field.value?.toISOString()
                                  )
                                : undefined
                            }
                            onChange={(date) => {
                              field.onChange(convertToDate(date));
                            }}
                            isDisabled={column.meta?.edit?.disabled}
                            isRequired={
                              column.meta?.edit?.required && isCreateOrEditMode
                            }
                          />
                        )}
                      />
                    )}
                    {column.meta?.type === "enum" && (
                      <Controller
                        name={column.accessorKey}
                        control={control}
                        render={({ field }) => (
                          <Select
                            label={column.header}
                            isDisabled={mode === "view" || mode === "delete"}
                            defaultSelectedKeys={[field.value]}
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) => field.onChange(e.target.value)}
                          >
                            {column.meta?.enum?.map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />
                    )}
                    {["array", "json"].includes(column.meta?.type) && (
                      <Controller
                        name={column.accessorKey}
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            isInvalid={
                              typeof field.value !== "object" &&
                              !Array.isArray(field.value) &&
                              field.value !== undefined
                            }
                            errorMessage="Invalid JSON or ARRAY"
                            endContent={typedIcon(column.meta?.type)}
                            defaultValue={JSON.stringify(field.value, null, 2)}
                            type="text"
                            onChange={(e) => {
                              try {
                                field.onChange(JSON.parse(e.target.value));
                              } catch (error) {
                                field.onChange(e.target.value);
                              }
                            }}
                            onClick={() => {
                              if (mode !== "view") return;
                              navigator.clipboard.writeText(
                                JSON.stringify(
                                  getValues(column.accessorKey),
                                  null,
                                  2
                                )
                              );
                              toast.success("Copied to clipboard");
                            }}
                            className={
                              column.enableColumnFilter ? "" : "hidden"
                            }
                            label={column.header}
                            isReadOnly={mode === "view"}
                            isDisabled={
                              column.meta?.input?.disabled && isCreateOrEditMode
                            }
                            isRequired={
                              column.meta?.input?.required && mode !== "filter"
                            }
                          />
                        )}
                      />
                    )}
                  </div>
                </div>
              ))}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onPress={mode === "filter" ? onResetButtonClick : onClose}
            >
              {mode === "filter" ? "Reset" : "Cancel"}
            </Button>
            <Button
              form="addDataForm"
              isDisabled={!isDirty && isCreateOrEditMode}
              type="submit"
              isLoading={updateMutation.isPending || createMutation.isPending}
              color={mode === "delete" ? "danger" : "primary"}
            >
              <p className="first-letter:uppercase">
                {mode && mode === "view" ? "Copy" : mode}
              </p>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <header
        id="controls"
        className="flex gap-2 flex-wrap flex-shrink-0 w-full "
      >
        <Button
          color="primary"
          variant="solid"
          className=" flex-shrink-0"
          size={isMobile ? "lg" : undefined}
          isIconOnly={isMobile}
          isDisabled={getQuery.isRefetching}
          onClick={() => getQuery.refetch()}
          startContent={<Icon icon="material-symbols:refresh-rounded" />}
        >
          {isMobile ? undefined : "Refresh"}
        </Button>

        <Dropdown backdrop="blur">
          <DropdownTrigger>
            <Button
              variant="solid"
              isIconOnly={isMobile}
              color="primary"
              size={isMobile ? "lg" : undefined}
              className=" flex-shrink-0"
              startContent={<Icon icon="material-symbols:view-column" />}
            >
              {isMobile ? undefined : "Columns"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Multiple selection"
            variant="flat"
            color="primary"
            disallowEmptySelection
            closeOnSelect={false}
            selectionMode="multiple"
            selectedKeys={visibleColumnIds}
          >
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide()
              )
              .map((column: any) => {
                return (
                  <DropdownItem
                    onClick={() => column.toggleVisibility()}
                    key={column.id}
                  >
                    <div className=" flex space-x-2 items-center">
                      {typedIcon(column.columnDef.meta?.type)}
                      <div className=" flex items-center gap-2">
                        {column.columnDef.header}
                      </div>
                    </div>
                  </DropdownItem>
                );
              })}
          </DropdownMenu>
        </Dropdown>
        <Button
          onClick={() => {
            setMode("filter");
            // setTargetRow({});
            reset({});
            onOpen();
          }}
          size={isMobile ? "lg" : undefined}
          isIconOnly={isMobile}
          className=" flex-shrink-0 mr-auto"
          color="primary"
          variant={isFilterDirty ? "ghost" : "solid"}
          startContent={<Icon icon="material-symbols:filter-alt" />}
        >
          {isMobile ? undefined : "Filter"}
        </Button>
        <div className=" ml-auto"></div>
        {onDelete && (
          <Button
            className=" flex-shrink-0"
            color="danger"
            size={isMobile ? "lg" : undefined}
            isIconOnly={isMobile}
            variant="solid"
            startContent={<Icon icon="material-symbols:delete" />}
            onClick={onDeleteButtonClick}
            isDisabled={table.getSelectedRowModel().rows.length === 0 || false}
          >
            {isMobile ? undefined : "Delete"}
          </Button>
        )}
        {onCreate && (
          <Button
            color="primary"
            className=" flex-shrink-0"
            isIconOnly={isMobile}
            size={isMobile ? "lg" : undefined}
            variant="solid"
            startContent={<Icon icon="material-symbols:add" />}
            onClick={onCreateButtonClick}
          >
            {isMobile ? undefined : "Create"}
          </Button>
        )}
      </header>

      <main id="table" className=" overflow-scroll scrollbar-hide j ">
        {memoizedTable}
      </main>

      <footer
        id="pagination"
        className=" flex justify-between w-full items-center"
      >
        <Pagination
          showControls
          siblings={isMobile ? 0 : 1}
          size={isMobile ? "md" : undefined}
          variant="flat"
          total={table.getPageCount()}
          initialPage={1}
          page={table.getState().pagination.pageIndex + 1}
          onChange={(page) => {
            table.setPageIndex(page - 1);
          }}
        />
        {/* <div id="tips" className="">
          <h1>{`${table.getSelectedRowModel().rows.length} of ${
            table.getState().pagination.pageSize
          } selected`}</h1>
          <h1>Total {total} rows</h1>
        </div> */}
        <Dropdown backdrop="blur">
          <DropdownTrigger>
            <Button variant="flat" className="">
              {table.getState().pagination.pageSize} of
              {total}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="pageSize"
            variant="solid"
            color="primary"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={[table.getState().pagination.pageSize]}
          >
            {[5, 10, 20, 50, 100].map((pageSize) => {
              return (
                <DropdownItem
                  key={pageSize}
                  onClick={() => table.setPageSize(pageSize)}
                >
                  {pageSize}
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </Dropdown>
      </footer>
    </div>
  );
}
