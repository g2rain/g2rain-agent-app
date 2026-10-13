/**
 * 大报文溢出表相关 Mock 数据
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
 * 生成符合 TaskNodePayload 类型的 Mock 数据模板
 */
function getTaskNodePayloadTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'payloadId|1': ['@word(3,10)', '@word(3,10)'],
            'taskId|1': ['@word(3,10)', '@word(3,10)'],
            'nodeId|1': ['@word(3,10)', '@word(3,10)'],
            'payloadType|1': ['@word(3,10)', '@word(3,10)'],
            'payloadData|1': ['@word(3,10)', '@word(3,10)'],
            'toolName|1': ['@word(3,10)', null],
            'traceId|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 大报文溢出表相关的 Mock 数据映射
 */
export const TaskNodePayloadMockDataMap: MockDataMap = {
  // GET /task_node_payload - 根据条件查询列表
  '/task_node_payload': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const payloadId = query?.payloadId;
    const taskId = query?.taskId;
    const nodeId = query?.nodeId;
    const payloadType = query?.payloadType;
    const payloadData = query?.payloadData;
    const toolName = query?.toolName;
    const traceId = query?.traceId;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getTaskNodePayloadTemplate({
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
    if (payloadId) {
      filteredList = filteredList.filter((item: any) => {
                return item.payloadId && item.payloadId.includes(payloadId);
              });
    }
    if (taskId) {
      filteredList = filteredList.filter((item: any) => {
                return item.taskId && item.taskId.includes(taskId);
              });
    }
    if (nodeId) {
      filteredList = filteredList.filter((item: any) => {
                return item.nodeId && item.nodeId.includes(nodeId);
              });
    }
    if (payloadType) {
      filteredList = filteredList.filter((item: any) => {
                return item.payloadType && item.payloadType.includes(payloadType);
              });
    }
    if (payloadData) {
      filteredList = filteredList.filter((item: any) => {
                return item.payloadData && item.payloadData.includes(payloadData);
              });
    }
    if (toolName) {
      filteredList = filteredList.filter((item: any) => {
                return item.toolName && item.toolName.includes(toolName);
              });
    }
    if (traceId) {
      filteredList = filteredList.filter((item: any) => {
                return item.traceId && item.traceId.includes(traceId);
              });
    }

    return createResult(filteredList);
  },

  // GET /task_node_payload/list - 根据条件查询列表（兼容接口）
  '/task_node_payload/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const payloadId = query?.payloadId;
    const taskId = query?.taskId;
    const nodeId = query?.nodeId;
    const payloadType = query?.payloadType;
    const payloadData = query?.payloadData;
    const toolName = query?.toolName;
    const traceId = query?.traceId;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getTaskNodePayloadTemplate({
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
    if (payloadId) {
      filteredList = filteredList.filter((item: any) => {
                return item.payloadId && item.payloadId.includes(payloadId);
              });
    }
    if (taskId) {
      filteredList = filteredList.filter((item: any) => {
                return item.taskId && item.taskId.includes(taskId);
              });
    }
    if (nodeId) {
      filteredList = filteredList.filter((item: any) => {
                return item.nodeId && item.nodeId.includes(nodeId);
              });
    }
    if (payloadType) {
      filteredList = filteredList.filter((item: any) => {
                return item.payloadType && item.payloadType.includes(payloadType);
              });
    }
    if (payloadData) {
      filteredList = filteredList.filter((item: any) => {
                return item.payloadData && item.payloadData.includes(payloadData);
              });
    }
    if (toolName) {
      filteredList = filteredList.filter((item: any) => {
                return item.toolName && item.toolName.includes(toolName);
              });
    }
    if (traceId) {
      filteredList = filteredList.filter((item: any) => {
                return item.traceId && item.traceId.includes(traceId);
              });
    }

    return createResult(filteredList);
  },

  // GET /task_node_payload/page - 根据条件分页查询
  '/task_node_payload/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const payloadId = query?.query?.payloadId || query?.payloadId;
    const taskId = query?.query?.taskId || query?.taskId;
    const nodeId = query?.query?.nodeId || query?.nodeId;
    const payloadType = query?.query?.payloadType || query?.payloadType;
    const payloadData = query?.query?.payloadData || query?.payloadData;
    const toolName = query?.query?.toolName || query?.toolName;
    const traceId = query?.query?.traceId || query?.traceId;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getTaskNodePayloadTemplate()],
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

  // POST /task_node_payload/save - 保存（新增或更新）
  '/task_node_payload/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的大报文溢出表数据
    const TaskNodePayloadItem = Mock.mock(
      getTaskNodePayloadTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        payloadId: payload.payloadId !== undefined ? payload.payloadId : '@word(3,10)',
        taskId: payload.taskId !== undefined ? payload.taskId : '@word(3,10)',
        nodeId: payload.nodeId !== undefined ? payload.nodeId : '@word(3,10)',
        payloadType: payload.payloadType !== undefined ? payload.payloadType : '@word(3,10)',
        payloadData: payload.payloadData !== undefined ? payload.payloadData : '@word(3,10)',
        toolName: payload.toolName !== undefined ? payload.toolName : null,
        traceId: payload.traceId !== undefined ? payload.traceId : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(TaskNodePayloadItem);
  },

  // DELETE /task_node_payload/:id - 删除
  '/task_node_payload/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(TaskNodePayloadMockDataMap);

