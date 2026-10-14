/**
 * 智能体详情的公共 API：智能体配置列表通过它跳转，不深度导入内部实现。
 *
 * @example
 * router.push(agentDetailRoute(agent.id));           // 画像
 * router.push(agentDetailRoute(agent.id, 'skill'));  // 直接定位到技能
 */
import type { RouteLocationRaw } from 'vue-router';

export const AGENT_DETAIL_PATH = '/agent_detail';

/** 智能体详情的 Tab */
export type AgentDetailTab = 'profile' | 'skill' | 'preview';

/** 智能体详情的路由；不传 agentId 表示新建 */
export function agentDetailRoute(agentId?: number, tab: AgentDetailTab = 'profile'): RouteLocationRaw {
  return { path: AGENT_DETAIL_PATH, query: { ...(agentId ? { agentId: String(agentId) } : {}), tab } };
}
