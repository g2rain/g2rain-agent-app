/**
 * 任务图依赖边表相关 API 服务
 * 提供任务图依赖边表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { TaskGraphEdge, TaskGraphEdgePayload, TaskGraphEdgeQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const base = Gateway.HARNESS;

/**
 * 任务图依赖边表 API 服务类
 */
export class TaskGraphEdgeApi {
  /**
   * 获取任务图依赖边表列表
   * @param params 查询参数（可选）
   * @returns 任务图依赖边表列表
   */
  static async list(params?: TaskGraphEdgeQuery): Promise<TaskGraphEdge[]> {
    const http = getHttpClient('default');
    const res = await http.get<TaskGraphEdge[]>(`${base}/task_graph_edge/list`, params);
    return res.data || [];
  }

  /**
   * 分页查询任务图依赖边表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: TaskGraphEdgeQuery & PageSelectListDto): Promise<PageData<TaskGraphEdge>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<TaskGraphEdge>>(`${base}/task_graph_edge/page`, params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 任务图依赖边表 ID
   * @returns 任务图依赖边表详情
   */
  static async getById(id: number): Promise<TaskGraphEdge> {
    const http = getHttpClient('default');
    const res = await http.get<TaskGraphEdge>(`${base}/task_graph_edge/${id}`);
    return res.data;
  }

  /**
   * 保存任务图依赖边表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 任务图依赖边表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的任务图依赖边表
   */
  static async save(payload: TaskGraphEdgePayload): Promise<TaskGraphEdge> {
    const http = getHttpClient('default');
    const res = await http.post<TaskGraphEdge>(`${base}/task_graph_edge/save`, payload);
    return res.data;
  }

  /**
   * 删除任务图依赖边表
   * @param id 任务图依赖边表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`${base}/task_graph_edge/${id}`);
  }
}

