/**
 * 任务恢复动作审计表相关 API 服务
 * 提供任务恢复动作审计表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { TaskResumeRecord, TaskResumeRecordPayload, TaskResumeRecordQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 任务恢复动作审计表 API 服务类
 */
export class TaskResumeRecordApi {
  /**
   * 获取任务恢复动作审计表列表
   * @param params 查询参数（可选）
   * @returns 任务恢复动作审计表列表
   */
  static async list(params?: TaskResumeRecordQuery): Promise<TaskResumeRecord[]> {
    const http = getHttpClient('default');
    const res = await http.get<TaskResumeRecord[]>('/task_resume_record/list', params);
    return res.data || [];
  }

  /**
   * 分页查询任务恢复动作审计表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: TaskResumeRecordQuery & PageSelectListDto): Promise<PageData<TaskResumeRecord>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<TaskResumeRecord>>('/task_resume_record/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 任务恢复动作审计表 ID
   * @returns 任务恢复动作审计表详情
   */
  static async getById(id: number): Promise<TaskResumeRecord> {
    const http = getHttpClient('default');
    const res = await http.get<TaskResumeRecord>(`/task_resume_record/${id}`);
    return res.data;
  }

  /**
   * 保存任务恢复动作审计表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 任务恢复动作审计表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的任务恢复动作审计表
   */
  static async save(payload: TaskResumeRecordPayload): Promise<TaskResumeRecord> {
    const http = getHttpClient('default');
    const res = await http.post<TaskResumeRecord>('/task_resume_record/save', payload);
    return res.data;
  }

  /**
   * 删除任务恢复动作审计表
   * @param id 任务恢复动作审计表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/task_resume_record/${id}`);
  }
}

