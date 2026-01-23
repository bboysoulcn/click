# iine - 点赞按钮系统

![Python Version](https://img.shields.io/badge/python-3.9%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-green)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue)

一个基于 Python 实现的 [iine](https://github.com/welpo/iine) - 注重隐私的网页点赞/喜欢按钮系统，适用于博客、数字花园、作品集或任何网站。无需注册账号，不追踪用户。

## ✨ 特性

- 🔒 **隐私优先**: 不存储 IP、时间戳或任何追踪数据
- ⚡ **轻量级**: 纯 JavaScript 客户端，约 7KB 未压缩
- 🎨 **可自定义**: 内置图标（心形、点赞、投票）+ 支持自定义 emoji
- ♿ **无障碍访问**: 语义化 HTML、ARIA 属性、键盘导航
- 🚀 **自托管**: 完全控制你的数据
- 🛡️ **速率限制**: 内置防滥用保护
- 🐍 **Python 后端**: FastAPI + PostgreSQL + SQLAlchemy
- 📊 **批量查询**: 一次请求获取多个页面的计数

## 🏗️ 技术架构

- **后端**: FastAPI + Uvicorn
- **数据库**: PostgreSQL + SQLAlchemy 2.0
- **速率限制**: 内存缓存（PostgreSQL 存储）
- **前端**: 纯 JavaScript（无依赖）
- **部署**: Docker + Docker Compose

## 🚀 快速开始

### 环境要求

- Python 3.9+
- PostgreSQL 12+

或者直接使用 Docker！

### 方式 1: Docker（推荐）

```bash
# 1. 克隆项目
cd iine-python

# 2. 复制环境配置文件
cp .env.example .env
# 编辑 .env 文件，设置数据库密码等

# 3. 启动所有服务
docker-compose up -d

# 4. 运行数据库迁移
docker-compose exec app alembic upgrade head

# 5. 访问演示页面
# 打开浏览器访问 http://localhost:8000
```

完成！🎉

### 方式 2: 本地开发

```bash
# 1. 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接

# 4. 运行数据库迁移
alembic upgrade head

# 5. 启动服务器
python -m app.main
# 或使用启动脚本: ./start.sh
```

访问 http://localhost:8000 查看演示页面！

## 📝 在你的网站中使用

### 1. 引入脚本

```html
<script defer src="http://你的域名.com/static/iine.js"></script>
```

### 2. 添加按钮

```html
<button class="iine-button" aria-hidden="true"></button>
```

### 3. 添加样式（可选）

```html
<link rel="stylesheet" href="http://你的域名.com/static/iine.css">
```

就这么简单！按钮会自动显示心形图标和当前计数。

## 🎨 自定义

### 使用不同的图标

```html
<!-- 内置图标: heart, thumbs_up, upvote -->
<button class="iine-button" data-icon="heart" aria-hidden="true"></button>
<button class="iine-button" data-icon="thumbs_up" aria-hidden="true"></button>
<button class="iine-button" data-icon="upvote" aria-hidden="true"></button>

<!-- 任意 emoji -->
<button class="iine-button" data-icon="💯" aria-hidden="true"></button>
<button class="iine-button" data-icon="🎉" aria-hidden="true"></button>
```

### 同一页面多个按钮

```html
<!-- 使用自定义 slug 追踪不同页面/部分 -->
<button class="iine-button" data-slug="/custom-page" aria-hidden="true"></button>
<button class="iine-button" data-slug="/section-1" aria-hidden="true"></button>
```

### 自定义标签

```html
<button class="iine-button" aria-label="喜欢这篇文章" aria-hidden="true"></button>
```

## 🔧 配置

### 环境变量

在 `.env` 文件中配置：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接 URL | 必需 |
| `HOST` | 服务器主机地址 | `0.0.0.0` |
| `PORT` | 服务器端口 | `8000` |
| `DEBUG` | 调试模式 | `False` |
| `ALLOWED_ORIGINS` | CORS 允许的源（逗号分隔） | `*` |
| `RATE_LIMIT_REQUESTS` | 速率限制：每小时最大请求数 | `60` |
| `RATE_LIMIT_WINDOW` | 速率限制：时间窗口（秒） | `3600` |

### 修改 API 地址

编辑 `static/iine.js` 中的配置：

```javascript
const API_URL = 'http://你的域名.com/api';
```

## 📊 API 接口

### GET `/api/status`

健康检查接口。

**响应:**
```json
{
  "status": "live",
  "version": "1.0.0"
}
```

### POST `/api/get_hits`

批量获取页面点击数。

**请求:**
```json
{
  "page_slugs": ["/page1", "/page2", "/page3"]
}
```

**响应:**
```json
{
  "/page1": 42,
  "/page2": 17,
  "/page3": 0
}
```

### POST `/api/increment_hits`

增加页面点击数。

**请求:**
```json
{
  "page_slug": "/my-page"
}
```

**响应:**
```json
{
  "message": "example.com/my-page liked! ♥️",
  "new_count": 43
}
```

## 🐳 Docker 部署

项目包含完整的 Docker 配置：

```yaml
# docker-compose.yml
services:
  app:      # FastAPI 应用
  db:       # PostgreSQL 数据库
  nginx:    # Nginx 反向代理（可选）
```

**常用命令:**

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 运行数据库迁移
docker-compose exec app alembic upgrade head
```

## 🗄️ 数据库

### 数据表结构

#### `counters` 表

| 字段 | 类型 | 说明 |
|------|------|------|
| `origin_domain` | VARCHAR(255) | 规范化的域名（主键） |
| `slug` | VARCHAR(1024) | 规范化的页面路径（主键） |
| `counter` | BIGINT | 点击计数 |
| `created_ts` | TIMESTAMP | 创建时间 |
| `updated_ts` | TIMESTAMP | 最后更新时间 |

#### `rate_limits` 表

| 字段 | 类型 | 说明 |
|------|------|------|
| `identifier_hash` | BIGINT | 客户端标识符哈希（主键） |
| `request_count` | BIGINT | 请求计数 |
| `created_at` | TIMESTAMP | 创建时间 |

### 数据库迁移

使用 Alembic 管理数据库版本：

```bash
# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1

# 生成新迁移
alembic revision --autogenerate -m "描述"
```

## 🛡️ 安全特性

- **速率限制**: 每小时每 IP 60 次请求（可配置）
- **输入验证**: 所有输入都经过验证和清理
- **无用户追踪**: 不存储 IP、User-Agent 或时间戳
- **CORS 配置**: 可配置允许的源
- **SQL 注入防护**: 使用 SQLAlchemy ORM 参数化查询

## 🎨 自定义样式

包含的 CSS 提供了干净、易访问的设计：

- 深色模式支持
- 悬停效果
- 点击动画
- 减少动画支持（可访问性）
- 键盘焦点指示器

自定义 `.iine-button` 类以匹配你网站的设计：

```css
.iine-button {
    /* 你的自定义样式 */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
}
```

## 🔍 监控和调试

### 健康检查

```bash
# 运行健康检查脚本
python healthcheck.py
```

### API 文档

开发模式下访问自动生成的 API 文档：
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐛 故障排除

### 数据库连接失败

```bash
# 检查 PostgreSQL 是否运行
psql -U postgres -c "SELECT 1"

# 创建数据库
createdb iine
```

### 端口已被占用

编辑 `.env` 文件修改 `PORT` 值。

### 迁移失败

```bash
# 查看当前迁移状态
alembic current

# 查看迁移历史
alembic history

# 重置到特定版本
alembic downgrade <版本号>
```

## 📁 项目结构

```
iine-python/
├── app/                    # 应用主目录
│   ├── config.py          # 配置管理
│   ├── database.py        # 数据库连接
│   ├── models.py          # 数据模型
│   ├── schemas.py         # 请求/响应模式
│   ├── routes.py          # API 路由
│   ├── rate_limit.py      # 速率限制
│   └── main.py            # 应用入口
├── alembic/               # 数据库迁移
│   └── versions/          # 迁移版本
├── static/                # 静态文件
│   ├── iine.js           # JavaScript 客户端
│   ├── iine.css          # 样式文件
│   └── index.html        # 演示页面
├── docker-compose.yml    # Docker Compose 配置
├── Dockerfile            # Docker 镜像
├── requirements.txt      # Python 依赖
└── .env.example         # 环境变量示例
```

## 🤝 与原项目对比

| 特性 | 原项目 (Supabase) | 本项目 (Python) |
|------|------------------|----------------|
| 后端 | Supabase (PaaS) | FastAPI (自托管) |
| 数据库 | PostgreSQL (Supabase) | PostgreSQL (任意) |
| 速率限制 | PostgreSQL 函数 | 内存 + PostgreSQL |
| 部署 | 云服务依赖 | Docker / 本地 |
| 成本 | 免费额度限制 | 完全免费（自托管） |
| 灵活性 | 受限于平台 | 完全可定制 |
| 语言 | JavaScript | Python |

## 📈 性能优化

1. **异步处理**: 所有数据库操作都是异步的
2. **批量查询**: 一次请求获取多个页面计数
3. **连接池**: 数据库连接池优化
4. **高效索引**: 复合主键和索引优化查询
5. **UPSERT 操作**: 使用 PostgreSQL 的 ON CONFLICT 高效更新

## 🌍 生产环境部署建议

1. **设置环境变量**
   - 将 `DEBUG=False`
   - 设置强密码
   - 配置 `ALLOWED_ORIGINS` 为你的域名

2. **使用 Nginx**
   - SSL/TLS 终止
   - 静态文件缓存
   - 请求限流

3. **数据库优化**
   - 定期清理过期的 rate_limits 记录
   - 设置数据库备份
   - 监控数据库性能

4. **日志和监控**
   - 配置日志收集
   - 设置性能监控
   - 配置告警系统

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📄 许可证

本项目采用 GNU Affero General Public License v3.0 (AGPL-3.0) 许可证。

详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 灵感来源: [welpo/iine](https://github.com/welpo/iine)
- 使用框架: [FastAPI](https://fastapi.tiangolo.com/)
- 图标来源: 各种开源资源

## 📧 支持

如有问题、疑问或建议：
- 在 GitHub 上提交 Issue
- 查看原项目 [文档](https://github.com/welpo/iine)

---

用 ❤️ 和 Python 构建
