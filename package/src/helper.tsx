
import { Icon } from "@iconify/react";
import React from "react";
import { Button, Tooltip } from "@nextui-org/react";
import JSONPretty from "react-json-pretty";
import "react-json-pretty/themes/monikai.css";

export function parseDateRange(obj: any) {
  try {
    // 解析 JSON 字符串为对象
    const dateRange = obj;

    // 提取 start 和 end 日期对象
    const start = dateRange.start;
    const end = dateRange.end;

    // 将 JSON 日期对象转换为 JavaScript Date 对象
    const fromDate = new Date(
      start.year,
      start.month - 1, // month is 0-indexed in JavaScript Date
      start.day
    );
    const toDate = new Date(
      end.year,
      end.month - 1, // month is 0-indexed in JavaScript Date
      end.day
    );

    // 返回结果对象
    return {
      from: fromDate,
      to: toDate,
    };
  } catch (error) {
    console.error("Invalid JSON string:", error);
    return {
      from: new Date(),
      to: new Date(),
    };
  }
}
export const typedIcon = (type: string) => {
  const iconType = iconMap[type] || "default-icon";
  return <Icon icon={iconType} />;
};
const iconMap = {
  string: "material-symbols:text-fields-rounded",
  number: "f7:number",
  date: "material-symbols:date-range",
  boolean: "oui:token-boolean",
  array: "material-symbols:list-alt",
  json: "material-symbols:code",
  longtext: "material-symbols:article",
  enum: "material-symbols:label",
};

const typedCell = (type: string, cell: any) => {
  if (type === "date") {
    return cell ? (
      <span>{new Date(cell).toLocaleDateString()}</span>
    ) : (
      <span>N/A</span>
    );
  }

  if (type === "boolean") {
    return (
      <span>
        {cell ? (
          <Icon
            icon="material-symbols:check-rounded"
            className=" text-xl text-success"
          />
        ) : (
          <Icon
            icon="material-symbols:close-rounded"
            className=" text-xl text-danger"
          />
        )}
      </span>
    );
  }

  if (type === "array" || type === "json") {
    return (
      <Tooltip
        content={
          <code className=" p-2">
            <JSONPretty
              mainStyle="background:transparent"
              data={cell}
            ></JSONPretty>
          </code>
        }
      >
        <Button size="sm" variant="light">
          {Array.isArray(cell) ? `Array(${cell.length})` : `Object`}
        </Button>
      </Tooltip>
    );
  }

  return cell;
};

/**
 * Configuration options for helper functions.
 */
interface HelperConfig {
  /**
   * Configuration for the input state.
   */
  input?: {
    /**
     * Whether the input is disabled in edit mode, including both creation and editing.
     */
    disabled?: boolean;
    /**
     * Whether the input is required in edit mode, participating in form validation.
     */
    required?: boolean;
  };
  /**
   * Configuration for the display state.
   */
  list?: {
    /**
     * Whether the column is hidden by default. If true, it will not be displayed by default, but can be shown through column settings.
     */
    hidden?: boolean;
  };
  /**
   * The label or alias for the column.
   */
  label?: string;
  /**
   * Whether hiding is allowed. If false, the hide button will not be displayed.
   */
  enableHiding?: boolean;
  /**
   * Whether sorting is allowed. If false, the sort button will not be displayed.
   */
  enableSorting?: boolean;
  /**
   * Whether the column participates in column filtering. If false, it will not be displayed in the column filter.
   */
  enableColumnFilter?: boolean;
  /**
   * Enumeration values, only effective when using `field.enum`.
   */
  enum?: string[];
  /**
   * Custom render function for custom rendering in display state.
   * @param cell - The cell value.
   * @param row - The row data.
   * @returns A JSX element or string for rendering.
   */
  render?: ({ cell, row }: { cell: any; row: any }) => JSX.Element | string;
}

function helper(metaType: string) {
  /**
   * @param key - Column identifier used to access data
   * @example key: "id" "amount" "profile.name" "a.b.c.d.e"
   * @param config - Configuration options
   * @example config: { label: "UID", input: { required: true }, render: ({ cell, row }) => <div>{cell}</div> }
   */
  return (key: string, config: HelperConfig = {}) => {
    return {
      meta: {
        type: metaType,
        input: {
          disabled: config.input?.disabled ?? false,
          required: config.input?.required ?? false,
        },
        list: {
          hidden: config.list?.hidden ?? false,
        },
        enum: config.enum ?? [],
      },
      accessorKey: key,
      header: config.label ?? key,
      enableHiding: config.enableHiding ?? true,
      enableSorting: config.enableSorting ?? true,
      enableColumnFilter: config.enableColumnFilter ?? true,
      cell: ({ cell, row }) => {
        return config.render
          ? config.render({ cell: cell.getValue(), row: row.original })
          : typedCell(metaType, cell.getValue());
      },
    };
  };
}

export const Fields = {
  string: helper("string"),
  number: helper("number"),
  boolean: helper("boolean"),
  date: helper("date"),
  array: helper("array"),
  json: helper("json"),
  longtext: helper("longtext"),
  enum: helper("enum"),
};
// const paymentHelper = createHelper<Payment>();
// export const columns = [
//   paymentHelper.string("id", {
//     label: "IIDD",
//     edit: {
//       required: true,
//       disabled: true,
//       hidden: false,
//     },
//     render({ cell, row }) {
//       return <div>{cell}</div>;
//     },
//   }),
// ];
