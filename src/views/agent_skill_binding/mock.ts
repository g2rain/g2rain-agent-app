/**
 * 数字员工相关 Mock 数据
 */

import type { AxiosRequestConfig } from 'axios';
import type { Result } from '@g2rain/http';
import { mockManager, type MockDataMap } from '@runtime/http';
import Mock from 'mockjs';

/**
 * 生成符合 Result 格式的响应
 */
function createResult<T>(data: T, status: number = 200): Result<T> {
  // 先使用 Mock.mock 生成元数据，然后直接设置 data，避免 data 被 mock 处理
  const result = Mock.mock({
    requestId: '@guid',
    requestTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    status,
    errorCode: status === 200 ? '' : '@word(5,10)',
    errorMessage: status === 200 ? '' : '@cword(5,15)',
  }) as Result<T>;
  
  // 直接设置 data，不经过 Mock.mock 处理
  result.data = data;
  
  return result;
}

/**
 * 生成符合 AgentSkillBinding 类型的 Mock 数据模板
 */
function getAgentSkillBindingTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'agentId': '@integer(1, 100)',
            'skillId': '@integer(1, 100)',
            'enabledFlag': '@integer(1, 100)',
            'description|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 数字员工相关的 Mock 数据映射
 */
export const AgentSkillBindingMockDataMap: MockDataMap = {
  // GET /agent_skill_binding - 根据条件查询列表
  '/agent_skill_binding': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const agentId = query?.agentId;
    const skillId = query?.skillId;
    const enabledFlag = query?.enabledFlag;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getAgentSkillBindingTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (organId) {
      filteredList = filteredList.filter((item: any) => {
                return item.organId === organId;
              });
    }
    if (agentId) {
      filteredList = filteredList.filter((item: any) => {
                return item.agentId === agentId;
              });
    }
    if (skillId) {
      filteredList = filteredList.filter((item: any) => {
                return item.skillId === skillId;
              });
    }
    if (enabledFlag) {
      filteredList = filteredList.filter((item: any) => {
                return item.enabledFlag === enabledFlag;
              });
    }
    if (description) {
      filteredList = filteredList.filter((item: any) => {
                return item.description && item.description.includes(description);
              });
    }

    return createResult(filteredList);
  },

  // GET /agent_skill_binding/list - 根据条件查询列表（兼容接口）
  '/agent_skill_binding/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const agentId = query?.agentId;
    const skillId = query?.skillId;
    const enabledFlag = query?.enabledFlag;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getAgentSkillBindingTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (organId) {
      filteredList = filteredList.filter((item: any) => {
                return item.organId === organId;
              });
    }
    if (agentId) {
      filteredList = filteredList.filter((item: any) => {
                return item.agentId === agentId;
              });
    }
    if (skillId) {
      filteredList = filteredList.filter((item: any) => {
                return item.skillId === skillId;
              });
    }
    if (enabledFlag) {
      filteredList = filteredList.filter((item: any) => {
                return item.enabledFlag === enabledFlag;
              });
    }
    if (description) {
      filteredList = filteredList.filter((item: any) => {
                return item.description && item.description.includes(description);
              });
    }

    return createResult(filteredList);
  },

  // GET /agent_skill_binding/page - 根据条件分页查询
  '/agent_skill_binding/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const agentId = query?.query?.agentId || query?.agentId;
    const skillId = query?.query?.skillId || query?.skillId;
    const enabledFlag = query?.query?.enabledFlag || query?.enabledFlag;
    const description = query?.query?.description || query?.description;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getAgentSkillBindingTemplate()],
    };

    const result = Mock.mock(template);

    // 计算总页数
    const totalPages = Math.ceil(total / pageSize);

    const pageData = {
      pageNum,
      pageSize,
      total,
      totalPages,
      records: result.records,
    };

    return createResult(pageData);
  },

  // POST /agent_skill_binding/save - 保存（新增或更新）
  '/agent_skill_binding/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的数字员工数据
    const AgentSkillBindingItem = Mock.mock(
      getAgentSkillBindingTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        agentId: payload.agentId !== undefined ? payload.agentId : '@integer(1, 100)',
        skillId: payload.skillId !== undefined ? payload.skillId : '@integer(1, 100)',
        enabledFlag: payload.enabledFlag !== undefined ? payload.enabledFlag : '@integer(1, 100)',
        description: payload.description !== undefined ? payload.description : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(AgentSkillBindingItem);
  },

  // DELETE /agent_skill_binding/:id - 删除
  '/agent_skill_binding/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(AgentSkillBindingMockDataMap);

