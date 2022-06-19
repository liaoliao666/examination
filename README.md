xmind 记账

## 运行

首先，你需要配置 `.env` 文件中你的数据库地址 `DATABASE_URL`, 如下

```bash
# 未更改
DATABASE_URL="postgresql://arthur:@localhost:5432/bill?schema=public"

# 更改后
DATABASE_URL="postgresql://yourname:@localhost:5432/bill?schema=public"

```

推荐使用 `postgresql` 作为你的数据库, 如果没有安装该数据库, 推荐下载 [postgresapp](https://postgresapp.com/)

最后

```bash
# 安装依赖
yarn install

# 自动创建表在数据库中
npx prisma db push

# 运行
yarn dev
```

最后在你的浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 思考过程

### 需求分析

一个简易的记账本应用程序，数据库涉及到账单表和账单分类表，后端功能涉及根据查询条件查询账单并汇总收入及支出，对账单表的增删改查。前端则是对账单表增删改查的页面

### 选择纯前端实现还是前后端分离的方式

由于涉及到汇总数据，及排序等复杂情况。在数据量特别大时前端肯定 cover 不住，所以选择前后端分离的方式

### 后端技术选型

- 数据库: `postgresql`
- orm 库: `prisma`

### 前端技术选型

- UI 库选型: 由于只是一个页面，所以不想引入太过重的 UI 库，所以放弃了 `antd` `material-ui` 等 UI 库。只使用了 `tailwindcss` 实现，支持暗黑模式
- form 表单: `react-hook-form`
- table 表格: `react-table`
- 请求库: `fetch`
- 框架: `nextjs`。目前账单页支持了 `SSG` 渲染。
- 校验库: `yup`
- 工具库 `lodash-es`

### 遇到的问题

- 原生选择组件没有多选的功能，最终采用了社区流行的 `react-select` 来解决这个问题，但又花了很多时间来重设他的默认样式以和当前 `tailwindcss` 显得不那么突兀
- 选用的 `react-table` 如何和 `react-hook-form` 相结合，例如当改变 table 状态时不重置当前页数为第一页，而当改变搜索栏的条件时需重置到第一页。这也花了不少时间。
