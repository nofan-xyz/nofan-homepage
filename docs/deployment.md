# 线上发布记录

- 日期：2026-10-31。
- 入口：https://nofan.xyz/overview。
- 页面源码提交：`0d36b23e0a86`。
- 服务器介绍页：`/var/www/welcome/index.html`。
- 素材版本目录：`/var/www/welcome/assets/releases/0d36b23e0a86/`。
- 使用既有 `/welcome-assets/` 静态映射；发布时重写页面、脚本与数据中的相对资源路径。不修改仓库的本地预览路径。
- 228 个发布文件通过 SHA-256 校验，源站 HTML 与发布包逐字节一致。Cloudflare 会向公网 HTML 注入自己的脚本。
- 两个页面脚本以 `data-cfasync="false"` 避开 Cloudflare Rocket Loader，保持原有 defer 顺序。
- 未修改 Nginx 配置、Mastodon 服务、数据库或 Beta 站；没有开启自动部署。

## 备份与回退

发布前的介绍页及 Nginx 配置备份在 `/var/www/welcome/backups/20261031T054212Z-before-b8043bf5df3c/`。`/var/www/welcome/LAST_HOMEPAGE_BACKUP` 保存该备份目录。

恢复备份中的 `index.html` 时，先复制到 `/var/www/welcome/index.html.next`，设置 644 权限，再原子重命名为 `index.html`。旧版资源目录保留，不必回退 Mastodon。

## 公网验证

真实 Edge 浏览器通过公网 URL 检查：3 个功能切换、32 个表情分组、13 项主题预览、弹窗和键盘导航、移动端菜单及分组选择。1440、1024、768、760、390、360 像素宽度无横向溢出；无页面异常或失败请求。sheep 全组 26 张远程图片加载成功，其余远程表情未逐张验证。登录页和公开实例 API 返回 200。

## 既有环境问题

访客经 Cloudflare 的 HTTPS 访问正常，但 Nginx 当前引用的源站证书于 2024-04-26 到期。源站内容比对是在本机回环连接、跳过证书校验的前提下完成；公网校验使用正常证书验证。源站证书问题需另行处理，本次未更换证书或调整 TLS 配置。
