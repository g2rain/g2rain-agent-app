/**
 * 大报文溢出表相关 API 服务
 * 提供大报文溢出表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { TaskNodePayload, TaskNodePayloadPayload, TaskNodePayloadQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const base = Gateway.HARNESS;

/**
 * 大报文溢出表 API 服务类
 */
export class TaskNodePayloadApi {
  /**
   * 获取大报文溢出表列表
   * @param params 查询参数（可选）
   * @returns 大报文溢出表列表
   */
  static async list(params?: TaskNodePayloadQuery): Promise<TaskNodePayload[]> {
    const http = getHttpClient('default');
    const res = await http.get<TaskNodePayload[]>(`${base}/task_node_payload/list`, params);
    return res.data || [];
  }

  /**
   * 分页查询大报文溢出表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: TaskNodePayloadQuery & PageSelectListDto): Promise<PageData<TaskNodePayload>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<TaskNodePayload>>(`${base}/task_node_payload/page`, params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 大报文溢出表 ID
   * @returns 大报文溢出表详情
   */
  static async getById(id: number): Promise<TaskNodePayload> {
    const http = getHttpClient('default');
    const res = await http.get<TaskNodePayload>(`${base}/task_node_payload/${id}`);
    return res.data;
  }

  /**
   * 保存大报文溢出表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 大报文溢出表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的大报文溢出表
   */
  static async save(payload: TaskNodePayloadPayload): Promise<TaskNodePayload> {
    const http = getHttpClient('default');
    const res = await http.post<TaskNodePayload>(`${base}/task_node_payload/save`, payload);
    return res.data;
  }

  /**
   * 删除大报文溢出表
   * @param id 大报文溢出表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`${base}/task_node_payload/${id}`);
  }
}

