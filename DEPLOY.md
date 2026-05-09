# 英语能力测评与课程服务系统 - 部署指南

## 目录
- [系统概述](#系统概述)
- [环境要求](#环境要求)
- [快速启动](#快速启动)
- [详细配置](#详细配置)
- [数据库设置](#数据库设置)
- [生产环境部署](#生产环境部署)
- [常见问题](#常见问题)

---

## 系统概述

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        移动端 (Expo)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  家长端   │  │  教师端   │  │  访客H5  │  │  小程序   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API 网关 (Express)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  认证服务 │  │  测评服务 │  │  课程服务 │  │  考试服务 │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  AI服务  │  │  支付服务 │  │  通知服务 │  │ 企业微信 │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         数据层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ PostgreSQL│  │   Redis  │  │ 对象存储  │  │   CDN    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| 移动端 | React Native (Expo) | SDK 54 |
| 后端 | Express.js + TypeScript | Node 18+ |
| 数据库 | PostgreSQL | 15+ |
| 缓存 | Redis | 7+ |
| AI服务 | 科大讯飞ISE / 通义千问 | - |
| 支付 | 微信支付 | - |
| 企业微信 | 企业微信API | - |

---

## 环境要求

### 开发环境

| 软件 | 要求 | 安装方式 |
|------|------|----------|
| Node.js | >= 18.0.0 | [官网下载](https://nodejs.org/) |
| pnpm | >= 8.0.0 | `npm install -g pnpm` |
| PostgreSQL | >= 15.0 | [官网下载](https://www.postgresql.org/) |
| Git | 最新版本 | [官网下载](https://git-scm.com/) |

### 生产环境

| 资源 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 2核 | 4核+ |
| 内存 | 4GB | 8GB+ |
| 磁盘 | 50GB | 100GB+ SSD |
| 系统 | Ubuntu 20.04+ / CentOS 7+ | Ubuntu 22.04 LTS |

---

## 快速启动

### 1. 克隆项目

```bash
cd /workspace/projects
git clone <repository-url> english-learning-platform
cd english-learning-platform
```

### 2. 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 安装前后端依赖
pnpm -w install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp server/.env.example server/.env
cp client/.env.example client/.env

# 编辑服务端配置
vim server/.env

# 编辑客户端配置
vim client/.env
```

### 4. 初始化数据库

```bash
# 连接 PostgreSQL
psql -U postgres -h localhost

# 创建数据库
CREATE DATABASE english_platform;

# 退出 psql
\q

# 执行数据库迁移
psql -U postgres -d english_platform -f server/src/db/migrations/001_init.sql

# 导入测试数据（可选）
psql -U postgres -d english_platform -f server/src/db/migrations/002_seed_data.sql
```

### 5. 启动服务

```bash
# 开发模式（同时启动前后端）
pnpm dev

# 或分别启动
pnpm dev:server  # 启动后端 (端口 9091)
pnpm dev:client # 启动前端 (端口 5000)
```

### 6. 验证安装

```bash
# 测试后端API
curl http://localhost:9091/api/v1/health

# 运行API测试脚本
./server/scripts/test-api.sh
```

---

## 详细配置

### 环境变量说明

#### 服务端 (`server/.env`)

```bash
# ===========================================
# 服务端必需配置
# ===========================================

# 服务端口
PORT=9091
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=english_platform
DB_USER=postgres
DB_PASSWORD=your_password

# JWT密钥 (生成命令: openssl rand -hex 32)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# ===========================================
# 微信支付配置
# ===========================================

WECHAT_MCHID=your_merchant_id
WECHAT_MCHKEY=your_merchant_key
WECHAT_MCHSERIALNO=your_serial_no
WECHAT_PRIVATEKEYPATH=./certs/apiclient_key.pem
WECHAT_CALLBACK_URL=http://your-domain.com/api/v1/payment/notify

# ===========================================
# 第三方API配置
# ===========================================

# 科大讯飞语音评测
IFLYTEK_APP_ID=your_app_id
IFLYTEK_API_KEY=your_api_key
IFLYTEK_API_SECRET=your_api_secret

# 通义千问AI
QWEN_API_KEY=your_api_key
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation

# ===========================================
# 企业微信配置
# ===========================================

WECOM_CORPID=your_corp_id
WECOM_CORPSECRET=your_corp_secret
WECOM_AGENTID=your_agent_id

# ===========================================
# 缓存配置
# ===========================================

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# ===========================================
# 对象存储配置
# ===========================================

OSS_ACCESS_KEY_ID=your_access_key
OSS_ACCESS_KEY_SECRET=your_access_secret
OSS_BUCKET=your_bucket_name
OSS_REGION=oss-cn-hangzhou
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
```

#### 客户端 (`client/.env`)

```bash
# ===========================================
# 客户端配置
# ===========================================

# 后端API地址
EXPO_PUBLIC_BACKEND_BASE_URL=http://localhost:9091

# 微信小程序 AppID
EXPO_PUBLIC_WECHAT_APP_ID=your_wechat_app_id

# 讯飞语音评测 App ID
EXPO_PUBLIC_IFLYTEK_APP_ID=your_app_id
```

### 获取配置凭证

#### 微信支付
1. 注册微信商户平台账号
2. 申请微信支付能力
3. 获取商户号和API密钥
4. 配置支付回调地址

#### 科大讯飞
1. 注册讯飞开放平台账号
2. 创建应用并开通「语音合成」和「语音评测」服务
3. 获取 AppID、API Key、API Secret

#### 通义千问
1. 注册阿里云百炼平台
2. 开通模型服务
3. 获取 API Key

#### 企业微信
1. 登录企业微信管理后台
2. 创建自建应用
3. 获取 CorpID、AgentID、Secret

---

## 数据库设置

### 创建数据库

```sql
-- 连接 PostgreSQL
psql -U postgres -h localhost

-- 创建数据库
CREATE DATABASE english_platform OWNER postgres;

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE english_platform TO postgres;
```

### 执行迁移

```bash
# 完整迁移
psql -U postgres -d english_platform -f server/src/db/migrations/001_init.sql

# 导入测试数据（开发环境）
psql -U postgres -d english_platform -f server/src/db/migrations/002_seed_data.sql
```

### 测试数据

导入 `002_seed_data.sql` 后，系统包含：

| 数据类型 | 数量 | 说明 |
|----------|------|------|
| 用户(家长) | 10 | 测试账户: 13800138001 ~ 13800138010 |
| 学员(孩子) | 10 | 不同年龄段和级别 |
| 试题 | 50 | Pre-A1/A1/A2 各级别 |
| 考试中心 | 10 | 覆盖主要城市 |
| 课程 | 10 | 各类型课程 |
| 测评报告 | 5 | 学员测评结果 |
| 模拟考试记录 | 5 | 测试记录 |
| 备考计划 | 3 | 学习计划 |
| 支付订单 | 4 | 各类订单 |
| 课后报告 | 3 | 教师评估 |
| 二维码渠道 | 7 | 渠道追踪 |

---

## 生产环境部署

### 前端部署

#### Expo (移动应用)

```bash
# 构建 Android APK
cd client
eas build --platform android --profile preview

# 构建 iOS (需要 Apple 开发者账号)
eas build --platform ios --profile production

# 发布到 Expo
eas submit --platform android --latest
eas submit --platform ios --latest
```

#### H5 落地页

```bash
# 构建
cd h5
npm run build

# 部署到 Nginx
cp -r dist/* /var/www/html/
nginx -s reload
```

### 后端部署

#### PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
cd server
pm2 start dist/index.js --name english-api

# 配置开机自启
pm2 save
pm2 startup

# 查看日志
pm2 logs english-api
```

#### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 9091
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "9091:9091"
    environment:
      - NODE_ENV=production
    env_file:
      - server/.env
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: english_platform
      POSTGRES_PASSWORD: your_password
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./server/src/db/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### Nginx 配置

```nginx
# /etc/nginx/sites-available/english-api

server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:9091;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name h5.your-domain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTPS 配置 (使用 Let's Encrypt)
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

    # ... 同上配置
}
```

### 环境变量配置

生产环境**必须**设置以下变量：

```bash
# .env.production
NODE_ENV=production
PORT=9091

# 数据库 - 使用生产数据库
DB_HOST=prod-db-host
DB_PORT=5432
DB_NAME=english_platform_prod
DB_USER=prod_user
DB_PASSWORD=<from-secrets-manager>

# JWT - 生产密钥
JWT_SECRET=<from-secrets-manager>

# 微信支付 - 生产配置
WECHAT_MCHID=<from-secrets-manager>
WECHAT_MCHKEY=<from-secrets-manager>
```

---

## 常见问题

### 1. 数据库连接失败

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案**：
- 确认 PostgreSQL 服务已启动
- 检查 `pg_hba.conf` 配置允许连接
- 验证用户名密码正确

### 2. 端口被占用

```
Error: listen EADDRINUSE :::9091
```

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :9091

# 杀掉进程
kill -9 <PID>

# 或修改端口
PORT=9092
```

### 3. 微信支付回调失败

**检查项**：
- 回调地址是否公网可访问
- 微信商户平台配置的回调地址是否正确
- 证书路径是否正确
- 签名验证是否通过

### 4. 讯飞API调用失败

**检查项**：
- AppID、API Key、API Secret 是否正确
- 账户余额是否充足
- 网络是否能访问讯飞服务器

### 5. CORS 跨域问题

**检查项**：
- 后端 `cors` 配置是否包含前端域名
- 微信小程序是否配置了合法域名
- HTTPS 证书是否有效

### 6. 构建失败

```bash
# 清理缓存
cd client
rm -rf node_modules/.cache
rm -rf .expo

# 重新安装
pnpm install

# 预编译
npx expo prebuild
```

---

## API 测试

### 运行所有测试

```bash
# 设置环境变量
export API_BASE_URL=http://localhost:9091/api/v1

# 运行测试
./server/scripts/test-api.sh
```

### 测试特定模块

```bash
# 只测试认证
./server/scripts/test-api.sh -s auth

# 只测试支付
./server/scripts/test-api.sh -s payment

# 详细输出模式
./server/scripts/test-api.sh -v
```

---

## 运维命令

```bash
# 查看服务状态
pm2 status

# 重启服务
pm2 restart english-api

# 查看日志
pm2 logs english-api --lines 100

# 监控资源使用
pm2 monit

# 更新代码后重载
pm2 reload english-api
```

---

## 联系支持

如有问题，请联系：
- 技术支持邮箱: support@your-domain.com
- 开发团队: dev@your-domain.com
