/**
 * 数字员工画像表相关 Mock 数据
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
 * 生成符合 AgentProfile 类型的 Mock 数据模板
 */
function getAgentProfileTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'agentCode|1': ['@word(3,10)', '@word(3,10)'],
            'agentName|1': ['@word(3,10)', '@word(3,10)'],
            'resourceType|1': ['@word(3,10)', '@word(3,10)'],
            'identityDesc|1': ['@word(3,10)', null],
            'missionDesc|1': ['@word(3,10)', null],
            'boundaryDesc|1': ['@word(3,10)', null],
            'styleDesc|1': ['@word(3,10)', null],
            'principleDesc|1': ['@word(3,10)', null],
            'status|1': ['@word(3,10)', '@word(3,10)'],
            'description|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 数字员工画像表相关的 Mock 数据映射
 */
export const AgentProfileMockDataMap: MockDataMap = {
  // GET /agent_profile - 根据条件查询列表
  '/agent_profile': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const agentCode = query?.agentCode;
    const agentName = query?.agentName;
    const resourceType = query?.resourceType;
    const identityDesc = query?.identityDesc;
    const missionDesc = query?.missionDesc;
    const boundaryDesc = query?.boundaryDesc;
    const styleDesc = query?.styleDesc;
    const principleDesc = query?.principleDesc;
    const status = query?.status;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getAgentProfileTemplate({
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
    if (agentCode) {
      filteredList = filteredList.filter((item: any) => {
                return item.agentCode && item.agentCode.includes(agentCode);
              });
    }
    if (agentName) {
      filteredList = filteredList.filter((item: any) => {
                return item.agentName && item.agentName.includes(agentName);
              });
    }
    if (resourceType) {
      filteredList = filteredList.filter((item: any) => {
                return item.resourceType && item.resourceType.includes(resourceType);
              });
    }
    if (identityDesc) {
      filteredList = filteredList.filter((item: any) => {
                return item.identityDesc && item.identityDesc.includes(identityDesc);
              });
    }
    if (missionDesc) {
      filteredList = filteredList.filter((item: any) => {
                return item.missionDesc && item.missionDesc.includes(missionDesc);
              });
    }
    if (boundaryDesc) {
      filteredList = filteredList.filter((item: any) => {
                return item.boundaryDesc && item.boundaryDesc.includes(boundaryDesc);
              });
    }
    if (styleDesc) {
      filteredList = filteredList.filter((item: any) => {
                return item.styleDesc && item.styleDesc.includes(styleDesc);
              });
    }
    if (principleDesc) {
      filteredList = filteredList.filter((item: any) => {
                return item.principleDesc && item.principleDesc.includes(principleDesc);
              });
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => {
                return item.status && item.status.includes(status);
              });
    }
    if (description) {
      filteredList = filteredList.filter((item: any) => {
                return item.description && item.description.includes(description);
              });
    }

    return createResult(filteredList);
  },

  // GET /agent_profile/list - 根据条件查询列表（兼容接口）
  '/agent_profile/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const agentCode = query?.agentCode;
    const agentName = query?.agentName;
    const resourceType = query?.resourceType;
    const identityDesc = query?.identityDesc;
    const missionDesc = query?.missionDesc;
    const boundaryDesc = query?.boundaryDesc;
    const styleDesc = query?.styleDesc;
    const principleDesc = query?.principleDesc;
    const status = query?.status;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getAgentProfileTemplate({
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
    if (agentCode) {
      filteredList = filteredList.filter((item: any) => {
                return item.agentCode && item.agentCode.includes(agentCode);
              });
    }
    if (agentName) {
      filteredList = filteredList.filter((item: any) => {
                return item.agentName && item.agentName.includes(agentName);
              });
    }
    if (resourceType) {
      filteredList = filteredList.filter((item: any) => {
                return item.resourceType && item.resourceType.includes(resourceType);
              });
    }
    if (identityDesc) {
      filteredList = filteredList.filter((item: any) => {
                return item.identityDesc && item.identityDesc.includes(identityDesc);
              });
    }
    if (missionDesc) {
      filteredList = filteredList.filter((item: any) => {
                return item.missionDesc && item.missionDesc.includes(missionDesc);
              });
    }
    if (boundaryDesc) {
      filteredList = filteredList.filter((item: any) => {
                return item.boundaryDesc && item.boundaryDesc.includes(boundaryDesc);
              });
    }
    if (styleDesc) {
      filteredList = filteredList.filter((item: any) => {
                return item.styleDesc && item.styleDesc.includes(styleDesc);
              });
    }
    if (principleDesc) {
      filteredList = filteredList.filter((item: any) => {
                return item.principleDesc && item.principleDesc.includes(principleDesc);
              });
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => {
                return item.status && item.status.includes(status);
              });
    }
    if (description) {
      filteredList = filteredList.filter((item: any) => {
                return item.description && item.description.includes(description);
              });
    }

    return createResult(filteredList);
  },

  // GET /agent_profile/page - 根据条件分页查询
  '/agent_profile/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const agentCode = query?.query?.agentCode || query?.agentCode;
    const agentName = query?.query?.agentName || query?.agentName;
    const resourceType = query?.query?.resourceType || query?.resourceType;
    const identityDesc = query?.query?.identityDesc || query?.identityDesc;
    const missionDesc = query?.query?.missionDesc || query?.missionDesc;
    const boundaryDesc = query?.query?.boundaryDesc || query?.boundaryDesc;
    const styleDesc = query?.query?.styleDesc || query?.styleDesc;
    const principleDesc = query?.query?.principleDesc || query?.principleDesc;
    const status = query?.query?.status || query?.status;
    const description = query?.query?.description || query?.description;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getAgentProfileTemplate()],
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

  // POST /agent_profile/save - 保存（新增或更新）
  '/agent_profile/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的数字员工画像表数据
    const AgentProfileItem = Mock.mock(
      getAgentProfileTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        agentCode: payload.agentCode !== undefined ? payload.agentCode : '@word(3,10)',
        agentName: payload.agentName !== undefined ? payload.agentName : '@word(3,10)',
        resourceType: payload.resourceType !== undefined ? payload.resourceType : '@word(3,10)',
        identityDesc: payload.identityDesc !== undefined ? payload.identityDesc : null,
        missionDesc: payload.missionDesc !== undefined ? payload.missionDesc : null,
        boundaryDesc: payload.boundaryDesc !== undefined ? payload.boundaryDesc : null,
        styleDesc: payload.styleDesc !== undefined ? payload.styleDesc : null,
        principleDesc: payload.principleDesc !== undefined ? payload.principleDesc : null,
        status: payload.status !== undefined ? payload.status : '@word(3,10)',
        description: payload.description !== undefined ? payload.description : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(AgentProfileItem);
  },

  // DELETE /agent_profile/:id - 删除
  '/agent_profile/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(AgentProfileMockDataMap);

