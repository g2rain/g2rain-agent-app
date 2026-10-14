/**
 * 控制台公共能力：网关前缀、业务枚举、状态语义、动作名与格式化。
 * 只含常量与纯函数，不含页面组件，不调用业务 API。
 */
export { Gateway } from './gateway';
export * from './enums';
export { describeStatus } from './status';
export { actionLabel, isBuiltinAction } from './action';
export { EMPTY, shortId, formatDuration, toEpoch, elapsed, formatClock, parseJson, fill, fromNow } from './format';
