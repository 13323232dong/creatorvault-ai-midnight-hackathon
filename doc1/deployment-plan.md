# CreatorVault AI - 自有服务器部署计划

## 1. 部署目标

使用自己的服务器部署黑客松 Demo，不使用 Vercel / Netlify。

目标 Demo 地址：

```text
https://creatorvault.ohmycode.cc
```

服务器：

```text
216.36.112.134
```

注意：

- 不把 SSH 密码写进仓库。
- 不把 SSH 密码写进 README。
- 不把服务器敏感信息提交到 GitHub。

## 2. 核心原则

这台服务器已有其他项目，所以部署必须遵守：

- 不修改已有项目目录。
- 不覆盖现有 Nginx 配置。
- 不改动主域名 `ohmycode.cc` 的现有站点。
- 新增独立子域名。
- 新增独立 Nginx 配置文件。
- 新增独立部署目录。
- 每次 reload Nginx 前先 `nginx -t`。
- 所有改动前先备份相关配置。

## 3. 推荐域名方案

首选：

```text
creatorvault.ohmycode.cc
```

备选：

```text
hackathon.ohmycode.cc
midnight.ohmycode.cc
```

DNS 记录：

```text
Type: A
Host: creatorvault
Value: 216.36.112.134
TTL: Auto / 600
```

## 4. 服务器目录规划

源码目录：

```text
/opt/creatorvault-ai
```

静态站点目录：

```text
/var/www/creatorvault-ai
```

Nginx 配置：

```text
/etc/nginx/sites-available/creatorvault-ai.conf
/etc/nginx/sites-enabled/creatorvault-ai.conf
```

日志：

```text
/var/log/nginx/creatorvault-ai.access.log
/var/log/nginx/creatorvault-ai.error.log
```

## 5. 部署方式选择

### 方案 A：纯静态前端

适合：

- 前端 DApp
- viem / 钱包连接
- AI 报告先用 mock
- 不需要后端 API

流程：

```text
npm run build
复制 dist 或 out 到 /var/www/creatorvault-ai
Nginx 直接托管静态文件
```

优点：

- 最稳。
- 最不影响其他项目。
- 不需要占用 Node 端口。
- 评委打开速度快。

建议黑客松优先采用。

### 方案 B：前端 + Node API

适合：

- 需要真实 AI API
- 需要服务器端隐藏 API Key

建议端口：

```text
4311
```

Nginx：

```text
/api -> http://127.0.0.1:4311
/ -> static frontend
```

注意：

- 不使用 3000、5173、8080 这类容易和现有项目冲突的端口。
- 先检查端口占用。

### 方案 C：Docker Compose

适合：

- 需要可复现部署
- 后续项目复杂

compose project name：

```text
creatorvault-ai
```

注意：

- 不使用 host network。
- 明确映射端口。
- 不影响现有容器。

## 6. 上线前检查命令

登录服务器后先做只读检查：

```bash
pwd
hostname
whoami
ls /etc/nginx
ls /etc/nginx/sites-available || true
ls /etc/nginx/conf.d || true
nginx -T | sed -n '1,220p'
ss -tulpn
ls /var/www
ls /opt
```

目的：

- 看 Nginx 使用 `sites-available` 还是 `conf.d`。
- 看已有项目占用哪些域名。
- 看已有服务占用哪些端口。
- 避免误删或覆盖。

## 7. Nginx 静态站点配置草案

如果服务器是 Debian/Ubuntu 风格：

```nginx
server {
    listen 80;
    server_name creatorvault.ohmycode.cc;

    root /var/www/creatorvault-ai;
    index index.html;

    access_log /var/log/nginx/creatorvault-ai.access.log;
    error_log /var/log/nginx/creatorvault-ai.error.log;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用：

```bash
ln -s /etc/nginx/sites-available/creatorvault-ai.conf /etc/nginx/sites-enabled/creatorvault-ai.conf
nginx -t
systemctl reload nginx
```

如果服务器使用 `conf.d`：

```text
/etc/nginx/conf.d/creatorvault-ai.conf
```

## 8. HTTPS 计划

如果服务器已安装 certbot：

```bash
certbot --nginx -d creatorvault.ohmycode.cc
```

如果没有 certbot：

```bash
apt update
apt install -y certbot python3-certbot-nginx
certbot --nginx -d creatorvault.ohmycode.cc
```

注意：

- 只给子域名签证书。
- 不修改主域名证书。
- 证书签发前 DNS 必须解析到服务器。

## 9. 回滚方案

如果部署出问题：

```bash
rm /etc/nginx/sites-enabled/creatorvault-ai.conf
nginx -t
systemctl reload nginx
```

或如果使用 `conf.d`：

```bash
mv /etc/nginx/conf.d/creatorvault-ai.conf /etc/nginx/conf.d/creatorvault-ai.conf.disabled
nginx -t
systemctl reload nginx
```

这不会影响已有项目。

## 10. 正式提交时填写

MLH / 黑客松提交表里 Demo URL 填：

```text
https://creatorvault.ohmycode.cc
```

GitHub URL 填正式参赛仓库。

README 中写：

```text
Live Demo: https://creatorvault.ohmycode.cc
```

## 11. 安全建议

赛前建议完成：

- 改用 SSH key 登录。
- 禁用 root 密码登录，或至少比赛结束后轮换 root 密码。
- 检查防火墙只开放必要端口：22、80、443。
- `.env` 不提交 GitHub。
- API key 不写前端代码。

