/**
 * 任务实例表相关 API 服务
 * 提供任务实例表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { TaskInstance, TaskInstancePayload, TaskInstanceQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const base = Gateway.HARNESS;

/**
 * 任务实例表 API 服务类
 */
export class TaskInstanceApi {
  /**
   * 获取任务实例表列表
   * @param params 查询参数（可选）
   * @returns 任务实例表列表
   */
  static async list(params?: TaskInstanceQuery): Promise<TaskInstance[]> {
    const http = getHttpClient('default');
    const res = await http.get<TaskInstance[]>(`${base}/task_instance/list`, params);
    return res.data || [];
  }

  /**
   * 分页查询任务实例表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: TaskInstanceQuery & PageSelectListDto): Promise<PageData<TaskInstance>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<TaskInstance>>(`${base}/task_instance/page`, params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 任务实例表 ID
   * @returns 任务实例表详情
   */
  static async getById(id: number): Promise<TaskInstance> {
    const http = getHttpClient('default');
    const res = await http.get<TaskInstance>(`${base}/task_instance/${id}`);
    return res.data;
  }

  /** 按任务业务标识查完整任务（含大字段） */
  static async getByTaskId(taskId: string): Promise<TaskInstance | null> {
    const http = getHttpClient('default');
    const res = await http.get<TaskInstance>(`${base}/task_instance/by_task/${encodeURIComponent(taskId)}`);
    return res.data ?? null;
  }

  /**
   * 保存任务实例表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 任务实例表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的任务实例表
   */
  static async save(payload: TaskInstancePayload): Promise<TaskInstance> {
    const http = getHttpClient('default');
    const res = await http.post<TaskInstance>(`${base}/task_instance/save`, payload);
    return res.data;
  }

  /**
   * 删除任务实例表
   * @param id 任务实例表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`${base}/task_instance/${id}`);
  }
}

