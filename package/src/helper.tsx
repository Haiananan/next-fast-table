import { Icon } from "@iconify/react";
import React from "react";
import JSONPretty from "react-json-pretty";
import "react-json-pretty/themes/monikai.css";
import { UAParser } from "ua-parser-js";
import { Image } from "@nextui-org/image";
import { Chip } from "@nextui-org/chip";
import { Button } from "@nextui-org/button";
import { Spacer } from "@nextui-org/spacer";
import { Tooltip } from "@nextui-org/tooltip";
import { Link } from "@nextui-org/link";

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
export function typedIcon(type: string) {
  const iconType = iconMap[type] || "default-icon";
  return <Icon icon={iconType} />;
}
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

function typedCell(type: string, cell: any) {
  if (type === "number") {
    return cell ? <span>{+cell.toString()}</span> : <span>N/A</span>;
  }
  if (type === "date") {
    return cell ? (
      <span className="">{new Date(cell).toLocaleDateString()}</span>
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

  if (type === "enum") {
    const specialStates = {
      success: [
        "succeeded",
        "successed",
        "done",
        "completed",
        "finish",
        "finished",
        "success",
        "pass",
        "passed",
        "approve",
        "approved",
        "accept",
        "accepted",
      ],
      warning: [
        "waiting",
        "warning",
        "warn",
        "pending",
        "hold",
        "holded",
        "holdup",
        "holduped",
        "delay",
        "delayed",
        "process",
        "processing",
      ],
      danger: [
        "fail",
        "failed",
        "failure",
        "canceled",
        "cancelled",
        "reject",
        "rejected",
        "deny",
        "denied",
        "refuse",
        "refused",
        "block",
        "blocked",
        "stop",
        "stopped",
        "halt",
        "halted",
        "pause",
        "paused",
        "suspend",
        "suspended",
        "inactive",
        "invalid",
        "illegal",
        "unauthorized",
        "forbidden",
        "notallowed",
      ],
    };

    let color = "default";
    for (const state in specialStates) {
      if (specialStates[state].includes(cell)) {
        color = state;
        break;
      }
    }

    return (
      <Chip variant="flat" color={color as any}>
        {cell}
      </Chip>
    );
  }

  return (
    <div className=" max-w-xl text-wrap line-clamp-3 overflow-hidden">
      {cell}
    </div>
  );
}

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

function helper(metaType: string, hconfig = {}) {
  /**
   * @param key - Column identifier used to access data
   * @example key: "id" "amount" "profile.name" "a.b.c.d.e"
   * @param config - Configuration options
   * @example config: { label: "UID", input: { required: true }, render: ({ cell, row }) => <div>{cell}</div> }
   */
  return (key: string, config: HelperConfig = hconfig) => {
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
const uaParser = new UAParser();

export const Fields = {
  string: helper("string"),
  number: helper("number"),
  boolean: helper("boolean"),
  date: helper("date"),
  array: helper("array"),
  json: helper("json"),
  longtext: helper("longtext"),
  enum: helper("enum"),
  ua: helper("string", {
    render: ({ cell }) => {
      const parser = new UAParser();
      parser.setUA(cell);
      const result = parser.getResult();

      const browserIcon =
        {
          Chrome: "teenyicons:chrome-solid",
          Firefox: "ri:firefox-fill",
          Safari: "fa6-brands:safari",
          "Mobile Safari": "fa6-brands:safari",
          Edge: "mdi:microsoft-edge",
          Opera: "mdi:opera",
          "Internet Explorer": "mdi:internet-explorer",
        }[result.browser.name as any] || "mdi:web";

      const osIcon =
        {
          Windows: "mdi:microsoft-windows",
          "Mac OS": "mdi:apple",
          iOS: "mdi:apple",
          Android: "mdi:android",
          Linux: "mdi:linux",
          Ubuntu: "cib:ubuntu",
        }[result.os.name as any] || "mingcute:device-fill";

      return (
        <div className="flex ">
          <Chip
            startContent={<Icon icon={osIcon}></Icon>}
            color="primary"
            variant="flat"
          >
            {result.os.name} {result.os.version ? result.os.version : ""}
          </Chip>
          <Spacer x={1}></Spacer>
          <Chip
            startContent={<Icon icon={browserIcon}></Icon>}
            color="secondary"
            variant="flat"
          >
            {result.browser.name}{" "}
            {result.browser.version ? result.browser.version : ""}
          </Chip>
        </div>
      );
    },
  }),
  image: helper("string", {
    render: ({ cell }) => (
      <div className="flex justify-center  max-w-[50px] aspect-square rounded-xl overflow-hidden ">
        <Image
          src={cell}
          alt="image"
          width={50}
          isZoomed
          height={50}
          className="rounded-xl"
          onClick={() => {
            // open image in new tab
            window.open(cell, "_blank");
          }}
        />
      </div>
    ),
  }),
  email: helper("string", {
    render: ({ cell }) => (
      <Link showAnchorIcon href={`mailto:${cell}`}>
        {cell}
      </Link>
    ),
  }),
  tag: helper("string", {
    render: ({ cell }) => (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
        {cell}
      </span>
    ),
  }),
  link: helper("string", {
    render: ({ cell }) => (
      <Link
        showAnchorIcon
        className=" max-w-sm overflow-hidden text-ellipsis line-clamp-2"
        href={cell}
      >
        {cell}
      </Link>
    ),
  }),
  ip: helper("string", {
    render: ({ cell }) => <Chip variant="bordered">{cell}</Chip>,
  }),
};
