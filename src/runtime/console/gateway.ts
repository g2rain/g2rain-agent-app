/**
 * 后端服务的网关前缀。页面 `api.ts` 拼接路径时统一引用，不在各处写字面量。
 *
 * @example
 * http.get(`${Gateway.HARNESS}/task_instance/list`, { taskId });
 */
export const Gateway = {
  /** g2rain-model-nexus */
  MODEL: '/model',
  /** g2rain-agent-studio */
  STUDIO: '/studio',
  /** g2rain-agent-runtime */
  HARNESS: '/harness',
  /** g2rain-mcp-registry（前缀待最终确认） */
  MCP: '/mcp',
} as const;
