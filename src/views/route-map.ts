/**
 * 视图路由映射（模板项目）
 *
 * 仅注册「模板内已有」的示例页面，不包含具体业务系统的页面。
 * 从本模板生成新项目后，在此补充 views 下的页面与 linkPath 的映射即可。
 */

export interface ViewRouteConfig {
  component: () => Promise<unknown>;
  name?: string;
  meta: {
    title: string;
    requiresAuth: boolean;
    showInHome?: boolean;
  };
}

/** 路由路径 -> 视图配置
 * 模板默认不包含任何「system」示例页面。
 * 你可以在子应用生成后按需补充 `views/*` 并在这里注册。
 */
export const routeMap: Record<string, ViewRouteConfig> = {
    '/agent_detail': {
            component: () => import('@/views/agent_detail/index.vue'),
            name: 'AgentDetail',
            meta: { title: '智能体配置', requiresAuth: true, showInHome: false },
        },
    '/conversation_detail': {
            component: () => import('@/views/conversation_detail/index.vue'),
            name: 'ConversationDetail',
            meta: { title: '会话详情', requiresAuth: true, showInHome: false },
        },
    '/task_trace': {
            component: () => import('@/views/task_trace/index.vue'),
            name: 'TaskTrace',
            meta: { title: '执行追踪', requiresAuth: true, showInHome: false },
        },
    '/chat_conversation': {
            component: () => import('@/views/chat_conversation/index.vue'),
            name: 'ChatConversation',
            meta: { title: '会话观测', requiresAuth: true, showInHome: true },
        },
    '/agent_profile/custom': {
            component: () => import('@/views/agent_profile/index.vue'),
            name: 'AgentProfileCustom',
            meta: { title: '租户智能体', requiresAuth: true, showInHome: true },
        },
    '/agent_profile/platform': {
            component: () => import('@/views/agent_profile/index.vue'),
            name: 'AgentProfilePlatform',
            meta: { title: '平台智能体', requiresAuth: true, showInHome: true },
        },
    '/agent_profile': {
            component: () => import('@/views/agent_profile/index.vue'),
            name: 'AgentProfile',
            meta: { title: '租户智能体', requiresAuth: true, showInHome: false },
        },
    '/mcp_external_service/extension': {
            component: () => import('@/views/mcp_external_service/index.vue'),
            name: 'McpExternalServiceExtension',
            meta: { title: '平台扩展工具', requiresAuth: true, showInHome: true },
        },
    '/mcp_external_service/customer': {
            component: () => import('@/views/mcp_external_service/index.vue'),
            name: 'McpExternalServiceCustomer',
            meta: { title: '租户系统工具', requiresAuth: true, showInHome: true },
        },
    '/mcp_external_service': {
            component: () => import('@/views/mcp_external_service/index.vue'),
            name: 'McpExternalService',
            meta: { title: '租户系统工具', requiresAuth: true, showInHome: false },
        },
    '/mcp_tool_profile/native': {
            component: () => import('@/views/mcp_tool_profile/index.vue'),
            name: 'McpToolProfileNative',
            meta: { title: '平台原生工具', requiresAuth: true, showInHome: true },
        },
    '/mcp_tool_profile': {
            component: () => import('@/views/mcp_tool_profile/index.vue'),
            name: 'McpToolProfile',
            meta: { title: '平台原生工具', requiresAuth: true, showInHome: false },
        },
    '/model_service_catalog': {
            component: () => import('@/views/model_service_catalog/index.vue'),
            name: 'ModelServiceCatalog',
            meta: { title: '模型广场', requiresAuth: true, showInHome: true },
        },
    '/model_service_profile': {
            component: () => import('@/views/model_service_profile/index.vue'),
            name: 'ModelServiceProfile',
            meta: { title: '模型配置', requiresAuth: true, showInHome: true },
        },
    '/model_usage_record': {
            component: () => import('@/views/model_usage_record/index.vue'),
            name: 'ModelUsageRecord',
            meta: { title: '用量统计', requiresAuth: true, showInHome: true },
        },
    '/chat_prompt_template': {
            component: () => import('@/views/chat_prompt_template/index.vue'),
            name: 'ChatPromptTemplate',
            meta: { title: '问题模板', requiresAuth: true, showInHome: true },
        }
};

export function getRouteComponent(
  routePath: string,
): (() => Promise<unknown>) | undefined {
  return routeMap[routePath]?.component;
}

export function getHomeRoutes(): Array<{ path: string; title: string; name?: string }> {
  return Object.entries(routeMap)
    .filter(([path, config]) => {
      if (path === '/' || path === '/home') {
        return false;
      }
      return config.meta.showInHome === true;
    })
    .map(([path, config]) => ({
      path,
      title: config.meta.title,
      name: config.name,
    }));
}
