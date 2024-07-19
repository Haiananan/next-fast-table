import React from "react";
import {
  cn,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableColumn,
  Spinner,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { flexRender } from "@tanstack/react-table";
import { Icon } from "@iconify/react";

export function MyTableBody({
  table,
  getQuery,
  setMode,
  reset,
  onOpen,
  hideDelete,
  hideEdit,
}) {
  const iconClasses =
    "text-xl text-default-500 pointer-events-none flex-shrink-0";

  return (
    <Table
      color="primary"
      selectionMode="multiple"
      isStriped
      isHeaderSticky
      isVirtualized
      onSelectionChange={(value) => {
        if (value === "all") return table.toggleAllRowsSelected();
        table.setRowSelection(
          Array.from(value).reduce((acc, cur) => ({ ...acc, [+cur]: true }), {})
        );
      }}
      aria-label="data-table"
      selectedKeys={table.getSelectedRowModel().rows.map((row) => row.id)}
      sortDescriptor={{
        column: table.getState().sorting[0]?.id,
        direction: table.getState().sorting[0]?.desc
          ? "descending"
          : "ascending",
      }}
      onSortChange={({ column, direction }) => {
        table.getColumn(column as string)?.toggleSorting();
      }}
    >
      <TableHeader>
        {table.getHeaderGroups()[0].headers.map((header) => (
          <TableColumn
            key={header.id}
            allowsSorting={header.column.getCanSort()}
            allowsResizing={header.column.getCanResize()}
          >
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
          </TableColumn>
        ))}
        <TableColumn key="actions">
          <div>actions</div>
        </TableColumn>
      </TableHeader>
      <TableBody
        emptyContent={"No rows to display."}
        isLoading={getQuery.isPending}
        loadingContent={<Spinner />}
        items={table.getRowModel().rows}
      >
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
            <TableCell id="actions-cell">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat" color="primary">
                    Actions
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  variant="faded"
                  aria-label="Dropdown menu with icons"
                >
                  {!hideEdit &&
                    ((
                      <DropdownItem
                        key="edit"
                        color="primary"
                        variant="flat"
                        startContent={
                          <Icon
                            icon="material-symbols:edit-square"
                            className={iconClasses}
                          />
                        }
                        onPress={() => {
                          setMode("edit");
                          reset(row.original as any);
                          onOpen();
                        }}
                      >
                        Edit
                      </DropdownItem>
                    ) as any)}
                  <DropdownItem
                    key="view"
                    color="primary"
                    variant="flat"
                    startContent={
                      <Icon icon="solar:eye-bold" className={iconClasses} />
                    }
                    onClick={() => {
                      setMode("view");
                      reset(row.original as any);
                      onOpen();
                    }}
                  >
                    View
                  </DropdownItem>
                  {!hideDelete && (
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      variant="flat"
                      color="danger"
                      startContent={
                        <Icon
                          icon="carbon:delete"
                          className={cn(iconClasses, "text-danger")}
                        />
                      }
                      onClick={() => {
                        setMode("delete");
                        reset(row.original as any);
                        onOpen();
                      }}
                    >
                      Delete
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
