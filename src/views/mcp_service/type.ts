/**
 * 外部服务（mcp_external_service）与导入向导相关类型。
 */

export interface McpServiceVo {
  id: number;
  code: string;
  name: string;
  endpoint: string;
  contextPath: string | null;
  resourceType: string;
  status: string;
  description: string | null;
  updateTime: string;
  /** 一期前端按 serviceCode 汇总 */
  toolCount: number;
}

export interface McpServiceQuery {
  name?: string;
  code?: string;
  resourceType?: string;
  status?: string;
}

export type McpServicePayload = Partial<Omit<McpServiceVo, 'toolCount' | 'updateTime'>> & {
  id?: number;
};
