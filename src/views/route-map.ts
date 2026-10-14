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
    '/agents': {
            component: () => import('@/views/agent/index.vue'),
            name: 'Agent',
            meta: { title: '智能体列表', requiresAuth: true, showInHome: true },
        },
    '/mcp_tool': {
            component: () => import('@/views/mcp_tool/index.vue'),
            name: 'McpTool',
            meta: { title: '工具目录', requiresAuth: true, showInHome: true },
        },
    '/mcp_service': {
            component: () => import('@/views/mcp_service/index.vue'),
            name: 'McpService',
            meta: { title: '服务接入', requiresAuth: true, showInHome: true },
        },
    '/model_catalog': {
            component: () => import('@/views/model_catalog/index.vue'),
            name: 'ModelCatalog',
            meta: { title: '模型目录', requiresAuth: true, showInHome: true },
        },
    '/model_profile': {
            component: () => import('@/views/model_profile/index.vue'),
            name: 'ModelProfile',
            meta: { title: '模型配置', requiresAuth: true, showInHome: true },
        },
    '/model_usage': {
            component: () => import('@/views/model_usage/index.vue'),
            name: 'ModelUsage',
            meta: { title: '用量统计', requiresAuth: true, showInHome: true },
        },
    '/agent_detail': {
            component: () => import('@/views/agent_detail/index.vue'),
            name: 'AgentDetail',
            meta: { title: '智能体详情', requiresAuth: true, showInHome: false },
        },
    '/conversation': {
            component: () => import('@/views/conversation/index.vue'),
            name: 'Conversation',
            meta: { title: '会话观测', requiresAuth: true, showInHome: true },
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
            meta: { title: '聊天会话表', requiresAuth: true, showInHome: true },
        },
    '/chat_message': {
            component: () => import('@/views/chat_message/index.vue'),
            name: 'ChatMessage',
            meta: { title: '聊天消息表', requiresAuth: true, showInHome: true },
        },
    '/task_instance': {
            component: () => import('@/views/task_instance/index.vue'),
            name: 'TaskInstance',
            meta: { title: '任务实例表', requiresAuth: true, showInHome: true },
        },
    '/task_graph_node': {
            component: () => import('@/views/task_graph_node/index.vue'),
            name: 'TaskGraphNode',
            meta: { title: '任务图步骤表', requiresAuth: true, showInHome: true },
        },
    '/task_graph_edge': {
            component: () => import('@/views/task_graph_edge/index.vue'),
            name: 'TaskGraphEdge',
            meta: { title: '任务图依赖边表', requiresAuth: true, showInHome: true },
        },
    '/task_node_payload': {
            component: () => import('@/views/task_node_payload/index.vue'),
            name: 'TaskNodePayload',
            meta: { title: '大报文溢出表', requiresAuth: true, showInHome: true },
        },
    '/task_checkpoint': {
            component: () => import('@/views/task_checkpoint/index.vue'),
            name: 'TaskCheckpoint',
            meta: { title: '任务检查点表', requiresAuth: true, showInHome: true },
        },
    '/tool_call_record': {
            component: () => import('@/views/tool_call_record/index.vue'),
            name: 'ToolCallRecord',
            meta: { title: '工具调用记录表', requiresAuth: true, showInHome: true },
        },
    '/task_resume_record': {
            component: () => import('@/views/task_resume_record/index.vue'),
            name: 'TaskResumeRecord',
            meta: { title: '任务恢复动作审计表', requiresAuth: true, showInHome: true },
        },
    '/agent_profile': {
            component: () => import('@/views/agent_profile/index.vue'),
            name: 'AgentProfile',
            meta: { title: '数字员工画像表', requiresAuth: true, showInHome: true },
        },
    '/skill_profile': {
            component: () => import('@/views/skill_profile/index.vue'),
            name: 'SkillProfile',
            meta: { title: '定义表', requiresAuth: true, showInHome: true },
        },
    '/agent_skill_binding': {
            component: () => import('@/views/agent_skill_binding/index.vue'),
            name: 'AgentSkillBinding',
            meta: { title: '数字员工', requiresAuth: true, showInHome: true },
        },
    '/skill_tool_binding': {
            component: () => import('@/views/skill_tool_binding/index.vue'),
            name: 'SkillToolBinding',
            meta: { title: '绑定表', requiresAuth: true, showInHome: true },
        },
    '/mcp_external_service': {
            component: () => import('@/views/mcp_external_service/index.vue'),
            name: 'McpExternalService',
            meta: { title: '外部服务表', requiresAuth: true, showInHome: true },
        },
    '/mcp_tool_profile': {
            component: () => import('@/views/mcp_tool_profile/index.vue'),
            name: 'McpToolProfile',
            meta: { title: '暴露档案表', requiresAuth: true, showInHome: true },
        },
    '/model_service_catalog': {
            component: () => import('@/views/model_service_catalog/index.vue'),
            name: 'ModelServiceCatalog',
            meta: { title: '模型服务目录', requiresAuth: true, showInHome: true },
        },
    '/model_service_profile': {
            component: () => import('@/views/model_service_profile/index.vue'),
            name: 'ModelServiceProfile',
            meta: { title: '模型服务配置', requiresAuth: true, showInHome: true },
        },
    '/model_usage_record': {
            component: () => import('@/views/model_usage_record/index.vue'),
            name: 'ModelUsageRecord',
            meta: { title: '模型用量记录', requiresAuth: true, showInHome: true },
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
