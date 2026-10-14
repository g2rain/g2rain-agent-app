/**
 * 工具档案（mcp_tool_profile）。`name` 即 MCP tools/call 名，也是技能契约 tools 的 key。
 */
export interface McpToolProfileVo {
  id: number;
  name: string;
  title: string;
  resourceType: string;
  serviceCode: string;
  sourceId: number | null;
  method: string;
  path: string;
  status: string;
  description: string | null;
  openapiOperation: string | null;
  inputSchema: string | null;
}

export interface McpToolQuery {
  /** 名称 / 标题关键字 */
  name?: string;
  resourceType?: string;
  serviceCode?: string;
  method?: string;
  status?: string;
}

export type McpToolPayload = Partial<Omit<McpToolProfileVo, 'id'>> & { id?: number };

/** inputSchema 解析后的参数行 */
export interface SchemaParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

/** 技能对工具的引用（被引用 Tab） */
export interface ToolSkillRef {
  skillId: number;
  skillName: string;
  skillKey: string;
}
