/** JSON 编辑器的外部诊断，区间为文档字符偏移 */
export interface JsonDiagnostic {
  from: number;
  to: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
}
