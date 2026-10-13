/**
 * 聊天会话表相关 Mock 数据
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
 * 生成符合 ChatConversation 类型的 Mock 数据模板
 */
function getChatConversationTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'conversationId|1': ['@word(3,10)', '@word(3,10)'],
            'userId': '@integer(1, 100)',
            'title|1': ['@word(3,10)', null],
            'activeTaskId|1': ['@word(3,10)', null],
            'sessionShared|1': ['@word(3,10)', null],
            'stateVersion': '@integer(1, 100)',
            'lastMessageTime|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 聊天会话表相关的 Mock 数据映射
 */
export const ChatConversationMockDataMap: MockDataMap = {
  // GET /chat_conversation - 根据条件查询列表
  '/chat_conversation': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const conversationId = query?.conversationId;
    const userId = query?.userId;
    const title = query?.title;
    const activeTaskId = query?.activeTaskId;
    const sessionShared = query?.sessionShared;
    const stateVersion = query?.stateVersion;
    const lastMessageTime = query?.lastMessageTime;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getChatConversationTemplate({
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
    if (userId) {
      filteredList = filteredList.filter((item: any) => {
                return item.userId === userId;
              });
    }
    if (title) {
      filteredList = filteredList.filter((item: any) => {
                return item.title && item.title.includes(title);
              });
    }
    if (activeTaskId) {
      filteredList = filteredList.filter((item: any) => {
                return item.activeTaskId && item.activeTaskId.includes(activeTaskId);
              });
    }
    if (sessionShared) {
      filteredList = filteredList.filter((item: any) => {
                return item.sessionShared && item.sessionShared.includes(sessionShared);
              });
    }
    if (stateVersion) {
      filteredList = filteredList.filter((item: any) => {
                return item.stateVersion === stateVersion;
              });
    }
    if (lastMessageTime) {
      filteredList = filteredList.filter((item: any) => {
                return item.lastMessageTime && item.lastMessageTime.includes(lastMessageTime);
              });
    }

    return createResult(filteredList);
  },

  // GET /chat_conversation/list - 根据条件查询列表（兼容接口）
  '/chat_conversation/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const conversationId = query?.conversationId;
    const userId = query?.userId;
    const title = query?.title;
    const activeTaskId = query?.activeTaskId;
    const sessionShared = query?.sessionShared;
    const stateVersion = query?.stateVersion;
    const lastMessageTime = query?.lastMessageTime;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getChatConversationTemplate({
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
    if (userId) {
      filteredList = filteredList.filter((item: any) => {
                return item.userId === userId;
              });
    }
    if (title) {
      filteredList = filteredList.filter((item: any) => {
                return item.title && item.title.includes(title);
              });
    }
    if (activeTaskId) {
      filteredList = filteredList.filter((item: any) => {
                return item.activeTaskId && item.activeTaskId.includes(activeTaskId);
              });
    }
    if (sessionShared) {
      filteredList = filteredList.filter((item: any) => {
                return item.sessionShared && item.sessionShared.includes(sessionShared);
              });
    }
    if (stateVersion) {
      filteredList = filteredList.filter((item: any) => {
                return item.stateVersion === stateVersion;
              });
    }
    if (lastMessageTime) {
      filteredList = filteredList.filter((item: any) => {
                return item.lastMessageTime && item.lastMessageTime.includes(lastMessageTime);
              });
    }

    return createResult(filteredList);
  },

  // GET /chat_conversation/page - 根据条件分页查询
  '/chat_conversation/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const conversationId = query?.query?.conversationId || query?.conversationId;
    const userId = query?.query?.userId || query?.userId;
    const title = query?.query?.title || query?.title;
    const activeTaskId = query?.query?.activeTaskId || query?.activeTaskId;
    const sessionShared = query?.query?.sessionShared || query?.sessionShared;
    const stateVersion = query?.query?.stateVersion || query?.stateVersion;
    const lastMessageTime = query?.query?.lastMessageTime || query?.lastMessageTime;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getChatConversationTemplate()],
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

  // POST /chat_conversation/save - 保存（新增或更新）
  '/chat_conversation/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的聊天会话表数据
    const ChatConversationItem = Mock.mock(
      getChatConversationTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        conversationId: payload.conversationId !== undefined ? payload.conversationId : '@word(3,10)',
        userId: payload.userId !== undefined ? payload.userId : '@integer(1, 100)',
        title: payload.title !== undefined ? payload.title : null,
        activeTaskId: payload.activeTaskId !== undefined ? payload.activeTaskId : null,
        sessionShared: payload.sessionShared !== undefined ? payload.sessionShared : null,
        stateVersion: payload.stateVersion !== undefined ? payload.stateVersion : '@integer(1, 100)',
        lastMessageTime: payload.lastMessageTime !== undefined ? payload.lastMessageTime : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(ChatConversationItem);
  },

  // DELETE /chat_conversation/:id - 删除
  '/chat_conversation/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(ChatConversationMockDataMap);

