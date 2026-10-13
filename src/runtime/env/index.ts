/**
 * create-g2rain-app 会替换本文件中的 g2rain-agent-app（见 g2rain-app-cli）。
 * 业务代码请使用 `@shared/env` 的 `env`。
 */
export const PROJECT_NAME = 'g2rain-agent-app';

export {
  env,
  getPathWithContextPath,
  isMockEnabled,
  type SharedEnv,
} from '@shared/env';
