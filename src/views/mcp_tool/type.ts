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
  resourceType?: string;
  serviceCode?: string;
  status?: string;
}
