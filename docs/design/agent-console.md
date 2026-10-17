# g2rain-agent-app 开发指导

> 状态：设计稿（待确认）｜适用范围：`g2rain-agent-app`｜关联后端：`g2rain-model-nexus`、`g2rain-mcp-registry`、`g2rain-agent-studio`、`g2rain-agent-runtime`
>
> 配套需求文档：[功能需求](../requirements/20261014-agent-console.md)（菜单、页面、功能、接口、布局）。本文说明怎么做。
>
> 本文基于各服务 `scripts/*.sql`、Controller/Api 接口与当前生成代码整理，用于把「按表生成的 CRUD 页」改造成面向运营方与租户的智能体控制台。实现前仍需遵守 [Views 规范](../development/views-conventions.md)、[代码规范](../development/code-conventions.md) 与 [完成定义](../development/definition-of-done.md)。

## 目录

1. [定位与原则](#1-定位与原则)
2. [后端能力盘点](#2-后端能力盘点)
3. [嵌入模式约定](#3-嵌入模式约定)
4. [布局与视觉规范](#4-布局与视觉规范)
5. [架构约束](#5-架构约束)
6. [公共组件](#6-公共组件)
7. [依赖选型](#7-依赖选型)
8. [生成代码改造清单](#8-生成代码改造清单)
9. [后端缺口](#9-后端缺口)
10. [目录结构](#10-目录结构)
11. [开发分期](#11-开发分期)
12. [待确认事项](#12-待确认事项)
13. [附录 A 样例数据观察](#附录-a-样例数据观察)

---

## 1. 定位与原则

agent-app 是智能体的**配置台 + 观测台**：

| 域 | 服务 | 网关前缀 | 性质 |
|---|---|---|---|
| 模型 | g2rain-model-nexus | `/model` | 配置 |
| 工具 | g2rain-mcp-registry | 待确认（建议 `/mcp`） | 配置 |
| 智能体 | g2rain-agent-studio | `/studio` | 配置 |
| 运行 | g2rain-agent-runtime | `/harness` | 只读观测 |

> 前缀 `/model`、`/studio`、`/harness` 取自 `g2rain-chat-shell/src/views/chat/api.ts` 的现有调用。

设计原则：

- **按业务对象组织页面，不按表组织。** 绑定表（`agent_skill_binding`、`skill_tool_binding`）、运行明细表（`task_graph_node/edge`、`tool_call_record` 等）不单独出菜单，作为主对象详情里的 Tab 或抽屉出现。
- **公共资源只读，私有资源可写。** 运营方维护公共资源（模型目录中的广场模型、平台工具、PLATFORM 智能体）；租户引用公共资源，维护自己的私有资源。
- **智能体菜单按供给来源平级拆分。** 一级「智能体管理」下：「自建智能体」（`CUSTOM`，`/agent_profile/custom`）与「平台智能体」（`PLATFORM`，`/agent_profile/platform`，IAM 授运营方）。详情工作台叫「智能体配置」，不要当菜单名。复制/安装副本归「智能体模板」，不挂在平台智能体上。
- **菜单顺序即配置习惯。** 侧栏与 IAM 挂载顺序固定为：模型 → 工具（先接入、再工具）→ 智能体 → 会话；只使用模型可停在模型配置。细则见[需求第 5.1 节](../requirements/20261014-agent-console.md#51-配置习惯与菜单顺序)。
- **runtime 只读。** 观测页不出现新增、编辑、删除按钮。
- **长文本、结构化字段用专用编辑器。** Markdown 字段用 `MarkdownEditor`，JSON 字段用 `JsonEditor`，不用单行 `el-input`。
- **国际化。** 所有用户可见文案走 `$t(key, fallback)`，页面跟随所选语言切换。
- **租户隔离靠框架。** `organ_id` 由 MyBatis 拦截器注入，前端表单、查询条件、表格列都不展示 `organId`。

---

## 2. 后端能力盘点

所有业务表都带 `create_time / update_time / version`，配置表另带 `delete_flag`。生成的标准接口是 `GET /list`、`GET /page`、`POST /save`、`DELETE /{id}`。**不存在 `GET /{id}`**，生成的 `getById` 需要删除，详情从列表行或 `list?id=` 取。

### 2.1 model-nexus

| 表 | 关键字段 | 说明 |
|---|---|---|
| `model_service_catalog` 模型目录 | `model_name`、`model_type[LLM, VECTOR, RERANK]`、`resource_type[MARKET, CUSTOM]`、`provider`、`protocol[OPENAI, ANTHROPIC, GEMINI]`、`base_url`、`api_key`、`status` | 共享表，**不带 `organ_id`**。MARKET = 广场模型（运营方维护，所有租户可引用）；CUSTOM = 某个租户的私有模型，归属通过引用它的 profile 表达 |
| `model_service_profile` 模型配置 | `organ_id`、`catalog_id`、`temperature`、`top_p`、`max_tokens`、`timeout_ms`、`status` | 私有表，租户的模型入口。引用广场模型 = 关联 + 属性配置；接入私有模型 = 同时创建一条 CUSTOM 目录和一条配置 |
| `model_usage_record` 用量 | `profile_id`、`catalog_id`、`model_name`、`prompt/completion/total_tokens`、`create_time` | 只读，按 `organ_id + create_time` 建了索引，适合按时间统计 |

「共享表 + 私有表」的数据关系：

```text
model_service_catalog（共享，无 organ_id）            model_service_profile（私有，organ_id）
├── MARKET  Qwen3.6-27B-bw  ◀──────────────┬──────── 租户 A 的配置（关联 + 参数）
│                                          └──────── 租户 B 的配置（关联 + 参数）
└── CUSTOM  租户 A 自建模型  ◀─────────────────────── 租户 A 的配置（1 : 1，随配置创建和删除）
```

额外接口：

| 接口 | 用途 |
|---|---|
| `GET /model_service_profile/options` | ACTIVE 配置下拉（chat-shell 选模型在用） |
| `GET /model_service_profile/list|page` | 返回 `ModelServiceDetailVO`，已联表带出目录信息 |
| `POST /v1/chat/completions`、`/v1/embeddings`、`/v1/rerank` | OpenAI 兼容调用，可做「连通性测试」 |

### 2.2 mcp-registry

| 表 | 关键字段 | 说明 |
|---|---|---|
| `mcp_external_service` 外部服务 | `code`、`name`、`endpoint`、`context_path`、`resource_type[EXTENSION, CUSTOMER]`、`status` | EXTENSION = 运营方外部系统；CUSTOMER = 租户私有系统 |
| `mcp_tool_profile` 工具档案 | `name`（tools/call 名）、`title`、`resource_type[BUILT_IN, EXTENSION, CUSTOMER]`、`service_code`、`source_id`、`method`、`path`、`openapi_operation(JSON)`、`input_schema(JSON)`、`status`、`description`（给 LLM） | BUILT_IN 的 `service_code` 指向 `basis.service_registry`、`source_id` 指向 `basis.resource_api.id`；其余指向 `mcp_external_service.code` |

三种工具来源：

| 来源 | resource_type | 维护方 | 可见范围 | 当前实现 |
|---|---|---|---|---|
| basis `resource_api` 同步 | BUILT_IN | 运营方 | 全部租户 | `OpenApiDocumentConverter` + `sync_built_in` |
| 运营方外部系统 OpenAPI 导入 | EXTENSION | 运营方 | 全部租户 | `OpenApiDocumentConverter` + 导入预览/确认 |
| 租户私有配置 | CUSTOMER | 租户 | 本租户 | CRUD + 同上导入链路 |

工具命名遵循 `EndpointStrategy`：`{method}_{self|serviceCode}_{contextPath}_{path}`，例如 `get_self_basis_users_id`、`post_crm_orders`。`skill_tool_binding.tool_name` 与 `skill_contract.tools` 的 key 都用这个名字。

### 2.3 agent-studio

| 表 | 关键字段 | 说明 |
|---|---|---|
| `agent_profile` 智能体 | `agent_code`、`agent_name`、`resource_type[PLATFORM, CUSTOM]`、`identity_desc`、`mission_desc`、`boundary_desc`、`style_desc`、`principle_desc`、`status` | 五段画像都是 2000–4000 字长文本 |
| `skill_profile` 技能 | `skill_key`、`skill_name`、`resource_type`、`semantic_desc`、`skill_manual(MEDIUMTEXT, Markdown)`、`skill_contract(JSON)`、`status` | manual 注入 LLM，contract 是 runtime 的确定性约束 |
| `agent_skill_binding` | `agent_id`、`skill_id`、`enabled_flag` | 智能体 ↔ 技能 |
| `skill_tool_binding` | `skill_id`、`tool_name`、`enabled_flag` | 技能 ↔ 工具（即 `toolNames`） |

额外接口（都已按「PLATFORM 不隔离 + CUSTOM 本租户」合并）：

| 接口 | 用途 |
|---|---|
| `GET /agent_profile/active_catalog` | ACTIVE 智能体目录 |
| `GET /agent_profile/options` | ACTIVE 智能体下拉 |
| `GET /agent_profile/{agentId}/resolve` | 单个智能体画像 |
| `GET /agent_profile/{agentId}/skill_digest` | 智能体技能摘要 |
| `GET /agent_profile/{agentId}/capability_bundle` | runtime 实际加载的能力包（技能 + 契约 + 工具），用于「能力预览」 |

只有 `status=ACTIVE` 的技能、`enabled_flag=1` 的绑定会被 runtime 加载。契约规则见 `g2rain-agent-runtime/docs/CONTRACT_SPEC.md`，编写方法见 `SKILL_GUIDE.md`。

### 2.4 agent-runtime

```text
chat_conversation  (conversation_id)                 ← 观测入口
 ├── chat_message  (conversation_id, task_id, node_id, round)
 └── task_instance (conversation_id, task_id, agent_id, status)
      ├── task_graph_node   (task_id, node_id, skill_key, status)
      │    ├── tool_call_record  (task_id, node_id, call_id)
      │    │    └── task_node_payload (payload_id)   超长报文
      │    └── chat_message (node_id, round)         节点中间文字
      ├── task_graph_edge   (from_node_id → to_node_id, NORMAL | DELEGATE)
      ├── task_checkpoint   (FOLLOW_UP | APPROVAL | VERIFY)  每任务至多一条
      └── task_resume_record (REPLY | CONFIRM | REJECT | CANCEL)
```

关键枚举：

| 字段 | 取值 |
|---|---|
| `task_instance.status` | RUNNING、SUSPENDED、SUCCEEDED、FAILED、CANCELED |
| `task_graph_node.status` | PENDING、READY、RUNNING、WAITING_DELEGATE、SUSPENDED、DONE、FAILED、SKIPPED、CANCELLED、TIMEOUT |
| `tool_call_record.call_status` | STARTED、SUCCESS、FAILED、TIMEOUT、CANCELLED、UNKNOWN、UNKNOWN_PRE_CALL |
| `tool_call_record.failure_kind` | NONE、PARAMETER_FAILURE、AUTH_FAILURE、TIMEOUT、RATE_LIMIT、BUSINESS_FAILURE、TRANSPORT_FAILURE、UNKNOWN |
| `tool_call_record.side_effect` | NONE、WRITE |
| `task_checkpoint.type` | FOLLOW_UP、APPROVAL、VERIFY |
| `chat_message.role / message_type` | USER、AGENT / USER_TEXT、AGENT_REPLY |

各表 SelectDto 已支持 `conversationId`、`taskId`、`nodeId`、`status` 等过滤，观测页第一期可直接组合 list 接口完成。runtime 表的 `/save`、`DELETE` 是生成产物，**界面不得暴露**。

---

## 3. 嵌入模式约定

路由由资源页面（`resources.json` → `resource_page`）动态生成，linkPath 是静态字符串，因此嵌入页**用 query 传参**，并登记为页面资源但不挂菜单。嵌入页清单见[需求文档第 6 节](../requirements/20261014-agent-console.md#6-页面清单)。

打开方式：

- **应用内跳转**：从菜单页点击进入，`router.push({ path, query })`。
- **跨应用嵌入**：chat-shell 等宿主以 `initialRoute` 打开，例如聊天窗口的「查看执行过程」打开 `/task_trace?taskId=xxx`。

嵌入模式约定：

- query 带 `embed=1` 时隐藏页头返回按钮与面包屑，内容区撑满容器。
- 参数缺失或查不到数据时显示空状态，不跳转、不报全局错误。
- 嵌入页只读取 query，不依赖上一页的 store 状态，保证从宿主直开可用。
- 页面内跳转保持 `embed` 参数（会话观测 → 会话详情 → 执行追踪）。

---

## 4. 布局与视觉规范

页面布局参考了样例数据的实际规模（见[附录 A](#附录-a-样例数据观察)）：一个会话有 5–9 个任务，一个任务有 1–3 个节点，一个节点最多 9 轮；一个技能绑定 10–18 个工具，一份契约 6–10 KB。所以任务图节点不多、可以完整画出，观测页的重点是**点中节点后把轮次讲清楚**；技能配置的重点是**一个工具一个工具地看契约**，不是在一屏 JSON 里翻找。

### 4.1 四种页面模板

所有页面都从下面四种模板中选，不新造布局。

| 模板 | 用于 | 结构 |
|---|---|---|
| **目录页** Catalog | 模型目录、智能体配置 | 页头 + 分段筛选 + 卡片网格，卡片只放识别信息和一个主操作 |
| **列表页** List | 模型配置、用量统计、服务接入、工具目录、会话观测 | 页头 + 筛选条 + 表格 + 右侧抽屉（新建、编辑、详情都在抽屉中完成，不弹居中对话框） |
| **工作台** Workbench | 智能体详情（技能配置以约 90% 宽度的抽屉嵌在其中） | 对象页头 + 横向 Tab + 内容区，有需要时加右侧检查栏 |
| **追踪页** Trace | 会话详情、执行追踪 | 摘要页头 + 主从布局：会话详情左右分栏（时间线 / 选中任务）；执行追踪上下分区（有向无环图 / 选中节点详情） |

```text
目录页 / 列表页                          工作台                                   追踪页
┌──────────────────────────────┐   ┌──────────────────────────────┐   ┌──────────────────────────────┐
│ 标题            [主操作]      │   │ ← 对象名  徽标 状态   [保存] │   │ ← 摘要  状态  耗时   [刷新]  │
│ [分段] [搜索] [筛选▾]         │   │ 画像 │ 技能 │ 能力预览       │   │ 指标条：步骤 · 调用 · 确认    │
├──────────────────────────────┤   ├────────────────────┬─────────┤   ├───────────┬──────────────────┤
│ 卡片网格 或 表格              │   │ 内容区             │ 检查栏  │   │ 时间线    │ 选中项详情       │
│                              │   │                    │ (可收起)│   │ 步骤列表  │                  │
│                    分页 ›    │   │                    │         │   │           │                  │
└──────────────────────────────┘   └────────────────────┴─────────┘   └───────────┴──────────────────┘
```

### 4.2 页头与筛选

- 页头一行：左边是标题和一句说明（次级文字色），右边最多一个主按钮。批量、导入等次要操作放进主按钮旁的「更多」下拉。
- 筛选条一行：常驻**一个关键字搜索框 + 至多 3 个下拉**（来源、状态、类型）。时间范围等低频条件收进「筛选」弹层，生效后以可关闭的标签显示在筛选条下方。
- 不使用生成代码里罗列全部字段的 `QueryForm`。`QueryForm` 只用来承载 `sorts` 等基础查询参数。
- 筛选条件同步到 URL query，刷新或分享链接后能还原。

### 4.3 表格

- 列按「识别 → 状态 → 关键属性 → 时间」排序；第一列是可点击的主名称，下面一行用次级文字显示编码或 ID。
- 一张表最多 7 列，其余放详情抽屉。不展示 `organId`、`version`、`deleteFlag`。
- 行操作：一个直接显示的主操作（编辑或查看），其他操作放进 `⋯` 下拉，删除放在下拉的最后并标红。
- 点击行打开详情抽屉，进入工作台或追踪页要明确点击名称。
- 长文本截断为一行，悬停显示全文；JSON 字段不进表格。

### 4.4 抽屉

| 场景 | 宽度 | 结构 |
|---|---|---|
| 简单表单（模型、服务、配置） | 560px | 分组表单，底部固定「取消 / 保存」 |
| 详情（工具、工具调用） | 720px | 顶部摘要，下面用 Tab 切换「概要 / 请求 / 响应」 |
| 向导（OpenAPI 导入） | 960px | 顶部步骤条，底部固定「上一步 / 下一步」 |
| 工作区（技能配置） | 约 90% | 页头固定（名称、使用数、保存），下面横向 Tab；内容区独立滚动 |

表单内容改过但未保存时，关闭抽屉要二次确认。

### 4.5 状态、徽标与文字

**状态**统一用「圆点 + 文字」的 `StatusDot`，不用大面积色块；业务状态到语义色与文案的映射由 `runtime/console` 的 `describeStatus` 提供。颜色只有 5 种语义：

| 语义 | 颜色 | 取值 |
|---|---|---|
| 进行中 | 主色 + 呼吸动效 | RUNNING、STARTED、READY、WAITING_DELEGATE |
| 等待用户 | 橙 | SUSPENDED、PENDING（检查点） |
| 成功 | 绿 | SUCCEEDED、DONE、SUCCESS、ACTIVE |
| 失败 | 红 | FAILED、TIMEOUT、UNKNOWN |
| 中止 / 停用 | 灰 | CANCELED、CANCELLED、SKIPPED、INACTIVE |

**来源**用描边小徽标（映射由 `runtime/console` 的 `resourceBadge` 提供），只说明「是谁的」：广场、平台、内置、扩展（公共，蓝灰）；私有、客户（本机构，主色描边）。

**写操作**统一用「写」小标记（橙色描边），出现在工具名、调用记录、契约工具列表里，让人一眼看出哪一步改了数据。

**文字与数值**：

- 业务 ID（32 位 UUID）显示前 8 位，等宽字体，悬停显示全文，点击复制（`CopyText`）。
- 工具名、技能键、路径一律等宽字体。
- 时间：列表显示相对时间（「3 分钟前」），悬停显示绝对时间；追踪页显示 `HH:mm:ss`。
- 耗时：小于 1 秒显示 `ms`，否则显示 `1.2 s`，超过 1 分钟显示 `1 m 05 s`。
- 空值显示 `—`，不显示 `null` 或空白。

### 4.6 间距、加载与空状态

- 8px 栅格：页面内边距 24，区块间距 16，表单项间距 16，卡片内边距 16–20。
- 颜色、圆角、阴影只用 `@g2rain/theme` 的变量，不写死色值，暗色主题自动生效。
- 加载用骨架屏，不用全屏遮罩；按钮提交时只锁定该按钮。
- 每个空状态都要说明下一步：「还没有私有模型，[新增模型]」「这个会话还没有任务」。
- 错误显示在出错的区块内并提供「重试」，不只弹全局提示。

### 4.7 宽度适配

- 内容区最小宽度 1200px。
- 小于 1440px 时，工作台的检查栏收起为右侧按钮，会话详情的右栏收窄为 320px。
- 执行追踪本身是上下布局，图区按容器宽度自动缩放（`fitView`），不受宽度影响。
- 嵌入模式（`embed=1`）下隐藏页头返回按钮；会话详情在容器宽度小于 960px 时切换为上下布局。

---

## 5. 架构约束

本节把 `docs` 中的架构规范落到需求文档中的页面上。规则来源：[层次与目录职责](../architecture/layers.md)、[依赖规则](../architecture/dependencies.md)、[架构偏差](../architecture/deviations.md)、[Views 规范](../development/views-conventions.md)、[代码规范](../development/code-conventions.md)、[Components 与 Platform](../development/components-and-platform.md)、[测试策略](../development/testing.md)、[完成定义](../development/definition-of-done.md)。与规范冲突时以规范为准，并回来修改本文。

### 5.1 分层归属

依赖方向固定为 `views → runtime → platform → components → shared`。新增能力按 [能力迁移判断](../development/components-and-platform.md#能力迁移判断) 归层：

| 能力 | 归属 | 理由 |
|---|---|---|
| 页面、页面 API、DTO / VO | `views/<module>` | 只服务一个页面 |
| 页面私有组件（`ActionTimeline`、`ContractPanel` 等） | `views/<module>/components` | 只服务一个页面，不从全局出口导出 |
| 状态枚举、状态 → 语义色映射、来源徽标映射、内置工具中文名、ID / 耗时格式化 | `runtime/console` | 服务本应用多个页面，带应用语义 |
| `MarkdownEditor`、`MarkdownViewer`、`JsonEditor`、`JsonViewer`、`DagCanvas`、`SecretInput`、`CopyText`、`StatusDot` | `components` | 纯 UI / 交互，无业务语义 |
| 纯函数（拓扑排序、冗余边识别、JSON 大小判断） | `shared` | 无框架、无业务 |
| platform | 不新增 | 本需求没有跨 App 的平台语义 |

### 5.2 依赖禁区

- **components 不读 platform 和业务。** 编辑器的语言、只读状态、诊断信息全部通过 props 传入；`MarkdownEditor` 不直接读 `locale.store`，由页面把当前语言传给它。`DagCanvas` 只接收通用的 `nodes / edges`，节点卡片内容由页面通过插槽渲染，组件里不出现 `task`、`skillKey` 等业务字段。
- **runtime/console 不引用 views。** 它只放常量、映射和格式化函数，不放页面组件，也不调用业务 API；不能借此扩大 [DEV-003](../architecture/deviations.md#dev-003runtime-直接引用-views) 的 runtime → views 依赖。
- **views 之间不深度导入。** 一个页面要复用另一个页面的能力时，由所有者模块用 `index.ts` 暴露公共 API，调用方只从 `index.ts` 导入：

  | 所有者 | 公共 API | 使用方 |
  |---|---|---|
  | `views/mcp_tool` | `McpToolProfileApi`、`ToolPicker` | `agent_detail`（技能配置抽屉） |
  | `views/conversation_detail` | `conversationDetailRoute()`（带 `embed` 参数的路由） | `chat_conversation` |
  | `views/task_trace` | `taskTraceRoute()`（带 `embed` 参数的路由） | `conversation_detail` |

  技能、工具调用不再有独立页面：技能相关 API 与组件归 `views/agent_detail`，工具调用 API 与详情组件归 `views/task_trace`，都只在本模块内使用。

- 路径别名（`@/`、`@runtime`）不改变上述方向，不能用来绕过。
- 不新增 `.js` 文件；cms-app 的 `MarkdownEditor` 是 JS 且写死中文，按 TS 重写，不复制。

### 5.3 页面模块

- 每个页面目录保持 `index.vue + api.ts + type.ts`，需要对外复用时再加 `index.ts`。
- `api.ts` 用 `getHttpClient('default')`，路径带网关前缀；页面组件不拼 Axios 配置，不重复 `api.ts` 已有的转换。
- 类型命名用 `XxxQuery`、`XxxPayload`、`XxxVo`；`state`、`request`、`response` 等 JSON 字段在 `type.ts` 里声明为 `string`，在 `api.ts` 或页面的 composable 中解析为显式类型，不在模板里 `JSON.parse`。
- 每个页面在 `views/route-map.ts` 静态注册；新增或调整 linkPath、权限点后执行 `g2rain-app build-config` 并 Review `resources.json`。
- 权限点只用静态字符串 `v-permission="'agent:edit'"`，动态表达式无法被资源生成器扫描。
- 控制台页面不维护 `mock.ts` / `harness_sample` / `studio_sample`，联调走真实后端。

### 5.4 多实例与生命周期

同一份子应用可能在 chat-shell 的多个 Tab 里同时挂载（按 `instanceId` 隔离），切 Tab 不卸载。

- CodeMirror 的 `EditorView`、bytemd 实例、vue-flow 实例都在组件 `onBeforeUnmount` 中销毁。
- vue-flow 的 `id` 使用组件实例级唯一值，不用固定字符串，避免两个执行追踪 Tab 共用一份图状态。
- 自动刷新的定时器在卸载、任务进入终态、页面不可见（`document.visibilityState`）时停止。
- 不在模块顶层保存页面状态；页面状态都放在组件内或按实例创建的 composable 中。
- 嵌入页只依赖 query 参数，`initialRoute` 直开和应用内跳转结果一致。

### 5.5 体积与加载

[DEV-007](../architecture/deviations.md#dev-007生产构建存在循环分块与体积警告) 记录了主包已超过体积警告阈值，新依赖不能进入主包：

- 编辑器、图、图表组件都用 `defineAsyncComponent` 按需加载，只在用到的页面里引入；`main.ts` 和 `runtime` 不导入它们。
- dagre 布局在图组件内部动态导入。
- 每次引入新依赖后对比 `npm run build` 的 chunk 输出，不能通过调高警告阈值隐藏问题。

### 5.6 国际化与安全

- 模板用 `$t('AGENT_xxx', '默认文案')`，脚本用平台 `t`；枚举文案的 key 统一在 `runtime/console` 中维护。至少用两种语言验证。
- 访问密钥只在表单中以 `SecretInput` 出现，不进入表格、日志和 URL。
- 前端权限只控制体验，所有写操作由后端重新鉴权；运营方专属能力靠 IAM 权限点授予，前端不硬编码运营方判断。
- `tool_call_record.request` 中的敏感值只存 handle，界面原样展示 handle，不尝试还原。

### 5.7 验证

当前仓库只有 `npm run build` 一项自动验证，交付时要区分「构建通过」和「功能已测试」。每个页面至少完成：

- `npm run build` 通过，chunk 体积无明显恶化。
- 独立模式与 qiankun 模式各打开一次；嵌入页从 `initialRoute` 直开一次。
- 两种语言切换无硬编码文案。
- 同一页面在两个 Tab 中同时打开，互不影响，关闭后无残留定时器与监听。
- 按[完成定义](../development/definition-of-done.md)逐项核对；如果新增 Vitest 等测试框架，需要同步 package scripts、文档和 CI。

---

## 6. 公共组件

分层归属见 5.1。components 中的组件只依赖 shared 与第三方库，通过 props、emits、slots 暴露能力，各子模块用 `index.ts` 出口。

| 组件 / 模块 | 层 | 职责 | 关键接口 |
|---|---|---|---|
| `MarkdownEditor` | components | Markdown 编辑 + 预览（GFM、代码高亮） | `v-model`、`locale`、`height`、`maxLength`、`mode: 'split' \| 'tab'`、`readonly` |
| `MarkdownViewer` | components | 只读渲染，用于消息、结论、说明 | `content` |
| `JsonEditor` | components | JSON 编辑：高亮、格式化、折叠、错误定位、外部诊断 | `v-model`（字符串）、`diagnostics`、`height`、`readonly`；事件 `focus-path` |
| `JsonViewer` | components | 只读 JSON：折叠、复制、超过阈值默认收起 | `value`、`collapsedDepth`、`lazyThreshold` |
| `DagCanvas` | components | 有向无环图画布：自动布局、缩放、适应、选中、边高亮 | `nodes`、`edges`、`selectedId`、`direction`；插槽 `#node`；事件 `select` |
| `SecretInput` | components | 密钥输入：掩码显示，编辑时空值表示不修改 | `v-model`、`masked` |
| `CopyText` | components | ID / traceId 等可复制文本，支持截断显示 | `text`、`length` |
| `StatusDot` | components | 圆点 + 文字，只认语义色 | `tone: 'running' \| 'waiting' \| 'success' \| 'danger' \| 'muted'`、`label` |
| `console` | runtime | `Gateway` 网关前缀、业务枚举、`describeStatus(value)`、`actionLabel(name)`、`formatDuration`、`shortId`、`fill`（来源徽标 `resourceBadge` 待模型 / 工具页实现时补充） | 纯 TS，无组件 |
| `ToolCallDetail` | views/task_trace | 工具调用详情抽屉 | `record` |
| `ToolPicker` | views/mcp_tool | 按服务分组选择工具，经 `index.ts` 供技能配置使用 | `v-model`、`excluded` |
| `TaskGraph` | views/task_trace | 把节点、边、检查点转成 `DagCanvas` 数据，渲染节点卡片 | `task`、`nodes`、`edges`、`checkpoints` |
| `NodeDetail`、`ActionTimeline` | views/task_trace | 下区详情；轨迹合并动作、调用、恢复记录并折叠重复动作 | `node`、`calls`、`resumes` |
| `TurnList` | views/conversation_detail | 按轮展示对话，挂载任务卡片 | `messages`、`tasks` |
| `SkillDrawer` | views/agent_detail | 技能配置抽屉：基本信息、操作手册、执行契约、工具 | `skillId`、`agentId`、`readonly` |
| `ContractPanel`、`contract-lint.ts` | views/agent_detail | 契约结构视图与校验规则，诊断结果交给 `JsonEditor` | `contract`、`toolNames` |

说明：

- 业务状态标签不单独做组件：页面调用 `runtime/console` 的 `describeStatus` 得到语义色与文案，再渲染 `StatusDot`。这样 components 不知道任何业务状态枚举。
- 来源徽标同理：`resourceBadge(type)` 返回文案 key 与样式类型，页面用 `el-tag` 渲染。
- 枚举文案优先使用 `infra` 字典（`DictSelect` / `DictText`）；字典未建时由 `runtime/console` 提供本地枚举与 i18n key，后续迁移到字典。

---

## 7. 依赖选型

当前 `package.json` **没有** Markdown、JSON、图编辑相关依赖，需要新增：

| 用途 | 依赖 | 理由 |
|---|---|---|
| Markdown | `bytemd`、`@bytemd/vue-next`、`@bytemd/plugin-gfm`、`@bytemd/plugin-highlight`、`highlight.js` | 与 cms-app 一致，同族应用体验统一 |
| JSON | `codemirror`、`@codemirror/lang-json`、`@codemirror/lint` | CodeMirror 6 原生 TS、体积小；lint 扩展可直接挂契约校验结果；暗色主题可跟随 `@g2rain/theme` |
| 任务图（二期·观测） | `@vue-flow/core`、`@dagrejs/dagre` | Vue 3 原生、TS 类型完整；节点用插槽渲染，dagre 负责从左到右的分层布局 |
| 图表（三期） | `echarts` | 用量趋势；按需引入 |

版本以安装时的稳定版为准并锁入 `package-lock.json`；引入前确认许可证与包体积，并按 5.5 节按需加载。

---

## 8. 生成代码改造清单

| # | 问题 | 改造 |
|---|---|---|
| 1 | `api.ts` 路径无网关前缀，如 `/skill_profile/list` | 按服务加前缀：`/model`、`/studio`、`/harness`、MCP 前缀待确认 |
| 2 | 生成了后端不存在的 `getById` | 删除；详情取列表行或 `list?id=` |
| 3 | 表单、查询、表格展示 `organId` | 全部移除，由框架注入 |
| 4 | 查询表单罗列所有列（含 `skillContract`、`skillManual` 等大字段） | 只保留业务筛选项：名称、编码、状态、来源、时间 |
| 5 | 枚举字段用 `el-input` | 改为 `el-select` / `DictSelect`，回显用 `StatusDot` + `describeStatus`、来源徽标 + `resourceBadge` |
| 6 | 长文本、JSON 字段用单行输入 | 改用 `MarkdownEditor` / `JsonEditor`；表格中截断显示 |
| 7 | 页面标题错误：`定义表`、`数字员工`（实为绑定表）、`绑定表`、`外部服务表`、`暴露档案表` | 按需求文档的菜单名重命名，并改为 i18n key |
| 8 | 中文文案硬编码（标题、label、placeholder、确认框） | 全部 `$t('AGENT_xxx', '默认文案')`；`VITE_I18N_TAGS` 追加本应用 tag |
| 9 | runtime 页面有新增、编辑、删除 | 移除按钮与对应权限点 |
| 10 | 绑定表、技能表、运行明细表独立成页 | 绑定与技能并入智能体详情；运行明细并入会话详情与执行追踪 |
| 11 | `api_key` 明文出现在列表与明细 | 只在表单里以 `SecretInput` 出现；租户侧永远拿不到广场模型的密钥 |
| 12 | 主键 `BIGINT` 映射为 `number` | 与后端确认 ID 是否超过 2^53；超过则改为字符串序列化 |
| 13 | linkPath 为表名 | 按需求文档第 6 节调整后执行 `g2rain-app build-config`，Review `resources.json` 与 `route-map.ts` |

权限点命名沿用 `模块:动作`，完整清单见[需求文档第 8 节](../requirements/20261014-agent-console.md#8-权限点)。

---

## 9. 后端缺口

前端设计依赖以下后端能力，按优先级列出。本文只登记需求，不在本项目实现。

### 9.1 MCP 工具（已定口径，待开发）

**已完成（勿再排期）：** `mcp_external_service` 删服务级联删工具（事务）；`code` 与 `endpoint+contextPath` 两套唯一（EXTENSION 全局 / CUSTOMER 本机构且不撞 EXTENSION）；三工具菜单入口。

**mcp-registry 不认 agent**；隔离靠分类型接口；PLATFORM 禁绑 CUSTOMER 由 **studio 写绑定**校验。OpenAPI / BUILT_IN 文档链路细节见 [openapi-document-and-mcp-tools](../../../../g2rain-server/g2rain-basis/docs/requirements/openapi-document-and-mcp-tools.md)。

| 优先级 | 服务 | 缺口 | 影响 |
|---|---|---|---|
| P0 | mcp-registry | `mcp_tool_profile` 分类型 `built_in` / `extension` / `customer` 的 list、page、save（类型写死）；BUILT_IN、EXTENSION 查询不隔离，CUSTOMER 本机构 | 自有/扩展/客户系统工具；ToolPicker |
| P0 | mcp-registry | `POST /mcp_tool_profile/{id}/status` 启停 | 工具列表 |
| P0 | mcp-registry | 修 `extension/page` 误写成 CUSTOMER | 扩展系统接入 |
| P0 | studio | 写 `skill_tool_binding`：PLATFORM 智能体禁止绑定 CUSTOMER 工具 | 技能 ToolPicker 确认 |
| P0 | agent-app | ToolPicker：3 Tab + 各类型真分页；PLATFORM 仅自有+扩展；勾选跨 Tab 累加；三菜单对接分类型 API | 智能体详情、工具三菜单 |
| P1 | mcp-registry | `POST .../sync_built_in`：读 basis `resource_api` → 写 BUILT_IN（展开只在 mcp） | 自有系统工具 |
| P1 | mcp-registry | OpenAPI `preview`（接口清单，非整份展开文档）+ `confirm` 写入 | 扩展/客户系统工具导入 |
| P1 | basis | `resource_api` 拆分存原始最小 `openapi_document`（不做语义展开）；供 sync 前置 | manager 导入、BUILT_IN 同步 |

### 9.2 其它缺口

| 优先级 | 服务 | 缺口 | 影响页面 |
|---|---|---|---|
| P0 | model-nexus | 配置保存支持「接入私有模型」：一次请求在同一事务中写入 CUSTOM 目录与 profile；删除私有配置时一并删除其目录 | 模型配置 |
| P0 | model-nexus | 私有目录的归属校验：catalog 无 `organ_id`，租户修改 CUSTOM 目录时须校验它被本机构的 profile 引用；租户不得修改 MARKET 目录 | 模型配置 |
| P0 | model-nexus | 目录接口按角色收口：`model_service_catalog` 的写接口与 CUSTOM 查询只对运营方开放；租户只能查询 ACTIVE 的 MARKET 目录，且不返回 `api_key` | 模型目录、模型配置 |
| P0 | model-nexus | VO 明文返回 `api_key`：广场模型对租户不返回，私有模型返回掩码 | 全部模型页 |
| P2 | model-nexus | 广场模型被引用的机构数；私有目录的所属机构（经 profile 关联，运营方跨机构查询） | 模型目录 |
| P0 | studio | 标准 `list` / `page` 只返回本机构数据，租户查不到 PLATFORM 智能体和技能；需按「PLATFORM 不隔离 + 本机构 CUSTOM」合并（`active_catalog`、`capability_bundle` 已是此逻辑） | 智能体配置、智能体详情 |
| P1 | studio | PLATFORM 智能体 / 技能「复制为私有」接口（含绑定复制；技能复制后替换当前智能体的绑定） | 智能体配置、智能体详情 |
| P1 | studio | 新建技能与绑定同事务写入 | 智能体详情 |
| P1 | studio | 公共资源写保护：租户不得修改、删除 PLATFORM 记录 | 智能体配置、智能体详情 |
| P1 | 全部 | 删除被引用记录前的校验（广场模型被配置引用、技能被智能体绑定、工具被技能绑定） | 各列表删除 |
| P2 | runtime | runtime 表的 `/save`、`DELETE` 从对外接口移除或收紧权限 | 安全 |
| P1 | runtime | 检查点恢复后被逻辑删除，list 接口查不到历史；需要支持查询已删除记录，或在 `task_resume_record` 冗余问题文案 | 会话详情、执行追踪 |
| P2 | runtime | 执行追踪聚合接口（节点、边、调用、检查点、恢复记录一次返回），减少前端多次请求 | 执行追踪 |
| P2 | runtime | 会话观测的任务数、失败数统计 | 会话 |
| P2 | runtime | 样例中 `node.state.tokens` 为 0、`chat_message.model` 为空，任务级的模型与 token 消耗无法展示 | 执行追踪 |
| P2 | studio | 技能被几个智能体使用、工具被几个技能使用的统计 | 智能体详情、工具目录 |
| P3 | model-nexus | 用量按天、按模型聚合接口 | 用量统计 |

---

## 10. 目录结构

```text
src/
├── shared/
│   ├── graph.util.ts        # 拓扑排序、冗余边识别（纯函数）
│   └── json-path.util.ts    # 在 JSON 文本中定位路径区间（纯函数）
├── components/
│   ├── markdown/            # MarkdownEditor、MarkdownViewer（bytemd，按需加载）
│   ├── json-editor/         # JsonEditor（CodeMirror 6，按需加载）
│   ├── json-viewer/         # JsonViewer（无第三方依赖）
│   ├── dag-canvas/          # DagCanvas（vue-flow + dagre，按需加载）
│   ├── secret-input/
│   ├── copy-text/
│   ├── status-dot/
│   └── index.ts
├── runtime/
│   └── console/             # 枚举、语义色与徽标映射、内置动作名、格式化
│       └── index.ts
└── views/
    ├── model_service_catalog/   # index.vue + api.ts + type.ts
    ├── model_service_profile/
    │   └── components/      # MarketPicker、CustomModelForm、ParamsForm、TryPanel
    ├── model_usage_record/
    ├── mcp_external_service/
    ├── mcp_tool_profile/
    │   ├── components/      # OpenApiImport
    │   └── index.ts         # 导出 OpenApiImport
    ├── mcp_tool/
    │   ├── components/      # ToolPicker
    │   └── index.ts         # 导出 McpToolProfileApi、ToolPicker
    ├── agent_profile/
    │   └── index.ts         # 导出 AgentProfileApi、类型
    ├── agent_detail/
    │   ├── components/      # ProfileSection、SkillList、SkillAdd、SkillDrawer、ContractPanel、CapabilityPreview
    │   ├── contract.ts      # 契约类型、解析、按 inputSchema 生成骨架
    │   ├── contract-lint.ts # 装载校验与枚举校验，输出带 JSON 路径的问题
    │   └── index.ts         # 导出 agentDetailRoute
    ├── chat_conversation/
    ├── conversation_detail/
    │   ├── components/      # TurnList、TaskSummary
    │   ├── turns.ts         # 消息按轮分组、确认结果语义
    │   └── index.ts         # 导出 conversationDetailRoute
    ├── task_trace/
    │   ├── components/      # TaskGraph、NodeCard、NodeDetail、ActionTimeline、ToolCallDetail
    │   └── index.ts         # 导出 taskTraceRoute
    └── route-map.ts
```

跨页面复用只经所有者模块的 `index.ts`，见 5.2。

---

## 11. 开发分期

| 期 | 范围 | 前置后端 |
|---|---|---|
| 一期·基础 | 第 8 节改造 1–9、11；`runtime/console`；`MarkdownEditor`、`JsonEditor`、`JsonViewer`、`SecretInput`、`CopyText`、`StatusDot` | 网关前缀确认 |
| 一期·配置 | P06、P07；P02 的「从广场选择」 | studio 现有接口即可 |
| 二期·观测 | `DagCanvas`；P08–P10 | runtime 现有 list 接口即可；确认历史依赖 P1 检查点查询 |
| 二期·模型与工具 | P01；P02 的「接入私有模型」；P04、P05 | 第 9 节 P0 |
| 三期 | OpenAPI 导入、平台接口同步、复制为私有、用量图表、概览 | 第 9 节 P1–P3 |

每个页面的验收按需求文档中该页面的验收项与本文 5.7 节执行。

---

## 12. 待确认事项

1. mcp-registry 的网关前缀。
2. 前端如何识别运营方：令牌声明、用户信息接口，还是完全交给 IAM 权限点控制（推荐后者）。
3. chat-shell 打开非菜单页面（`/task_trace?taskId=`）的方式：是否支持以页面资源 + `initialRoute` 直开，还是需要新增打开协议。
4. 原表级页面（`task_graph_node` 等）是否保留为隐藏的运维兜底页，还是直接删除。
5. 模型连通测试请求中 `model` 字段取 `modelName` 还是配置 ID。
6. 同一机构能否对同一个广场模型配置多条（例如不同 temperature 的两套参数）；如果只允许一条，需要后端加唯一约束。
7. 五段画像字段是否按 Markdown 存储（影响注入 LLM 时是否需要转纯文本）。
8. PLATFORM 智能体的「安装副本」与原版本的关系：一次性复制，还是保留来源并支持升级；这与后续的「智能体模板」菜单一起设计。
9. 是否需要跨会话的「运行排查」菜单（按状态查任务、按失败分类查工具调用）；当前只保留会话下钻路径。

---

## 附录 A 样例数据观察

数据来源：`g2rain-agent-runtime/scripts/123.sql`（测试导出）与 `g2rain-agent-studio/scripts/g2rain-agent-studio.sql`（初始数据）。

### A.1 规模

| 对象 | 样例数量 | 对布局的影响 |
|---|---|---|
| 会话 | 3 个；最多 9 个任务、26 条消息 | 会话详情按轮展示，一屏可读 |
| 任务 | 14 个：成功 11、失败 1、取消 1 | 会话详情突出失败与取消的任务，执行追踪默认选中失败节点 |
| 节点 | 每任务 1–3 个；最多 9 轮 | DAG 能完整展示，详情区的执行轨迹是重点 |
| 边 | 5 条，全部 NORMAL，含 1 条冗余边 | 冗余边淡化，可切换只看直接依赖 |
| 工具调用 | 23 次，全部 SUCCESS；13 次空结果 | 「空结果」单独标记，不算失败 |
| 检查点 | 12 个，全部 APPROVAL | 确认记录是观测的固定区块 |
| 技能 | 每个绑定 8–15 个工具，契约 6–10 KB | 契约用结构视图逐个工具查看 |

### A.2 数据关系

- 智能体回复（`AGENT_REPLY`）没有 `node_id`、`round`；审批提示本身也是一条 `AGENT_REPLY`，之后才是结果回复。
- 闲聊轮次没有任务（会话 `53f06e20`），会话详情必须支持「只有消息」的轮次。
- 一个节点的完整轨迹分在三处：内置工具和被拦截的调用在 `task_graph_node.state.actions`，真实业务调用在 `tool_call_record`，用户确认在 `task_resume_record`；三者按 `round` 和时间合并。
- 检查点在恢复后 `delete_flag = 1`，标准 list 接口查不到（见第 9 节）。
- `tool_call_record.entities` 带 `type / id / displayName`，可直接用作「产生的对象」；`task_instance.record.entities` 汇总了整个任务的实体。
- `task_instance.prior` 记录前序任务摘要，可在任务概要中作为「前情」折叠展示。

### A.3 需要界面特别处理的情况

- **卡死循环**：任务 `61fe525b` 的第 ② 步 9 轮里有 5 轮是被拒绝的「完成节点」，原因是第 ① 步已经完成了同一个写目标。轨迹必须折叠重复动作并高亮拒绝原因。
- **写操作落在前置步骤**：成功任务 `9b1c31bd` 的写调用和确认都发生在第 ①「查询内容空间」步骤，第 ③「保存文章」只复用了写证据。DAG 节点卡片上的「写」与「已确认」标记必须按实际调用所在节点显示，不能按步骤标题推断。
- **超大便签**：同一节点的便签和 `task_node_payload` 中出现约 75 KB 的 `g2rain.runtime.tool.context` 对象（含整份契约）。界面对超过 32 KB 的 JSON 默认折叠，按需展开。
- **复用写证据**：节点 `1332e4e3` 有一次耗时 0、`business_ok` 为空的调用，结果是「已复用历史写证据」，界面标记为「复用」。

