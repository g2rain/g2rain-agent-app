/**
 * 工具目录 API（g2rain-mcp-registry）。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { McpToolProfileVo, McpToolQuery } from './type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

export class McpToolProfileApi {
  static async list(query: McpToolQuery = {}): Promise<McpToolProfileVo[]> {
    const res = await getHttpClient('default').get<McpToolProfileVo[]>(`${Gateway.MCP}/mcp_tool_profile/list`, { ...query });
    return res.data ?? [];
  }
}
