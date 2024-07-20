# NEXT-FAST-TABLE

🦄NEXT-FAST-TABLE 是一个原子化的，基于 Nextjs 的，开箱即用的后台管理应用前端表单组件。

![Image](./public/image.png)

[Engligh](./README.md) | [中文](./README.cn.md)

![npm](https://img.shields.io/npm/v/next-fast-table)
![GitHub](https://img.shields.io/github/license/Haiananan/next-fast-table)
![npm](https://img.shields.io/npm/dm/next-fast-table)

## 目录

1. [介绍](#介绍)
2. [功能特点](#功能特点)
3. [在线演示](#在线演示)
4. [安装](#安装)
5. [快速开始](#快速开始)
   - [创建 API 程序](#创建-api-程序)
   - [定义列并在页面中使用](#定义列并在页面中使用)
6. [配置选项](#配置选项)
   - [HelperConfig](#helperconfig)
   - [TableConfig](#tableconfig)
7. [类型](#类型)
8. [完整案例](#完整案例)
9. [为什么选择 NEXT-FAST-TABLE](#开发动机)
10. [贡献和支持](#贡献和支持)
11. [License](#license)

## 介绍

**NEXT-FAST-TABLE** 是一个强大且高效的表格组件，专为使用 Next.js 的开发者设计。它简化了复杂数据展示的过程，使您能够在一分钟内快速创建和集成表格到您的应用程序中。

作为独立开发者, 你可以像是调用库一样快速创建一个可用的后台管理框架，包含了常见的增删改查等常规行为以及过滤、导出等常见需求。通过 NEXT-FAST-TABLE, 你可以把精力更多的放在核心的业务上而不是后台管理上。这个工具能够让`独立开发者`(尤其是 Nextjs 开发者)在`数分钟内`(而不是数小时)`开发并上线`一个可用的`后台管理`MVP

## 功能特点

- **🔥 易于使用**：利用 Server Action，无需定义接口，直接处理数据。当然，也可以使用 fetch 请求。
- **⭐️ 预设丰富**：只需调用 Fields.string()等方法，即可生成表单
- **🔧 高度可定制**：支持多种配置选项和样式自定义，满足不同应用场景的需求。
- **📱 响应式设计**：自动适配各种屏幕尺寸，提供最佳用户体验。
- **⚙️ 高级数据处理**：内置排序、筛选、分页、模糊搜索等功能，一键实现。
- **📊 数据种类齐全**：支持多种数据类型，包括文本、数字、日期、图片等。此外，还支持 JSON 和 Array

## 在线演示

<a href="https://next-fast-table.vercel.app" target="_blank" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 5px; font-size: 12px; font-weight: bold;">
  DEMO
</a>

## 安装

使用你喜欢的包管理器轻松安装 NEXT-FAST-TABLE：

```bash
npm install next-fast-table
```

或

```bash
yarn add next-fast-table
```

或

```bash
pnpm install next-fast-table
```

## 快速开始

以下是一个简单的示例，展示如何在 Next.js 应用中使用 NEXT-FAST-TABLE

> 注意：这只是一个最小示例，实际应用中，您可以参考本项目的完整案例。

### 创建 API 程序

```typescript
"use server";
import {
  FetchParams,
  CreateParams,
  DeleteParams,
  UpdateParams,
} from "next-fast-table";

// 模拟数据库
let payments = [
  {
    id: 1,
    username: "John Doe",
    email: "john@example.com",
  },
  {
    id: 2,
    username: "Jane Smith",
    email: "jane@example.com",
  },
  {
    id: 3,
    username: "Alice",
    email: "alice@example.com",
  },
];

type Payment = {
  id: number;
  username: string;
  email: string;
};

// 获取数据
export async function onFetch(obj: FetchParams) {
  const pageSize = obj.pagination?.pageSize ?? 10;
  const pageIndex = obj.pagination?.pageIndex ?? 0;

  // 模拟排序
  const sortedPayments = payments.sort((a, b) => {
    if (!obj.sorting || obj.sorting.length === 0) return 0;
    const sort = obj.sorting[0];
    const multiplier = sort.desc ? -1 : 1;
    if (a[sort.id] < b[sort.id]) return -1 * multiplier;
    if (a[sort.id] > b[sort.id]) return 1 * multiplier;
    return 0;
  });

  // 模拟过滤
  const filteredPayments = sortedPayments.filter((payment) => {
    if (!obj.columnFilters || obj.columnFilters.length === 0) return true;
    return obj.columnFilters.every((filter) => {
      if (
        typeof filter.value === "number" ||
        typeof filter.value === "boolean"
      ) {
        return payment[filter.id] === filter.value;
      } else if (typeof filter.value === "string") {
        return payment[filter.id].includes(filter.value);
      }
      return false;
    });
  });

  const total = filteredPayments.length;
  const list = filteredPayments.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  return {
    list,
    total,
  };
}

// 创建数据
export async function onCreate(data: CreateParams<Payment>) {
  payments.push(data as any);
}

// 删除数据
export async function onDelete(data: DeleteParams<number>) {
  const idsToDelete = [data].flat().map((d) => d.id);
  payments = payments.filter((payment) => !idsToDelete.includes(payment.id));
}

// 更新数据
export async function onUpdate(data: UpdateParams<Payment>) {
  payments = payments.map((payment) =>
    payment.id === data.id ? { ...payment, ...data } : payment
  );
}
```

### 定义列并在页面中使用

```typescript
"use client";
import { NextFastTable, Fields } from "next-fast-table";
import { onCreate, onDelete, onFetch, onUpdate } from "YourAPIFile";

export default function DemoPage() {
  const field = Fields;

  const columns = [
    field.number("id"),
    field.string("username"),
    field.email("email"),
  ];

  return (
    <NextFastTable
      columns={columns}
      onFetch={onFetch}
      onDelete={onDelete}
      onCreate={onCreate}
      onUpdate={onUpdate}
    />
  );
}
```

## HelperConfig

这是一个用于控制前端表格渲染的配置选项。它提供了多种选项来控制表格的行为和数据操作。

### 配置选项

- **input**
  - `disabled`: 在编辑模式下（包括创建和编辑）输入是否禁用。默认值为 `false`。
  - `required`: 在编辑模式下输入是否必填，参与表单验证。默认值为 `false`。
- **list**
  - `hidden`: 列是否默认隐藏。如果为 `true`，则默认不显示，但可以通过列设置显示。默认值为 `false`。
- **其他选项**
  - `label`: 列的标签或别名。默认值为 `undefined`。
  - `enableHiding`: 是否允许隐藏。如果为 `false`，则不显示隐藏按钮。默认值为 `true`。
  - `enableSorting`: 是否允许排序。如果为 `false`，则不显示排序按钮。默认值为 `true`。
  - `enableColumnFilter`: 列是否参与列过滤。如果为 `false`，则不显示在列过滤中。默认值为 `true`。
  - `enum`: 枚举值，仅在使用 `field.enum` 时有效。默认值为 `[]`。
  - `render`: 用于在显示状态下自定义渲染的自定义渲染函数。
    - 参数:
      - `cell`: 单元格的值。
      - `row`: 行数据。
    - 返回值: 用于渲染的 JSX 元素或字符串。

## TableConfig

`TableConfig` 是 NextFastTable 组件的传参类型，其中 `columns` 和 `onFetch` 是必填的。

### 配置选项

- **name**
  - **描述**: 表格的名称，用于生成 `tanstack-query` 的键。
  - **默认值**: `'next-table'`
- **columns**
  - **描述**: 表格的列配置。
  - **必填**: 是
- **onFetch**
  - **描述**: 用于获取表格数据的函数。
  - **参数**:
    - `args`: 包含分页、排序和列过滤器的对象。
  - **返回值**: 一个包含总项目数和数据列表（带 ID）的 Promise。
  - **示例**:
    ```javascript
    async function fetchData({ pagination, sorting, columnFilters }) {
      const data = await fetchDataFromAPI({
        pagination,
        sorting,
        columnFilters,
      });
      const total = await fetchTotalCount();
      return {
        list: data,
        total,
      };
    }
    ```
- **onDelete**
  - **描述**: 用于删除数据的函数。
  - **可选**: 是
  - **参数**:
    - `data`: 要删除的数据，可以是单个 ID 或 ID 数组。
  - **返回值**: 一个在删除完成时解析的 Promise。
  - **示例**:
    ```javascript
    async function deleteData(data) {
      await deleteDataFromAPI(data);
    }
    ```
- **onCreate**
  - **描述**: 用于创建新数据的函数。
  - **可选**: 是
  - **参数**:
    - `data`: 要创建的数据。
  - **返回值**: 一个在创建完成时解析的 Promise。
  - **示例**:
    ```javascript
    async function createData(data) {
      const newData = await createDataInAPI(data);
      return newData;
    }
    ```
- **onUpdate**
  - **描述**: 用于更新现有数据的函数。
  - **可选**: 是
  - **参数**:
    - `data`: 要更新的数据。仅发送 ID 和要更新的字段。
  - **返回值**: 一个在更新完成时解析的 Promise。
  - **示例**:
    ```javascript
    async function updateData(data) {
      const updatedData = await updateDataInAPI(data);
      return updatedData;
    }
    ```

## 类型

```typescript
type DataWithID<T = Record<string, any>> = {
  id: number | string;
} & Partial<T>;

type DataOnlyId<T = number | string> = {
  id: T;
};

export type FetchParams = {
  pagination?: { pageSize: number; pageIndex: number };
  sorting?: { id: string; desc: boolean }[];
  columnFilters?: { id: string; value: any }[];
};

export type DeleteParams<T> = DataOnlyId<T> | DataOnlyId<T>[];

export type UpdateParams<T = Record<string, any>> = DataWithID<T>;

export type CreateParams<T = Record<string, any>> = DataWithID<T>;
```

## 完整案例

本项目是一个最小化的 Next.js 应用，用于演示 NEXT-FAST-TABLE 的基本用法。您可以通过以下步骤在本地运行该项目。该项目使用 postgres 数据库

```bash
git clone https://github.com/Haiananan/next-fast-table.git

npm install
cd package
npm install
cd ..

npx prisma db push
npx prisma db seed
npx prisma generate
npm run dev
```

## WHY NEXT-FAST-TABLE?

### 开发动机

在软件开发中，后台应用开发是一个关键环节，但许多开发者对此感到厌烦。主要原因是后台应用开发通常涉及大量重复的增删改查操作和一些细小的特殊逻辑，这些重复性工作让人感觉浪费时间和精力。

我们可以将 UI 需求抽象成一个个设计组件，为什么不将后台需求也抽象成一个开箱即用的库呢？这样不仅能减少重复劳动，还能提高开发效率，使开发者专注于更具创造性的任务。

#### 减法永远比加法难

目前市场上有很多现成的、完整的 admin 应用模板，这些应用提供了一整套技术栈，开发者只需运行命令就可以启动，并根据需求进行调整。然而，这些系统真的好用吗？面对一个完整的、庞大的系统，很多人感到手足无措，需要花费大量时间学习文档和阅读源码。很多初学者会认为这是自身能力的问题，但事实上，这并不是开发者自身的问题。

做减法永远比做加法难。市面上大多数系统都是完整的应用，需要开发者做减法来适应自己的需求。然而，当需求超出预设框架时，这些系统会导致大量技术负债。技术负债往往源于系统前期和后期设计目的的不同。现成的系统无法完全匹配二次开发的需求，因此许多开发者不愿意进行二次开发，最终可能面临重构甚至推倒重来的情况。

NEXT-FAST-TABLE 的设计旨在打破传统 xx-admin 系统上手难、开发难、学习成本高、上限低的困境。与现成系统不同，NEXT-FAST-TABLE 更定位于一个工具库，提供现成工具快速构建出一个开箱即用的后台管理平台前端项目。作为工具库，NEXT-FAST-TABLE 可以无缝嵌入现有前端项目中，学习成本也更加平滑。渐进式的开发体验让人更容易上手。

相比于做减法的困难，NEXT-FAST-TABLE 引导开发者做加法。在做加法的过程中，很多重复的工作已经由 NEXT-FAST-TABLE 完成，业务开发者只需专注于自己的业务需求。这样不仅提高了开发效率，也减少了技术负债，真正实现了灵活和高效的开发体验。

#### 有的时候，有比好重要

没有它之前，劳累数天的独立开发者为了更好的审查自己项目的数据信息，常常会搭建一套包含大量 CRUD 操作的后台管理面板，也许对接了 Mongodb,Postgres,Mysql，后端也许使用 Express,Nestjs?前端可能是 vue,也许是 react?独立开发者往往在项目收尾阶段是最心累的，面对这些低端且繁复的操作，不少开发者望而却步，甚至有些开发者不会选择去写后台管理，而是直接连接数据库工具查看数据库（曾经我也是这样做的）

在使用 NEXT-FAST-TABLE 之后，我可以在 1 分钟（没开玩笑:D）之内对接好一个模型所需的所有基础 CRUD 操作（排序，搜索，过滤，分页，编辑，删除等等）而我只需要细微修改逻辑，剩下的只需要定义列即可。

针对独立开发者，NEXT-FAST-TABLE 能为构建基础后台管理面板节省数小时，让开发者将更多精力投入到开发业务中。与其拿着一套完善且庞大的 admin 项目慢慢修改，不如从 0 开始构建自己需要的东西！有的时候，你只需要这些。不要为概率不大的事件而背负太多的技术负债。这就是一个简单的，纯粹的，快速的，为独立开发者设身处地着想的后台管理工具组件（不至于再去使用各种数据库工具管理自己的 Saas 了）

#### 原子化

在用一些现成的库的时候往往对面对这样的一个问题。就是其他人做好的工作能不能很好的匹配上自己的需求？如果不匹配怎么办？

而 NEXT-FAST-TABLE 仅仅是一个针对表单的工具库，你可以将他融合进任何已有的系统中，并且自由拼接拓展。因为最繁复的表单 CRUD 内容，它已经帮你搞定了！

### 为什么要基于 Nextjs 开发

在其他的 admin 面板项目中，您不仅要定义各种列数据，还需要为网络请求操作定义很多 API，并且使用 fetch 或 axios 对接。但在 Nextjs 的 Server Actions 加持下，您可以无需对接 API，只需要定义几个函数并传入客户端组件即可工作，而且还拥有 Typescript 类型提示。当您的业务数据结构发生改变时，您只需修改列定义和相关函数，这一般会在一分钟内搞定！

### 只能使用 Server Action 吗？

不是的。你可以使用任何方式（axios,fetch...）获取数据，只要保证以规定结构返回即可。如果请求失败，需要抛出一个错误。

### 只能在 Nextjs 中使用吗？

不是的。NEXT-FAST-TABLE 是一个独立的组件，可以在任何 React 项目中使用。但是，由于它使用了 Server Action，所以在其他框架中使用时，需要自行实现数据获取。

### 为什么使用 NextUI 而不是其他 UI 库？

NextUI 是一个优秀的 UI 库，提供了丰富的组件和主题，可以快速搭建页面。本项目重点关注全栈开发者的使用体验，并且提供了十分优秀的触摸反馈，适合移动端使用。我们关注于简单且极致的操作体验，而 NextUI 正是我们所需要的。不少组件库追求大而全，但忽略了细节上的打磨，比如按压触摸反馈，动画效果等。因为 NEXT-FAST-TABLE 是一个简单的快速的后端面板工具组件，所以小而美的精致 UI 是它更加需要的。

### 谁适合使用它

1. 想在几分钟内搭建可用数据面板的个人开发者
2. 搭建 DEMO 或各种 MVP 服务的个人开发者或团队
3. Nextjs 个人开发者

## 贡献和支持

欢迎贡献代码和提交问题。您可以在 [GitHub 仓库](https://github.com/Haiananan/next-fast-table) 提交 Pull Request 或 Issue。

本地运行项目：

```bash
git clone https://github.com/Haiananan/next-fast-table.git
pnpm install
cd package
pnpm install
cd ..
pnpm dev
```

打包：

```bash
cd package
pnpm build
```

## License

本项目使用 MIT 许可证。请查看 [LICENSE](./LICENSE) 文件获取更多信息。
