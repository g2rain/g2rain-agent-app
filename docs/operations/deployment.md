# 构建与部署

## 前端构建

```bash
npm ci
npm run build
```

产物位于 `dist`，包含启动时可替换的 `env-config.js`。`dist` 已被 Git 忽略，不应提交。

## 镜像

```bash
docker build \
  --build-arg VITE_BUILD_MODE=production \
  -t ghcr.io/g2rain/g2rain-agent-app:1.0.0 \
  .
```

或使用模板脚本：

```bash
./build.sh --image ghcr.io/g2rain/g2rain-agent-app --tag 1.0.0 --build-mode production
```

构建阶段使用 Node 22 Alpine，运行阶段使用 OpenResty Alpine，并从仓库 tar 包离线安装 luaossl。

## 启动示例

```bash
docker run --rm -p 8080:8080 \
  -e SERVER_PORT=8080 \
  -e CONTEXT_PATH=/your-app \
  -e GATEWAY_HOST=gateway \
  -e GATEWAY_PORT=8080 \
  -e IAM_HOST=iam \
  -e IAM_PORT=8080 \
  -e SSO_BASE_URL=https://platform.example.com \
  ghcr.io/g2rain/g2rain-agent-app:1.0.0
```

Dockerfile 仅复制构建产物、`lua/sign.lua`、`lua/sign_api.lua`、`lua/config.lua`、Nginx 模板和入口脚本；它创建空的 `/usr/local/openresty/nginx/lua/keys` 目录，密钥必须以 Secret 或只读 Volume 挂载到该目录。最终镜像不含源码、`package-lock.json`、`.env*` 或 `lua/keys/`。运行时为 OpenResty Alpine，入口为 `/docker-entrypoint.sh`，声明容器端口 `8080`（实际监听端口由 `SERVER_PORT` 控制）。

## GHCR 镜像发布

镜像发布与本地镜像构建共用根目录 `Dockerfile`、Node 22 Alpine 构建阶段、OpenResty Alpine 运行阶段、`VITE_BUILD_MODE`、OCI 参数和启动入口。GitHub Actions 只在推送精确格式 `v<major>.<minor>.<patch>` 的 Git tag 时发布；普通分支、Pull Request 和手动触发均不会发布。工作流会验证 tag 提交已在 `origin/main` 历史、`docs/releases/v<版本>.md` 非空、且 tag 版本与 `package.json` 版本一致，随后执行 `npm ci` 与 `npm run build`。本仓没有独立 unit/e2e/lint 测试脚本，因此 CI 的完整自动验证范围是锁定依赖安装、Vue/TypeScript 类型检查和 Vite 打包，不等同于容器运行、浏览器、服务联调或部署验收。

成功时发布：

- `ghcr.io/g2rain/g2rain-agent-app:<版本>`
- `ghcr.io/g2rain/g2rain-agent-app:sha-<完整提交 SHA>`

不更新 `latest`，不创建 GitHub Release，不部署服务。只有两个标签均已成功推送后才会在 Actions Summary 记录发布成功；登录成功、镜像构建成功或部分 layer 上传均不代表发布完成。

首次成功推送后，如需匿名拉取，在 GitHub **Packages → g2rain-agent-app → Package settings → Change visibility → Public** 将包设为 Public；组织管理员禁止修改时，请联系管理员。已有 GHCR 包即使工作流具有 `packages: write`，仍可能需要在 **Package settings → Actions access** 授予 `g2rain/g2rain-agent-app` 写权限；遇到 `denied` 时优先检查该设置和组织 Packages 策略。公开后可运行：

```bash
docker pull ghcr.io/g2rain/g2rain-agent-app:1.0.0
```

私有包需要使用具有 `read:packages` 权限的凭据登录。匿名拉取、在线演示与实际部署验证是独立事项，不能由本地构建或 CI 构建推定。

## Nginx 路径

- `${CONTEXT_PATH}/api/` → Gateway 根路径。
- `${CONTEXT_PATH}/auth/` → IAM `/auth/`。
- `${CONTEXT_PATH}/doc/` → Gateway。
- `${CONTEXT_PATH}/lua/sign_code` → Lua 签名处理。
- 其他路径 → 静态资源和 SPA `index.html` 回退。

修改代理规则时验证 Context Path rewrite 后的实际上游路径，避免多删或多加一段服务前缀。

## 部署前检查

- `npm run build` 通过。
- 镜像可以在目标架构构建，luaossl 加载成功。
- `SERVER_PORT` 与 Service/Ingress 健康检查端口一致。
- `VITE_CONTEXT_PATH`、`CONTEXT_PATH`、main-shell entry/activeRule 一致。
- Gateway/IAM DNS、端口、网络策略和证书正确。
- SSO Redirect URI 与公开域名一致。
- 资源配置已导入，应用编码与 `VITE_APPLICATION_CODE` 一致。
- 静态资源、刷新路由、独立登录、qiankun mount/update/unmount 均验证。
- 日志和镜像层不包含 Token、Client 私钥或生产密钥；确认由部署 Secret/Volume 注入 Lua/IAM 密钥。

## 回滚

镜像使用不可变版本 Tag，保留上一个可用镜像和对应资源配置。模板升级可能同时改变前端产物与平台资源，回滚前确认两者兼容，不能只回滚镜像而保留不兼容的页面/权限配置。
