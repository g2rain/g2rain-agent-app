/**
 * 控制台通用的显示格式化。
 *
 * @example
 * shortId('9b1c31bd180d4b26a591f6eec1f2089b'); // '9b1c31bd'
 * formatDuration(12800);                       // '12.8 s'
 * elapsed('2026-10-12 10:08:31', '2026-10-12 10:09:11'); // 40000
 * fill('{n} 次调用', { n: 3 });                // '3 次调用'
 */
import { t } from '@platform/i18n';

/** 空值占位 */
export const EMPTY = '—';

/** 业务 ID 截短显示 */
export function shortId(id: string | null | undefined, length = 8): string {
  return id ? id.slice(0, length) : EMPTY;
}

/** 耗时：<1 s 显示 ms，<1 min 显示一位小数秒，否则显示分秒 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return EMPTY;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return `${minutes} m ${String(seconds).padStart(2, '0')} s`;
}

/** 解析后端时间（`YYYY-MM-DD HH:mm:ss`）为毫秒；无法解析返回 undefined */
export function toEpoch(time: string | null | undefined): number | undefined {
  if (!time) return undefined;
  const value = Date.parse(time.replace(' ', 'T'));
  return Number.isNaN(value) ? undefined : value;
}

/** 两个时间之间的毫秒数；任一缺失返回 undefined */
export function elapsed(start: string | null | undefined, end: string | null | undefined): number | undefined {
  const from = toEpoch(start);
  const to = toEpoch(end);
  return from === undefined || to === undefined ? undefined : Math.max(0, to - from);
}

/** 只显示时分秒 */
export function formatClock(time: string | null | undefined): string {
  if (!time) return EMPTY;
  const match = /(\d{2}:\d{2}:\d{2})/.exec(time);
  return match ? match[1] : time;
}

/** 安全解析 JSON 字符串；非法或为空时返回 fallback */
export function parseJson<T>(text: string | null | undefined, fallback: T): T {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

/** 用 `{name}` 占位符填充文案，常用于带参数的国际化文本 */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

/**
 * 相对时间（刚刚 / N 分钟前 / N 小时前 / N 天前），超过 30 天显示日期。
 * 文案经国际化，调用方传入 now 便于测试。
 */
export function fromNow(time: string | null | undefined, now = Date.now()): string {
  const at = toEpoch(time);
  if (at === undefined) return EMPTY;
  const minutes = Math.floor((now - at) / 60_000);
  if (minutes < 1) return t('AGENT_TIME_JUST_NOW', '刚刚');
  if (minutes < 60) return fill(t('AGENT_TIME_MINUTES_AGO', '{n} 分钟前'), { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return fill(t('AGENT_TIME_HOURS_AGO', '{n} 小时前'), { n: hours });
  const days = Math.floor(hours / 24);
  if (days <= 30) return fill(t('AGENT_TIME_DAYS_AGO', '{n} 天前'), { n: days });
  return time!.slice(0, 10);
}
