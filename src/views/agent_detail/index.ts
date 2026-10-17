/**
 * 智能体工作台：列表通过它跳转，不深度导入内部实现。
 *
 * @example
 * router.push(agentDetailRoute());                                      // 新建自建
 * router.push(agentDetailRoute(undefined, 'profile', 'PLATFORM'));      // 新建平台
 * router.push(agentDetailRoute(agent.id, 'profile', 'CUSTOM'));         // 修改自建
 * router.push(agentDetailRoute(agent.id, 'skill', 'PLATFORM'));         // 平台技能 Tab
 */
import type { RouteLocationRaw } from 'vue-router';
import { ResourceType } from '@runtime/console';

export const AGENT_DETAIL_PATH = '/agent_detail';

/** 智能体工作台 Tab（profile = 智能体） */
export type AgentDetailTab = 'profile' | 'skill';

/** 工作台路由；不传 agentId 表示新建，默认停在智能体 Tab；resourceType 决定保存入口与返回列表 */
export function agentDetailRoute(
  agentId?: number,
  tab: AgentDetailTab = 'profile',
  resourceType: string = ResourceType.CUSTOM,
): RouteLocationRaw {
  return {
    path: AGENT_DETAIL_PATH,
    query: {
      ...(agentId ? { agentId: String(agentId) } : {}),
      tab,
      resourceType,
    },
  };
}

/** 列表页 path：自建 / 平台 */
export function agentListPath(resourceType: string): string {
  return resourceType === ResourceType.PLATFORM ? '/agent_profile/platform' : '/agent_profile/custom';
}
