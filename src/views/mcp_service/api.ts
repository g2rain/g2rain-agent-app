/**
 * 服务接入 API（g2rain-mcp-registry）。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { PageData } from '@platform/types/api.type';
import type { McpServicePayload, McpServiceQuery, McpServiceVo } from './type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

interface ServiceRow {
  id: number;
  code: string;
  name: string;
  endpoint: string;
  contextPath: string | null;
  resourceType: string;
  status: string;
  description: string | null;
  updateTime: string;
}

interface ToolRow {
  serviceCode: string;
}

const mcp = Gateway.MCP;
const http = () => getHttpClient('default');

export class McpServiceApi {
  static async page(query: McpServiceQuery, pageNum: number, pageSize: number): Promise<PageData<ServiceRow>> {
    const res = await http().get<PageData<ServiceRow>>(`${mcp}/mcp_external_service/page`, {
      ...query,
      pageNum,
      pageSize,
    });
    return res.data;
  }

  /** 全部工具，用于按 serviceCode 统计工具数 */
  static async tools(): Promise<ToolRow[]> {
    const res = await http().get<ToolRow[]>(`${mcp}/mcp_tool_profile/list`);
    return res.data ?? [];
  }

  static async save(payload: McpServicePayload): Promise<number> {
    const res = await http().post<number>(`${mcp}/mcp_external_service/save`, payload);
    return res.data;
  }

  static async remove(id: number): Promise<void> {
    await http().delete(`${mcp}/mcp_external_service/${id}`);
  }

  /** 组装带工具数的列表行 */
  static async pageWithToolCount(
    query: McpServiceQuery,
    pageNum: number,
    pageSize: number,
  ): Promise<PageData<McpServiceVo>> {
    const [page, tools] = await Promise.all([this.page(query, pageNum, pageSize), this.tools()]);
    const countByCode = new Map<string, number>();
    for (const tool of tools) {
      countByCode.set(tool.serviceCode, (countByCode.get(tool.serviceCode) ?? 0) + 1);
    }
    return {
      ...page,
      records: page.records.map((row) => ({
        ...row,
        toolCount: countByCode.get(row.code) ?? 0,
      })),
    };
  }
}
