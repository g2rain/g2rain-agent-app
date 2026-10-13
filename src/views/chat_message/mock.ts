/**
 * 聊天消息表相关 Mock 数据
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
 * 生成符合 ChatMessage 类型的 Mock 数据模板
 */
function getChatMessageTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'conversationId|1': ['@word(3,10)', '@word(3,10)'],
            'taskId|1': ['@word(3,10)', null],
            'nodeId|1': ['@word(3,10)', null],
            'round': '@integer(1, 100)',
            'messageId|1': ['@word(3,10)', '@word(3,10)'],
            'channel|1': ['@word(3,10)', null],
            'model|1': ['@word(3,10)', null],
            'role|1': ['@word(3,10)', '@word(3,10)'],
            'messageType|1': ['@word(3,10)', '@word(3,10)'],
            'content|1': ['@word(3,10)', '@word(3,10)'],
            'traceId|1': ['@word(3,10)', null],
            'createdAtMs': '@integer(1, 100)',
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 聊天消息表相关的 Mock 数据映射
 */
export const ChatMessageMockDataMap: MockDataMap = {
  // GET /chat_message - 根据条件查询列表
  '/chat_message': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const conversationId = query?.conversationId;
    const taskId = query?.taskId;
    const nodeId = query?.nodeId;
    const round = query?.round;
    const messageId = query?.messageId;
    const channel = query?.channel;
    const model = query?.model;
    const role = query?.role;
    const messageType = query?.messageType;
    const content = query?.content;
    const traceId = query?.traceId;
    const createdAtMs = query?.createdAtMs;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getChatMessageTemplate({
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
    if (conversationId) {
      filteredList = filteredList.filter((item: any) => {
                return item.conversationId && item.conversationId.includes(conversationId);
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
    if (round) {
      filteredList = filteredList.filter((item: any) => {
                return item.round === round;
              });
    }
    if (messageId) {
      filteredList = filteredList.filter((item: any) => {
                return item.messageId && item.messageId.includes(messageId);
              });
    }
    if (channel) {
      filteredList = filteredList.filter((item: any) => {
                return item.channel && item.channel.includes(channel);
              });
    }
    if (model) {
      filteredList = filteredList.filter((item: any) => {
                return item.model && item.model.includes(model);
              });
    }
    if (role) {
      filteredList = filteredList.filter((item: any) => {
                return item.role && item.role.includes(role);
              });
    }
    if (messageType) {
      filteredList = filteredList.filter((item: any) => {
                return item.messageType && item.messageType.includes(messageType);
              });
    }
    if (content) {
      filteredList = filteredList.filter((item: any) => {
                return item.content && item.content.includes(content);
              });
    }
    if (traceId) {
      filteredList = filteredList.filter((item: any) => {
                return item.traceId && item.traceId.includes(traceId);
              });
    }
    if (createdAtMs) {
      filteredList = filteredList.filter((item: any) => {
                return item.createdAtMs === createdAtMs;
              });
    }

    return createResult(filteredList);
  },

  // GET /chat_message/list - 根据条件查询列表（兼容接口）
  '/chat_message/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const conversationId = query?.conversationId;
    const taskId = query?.taskId;
    const nodeId = query?.nodeId;
    const round = query?.round;
    const messageId = query?.messageId;
    const channel = query?.channel;
    const model = query?.model;
    const role = query?.role;
    const messageType = query?.messageType;
    const content = query?.content;
    const traceId = query?.traceId;
    const createdAtMs = query?.createdAtMs;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getChatMessageTemplate({
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
    if (conversationId) {
      filteredList = filteredList.filter((item: any) => {
                return item.conversationId && item.conversationId.includes(conversationId);
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
    if (round) {
      filteredList = filteredList.filter((item: any) => {
                return item.round === round;
              });
    }
    if (messageId) {
      filteredList = filteredList.filter((item: any) => {
                return item.messageId && item.messageId.includes(messageId);
              });
    }
    if (channel) {
      filteredList = filteredList.filter((item: any) => {
                return item.channel && item.channel.includes(channel);
              });
    }
    if (model) {
      filteredList = filteredList.filter((item: any) => {
                return item.model && item.model.includes(model);
              });
    }
    if (role) {
      filteredList = filteredList.filter((item: any) => {
                return item.role && item.role.includes(role);
              });
    }
    if (messageType) {
      filteredList = filteredList.filter((item: any) => {
                return item.messageType && item.messageType.includes(messageType);
              });
    }
    if (content) {
      filteredList = filteredList.filter((item: any) => {
                return item.content && item.content.includes(content);
              });
    }
    if (traceId) {
      filteredList = filteredList.filter((item: any) => {
                return item.traceId && item.traceId.includes(traceId);
              });
    }
    if (createdAtMs) {
      filteredList = filteredList.filter((item: any) => {
                return item.createdAtMs === createdAtMs;
              });
    }

    return createResult(filteredList);
  },

  // GET /chat_message/page - 根据条件分页查询
  '/chat_message/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const conversationId = query?.query?.conversationId || query?.conversationId;
    const taskId = query?.query?.taskId || query?.taskId;
    const nodeId = query?.query?.nodeId || query?.nodeId;
    const round = query?.query?.round || query?.round;
    const messageId = query?.query?.messageId || query?.messageId;
    const channel = query?.query?.channel || query?.channel;
    const model = query?.query?.model || query?.model;
    const role = query?.query?.role || query?.role;
    const messageType = query?.query?.messageType || query?.messageType;
    const content = query?.query?.content || query?.content;
    const traceId = query?.query?.traceId || query?.traceId;
    const createdAtMs = query?.query?.createdAtMs || query?.createdAtMs;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getChatMessageTemplate()],
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

  // POST /chat_message/save - 保存（新增或更新）
  '/chat_message/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的聊天消息表数据
    const ChatMessageItem = Mock.mock(
      getChatMessageTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        conversationId: payload.conversationId !== undefined ? payload.conversationId : '@word(3,10)',
        taskId: payload.taskId !== undefined ? payload.taskId : null,
        nodeId: payload.nodeId !== undefined ? payload.nodeId : null,
        round: payload.round !== undefined ? payload.round : null,
        messageId: payload.messageId !== undefined ? payload.messageId : '@word(3,10)',
        channel: payload.channel !== undefined ? payload.channel : null,
        model: payload.model !== undefined ? payload.model : null,
        role: payload.role !== undefined ? payload.role : '@word(3,10)',
        messageType: payload.messageType !== undefined ? payload.messageType : '@word(3,10)',
        content: payload.content !== undefined ? payload.content : '@word(3,10)',
        traceId: payload.traceId !== undefined ? payload.traceId : null,
        createdAtMs: payload.createdAtMs !== undefined ? payload.createdAtMs : '@integer(1, 100)',
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(ChatMessageItem);
  },

  // DELETE /chat_message/:id - 删除
  '/chat_message/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(ChatMessageMockDataMap);

