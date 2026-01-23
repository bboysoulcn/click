# iine-python 项目总结

## 📁 项目结构

```
iine-python/
├── app/                          # 应用主目录
│   ├── __init__.py              # 包初始化
│   ├── config.py                # 配置管理
│   ├── database.py              # 数据库连接
│   ├── models.py                # SQLAlchemy 模型
│   ├── schemas.py               # Pydantic 模式
│   ├── routes.py                # API 路由
│   ├── rate_limit.py            # 速率限制中间件
│   └── main.py                  # FastAPI 应用入口
│
├── alembic/                      # 数据库迁移
│   ├── versions/                # 迁移版本
│   │   └── 001_initial_migration.py
│   ├── env.py                   # Alembic 环境配置
│   └── script.py.mako           # 迁移模板
│
├── static/                       # 静态文件
│   ├── iine.js                  # JavaScript 客户端
│   ├── iine.css                 # 样式文件
│   └── index.html               # 演示页面
│
├── requirements.txt              # Python 依赖
├── .env.example                 # 环境变量示例
├── alembic.ini                  # Alembic 配置
│
├── Dockerfile                    # Docker 镜像
├── docker-compose.yml           # Docker Compose 配置
├── nginx.conf                   # Nginx 反向代理配置
│
├── setup.sh                     # 自动安装脚本
├── start.sh                     # 启动脚本
├── entrypoint.sh               # Docker 入口脚本
├── healthcheck.py              # 健康检查脚本
│
├── README.md                    # 完整文档
├── QUICKSTART.md               # 快速开始指南
└── LICENSE                      # 开源协议
```

## 🎯 核心功能

### 1. 后端 API (FastAPI)

**文件**: `app/main.py`, `app/routes.py`

- ✅ RESTful API 接口
- ✅ 异步处理 (async/await)
- ✅ 自动 API 文档 (Swagger/ReDoc)
- ✅ CORS 跨域支持
- ✅ 错误处理

**API 端点**:
- `GET /` - 欢迎页面
- `GET /api/status` - 健康检查
- `POST /api/get_hits` - 批量获取计数
- `POST /api/increment_hits` - 增加计数

### 2. 数据库层 (PostgreSQL + SQLAlchemy)

**文件**: `app/database.py`, `app/models.py`

- ✅ 异步数据库连接 (asyncpg)
- ✅ ORM 模型定义
- ✅ 自动时间戳
- ✅ 域名和路径规范化
- ✅ 数据验证约束

**数据表**:
- `counters` - 计数存储
- `rate_limits` - 速率限制记录

### 3. 数据库迁移 (Alembic)

**文件**: `alembic/`, `alembic.ini`

- ✅ 版本控制的数据库 schema
- ✅ 自动迁移生成
- ✅ 向上/向下迁移支持

### 4. 速率限制 (Redis)

**文件**: `app/rate_limit.py`

- ✅ 基于 IP 的速率限制
- ✅ 可配置的限制窗口
- ✅ Redis 缓存支持
- ✅ 优雅降级（Redis 不可用时）

### 5. 前端客户端 (JavaScript)

**文件**: `static/iine.js`

- ✅ 纯 Vanilla JavaScript (无依赖)
- ✅ 支持多种图标 (heart, thumbs_up, upvote)
- ✅ 自定义 emoji 支持
- ✅ LocalStorage 持久化
- ✅ 批量请求优化
- ✅ 无障碍访问 (ARIA)
- ✅ 键盘导航支持
- ✅ 乐观更新 UI

### 6. 样式 (CSS)

**文件**: `static/iine.css`

- ✅ 响应式设计
- ✅ 深色模式支持
- ✅ 悬停动画
- ✅ 点击动画
- ✅ 减少动画选项（可访问性）

### 7. 演示页面

**文件**: `static/index.html`

- ✅ 完整功能展示
- ✅ 多种按钮示例
- ✅ 使用指南
- ✅ 响应式布局

## 🛠️ 技术栈

```infographic
infographic list-grid-badge-card
data
  title Technology Stack
  items
    - label Backend
      desc FastAPI + Uvicorn
      icon mdi:language-python
    - label Database
      desc PostgreSQL 15
      icon mdi:database
    - label ORM
      desc SQLAlchemy 2.0
      icon mdi:database-cog
    - label Cache
      desc Redis 7
      icon mdi:memory
    - label Frontend
      desc Vanilla JavaScript
      icon mdi:language-javascript
    - label Container
      desc Docker + Compose
      icon mdi:docker
    - label Proxy
      desc Nginx
      icon mdi:server-network
    - label Migration
      desc Alembic
      icon mdi:database-arrow-right
```

## 🔒 隐私和安全特性

1. **零追踪**
   - ❌ 不存储 IP 地址
   - ❌ 不存储用户代理
   - ❌ 不存储时间戳（除创建/更新时间）
   - ✅ 仅存储计数器

2. **速率限制**
   - ✅ 基于时间窗口的限制
   - ✅ IP 地址哈希化存储
   - ✅ 自动过期清理

3. **输入验证**
   - ✅ 域名长度检查（≤255）
   - ✅ Slug 长度检查（≤1024）
   - ✅ 字符白名单验证
   - ✅ SQL 注入防护（ORM）

4. **CORS 安全**
   - ✅ 可配置的允许源
   - ✅ 仅允许必要的 HTTP 方法

## 🚀 部署选项

### 选项 1: Docker (推荐)

```bash
docker-compose up -d
```

包含:
- FastAPI 应用
- PostgreSQL 数据库
- Redis 缓存
- Nginx 反向代理

### 选项 2: 本地开发

```bash
./setup.sh   # 自动设置
./start.sh   # 启动服务
```

### 选项 3: 生产环境

使用 `nginx.conf` 配置反向代理，支持:
- SSL/TLS 终止
- 静态文件缓存
- 速率限制
- 负载均衡

## 📊 性能特性

1. **异步处理**
   - 所有数据库操作异步
   - 并发请求处理
   - 非阻塞 I/O

2. **批量查询**
   - 单次请求获取多个页面计数
   - 减少网络往返

3. **缓存策略**
   - Redis 速率限制缓存
   - 静态文件浏览器缓存
   - 数据库连接池

4. **优化的数据库**
   - 复合主键索引
   - 高效的 UPSERT 操作
   - 最小化查询数量

## 🔧 配置选项

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接 URL | 必需 |
| `REDIS_URL` | Redis 连接 URL | `redis://localhost:6379/0` |
| `ALLOWED_ORIGINS` | CORS 允许源 | `*` |
| `RATE_LIMIT_REQUESTS` | 速率限制请求数 | `60` |
| `RATE_LIMIT_WINDOW` | 限制时间窗口（秒） | `3600` |
| `DEBUG` | 调试模式 | `False` |
| `HOST` | 服务器主机 | `0.0.0.0` |
| `PORT` | 服务器端口 | `8000` |

## 🧪 测试和健康检查

### 健康检查脚本

```bash
python healthcheck.py
```

检查:
- ✅ 数据库连接
- ✅ 必需表存在
- ✅ Redis 连接（可选）

### API 文档

开发模式下访问:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📝 使用示例

### 基础用法

```html
<!-- 引入脚本 -->
<script defer src="http://localhost:8000/static/iine.js"></script>

<!-- 添加按钮 -->
<button class="iine-button" aria-hidden="true"></button>

<!-- 可选：引入样式 -->
<link rel="stylesheet" href="http://localhost:8000/static/iine.css">
```

### 自定义图标

```html
<!-- 内置图标 -->
<button class="iine-button" data-icon="heart"></button>
<button class="iine-button" data-icon="thumbs_up"></button>
<button class="iine-button" data-icon="upvote"></button>

<!-- 自定义 emoji -->
<button class="iine-button" data-icon="🎉"></button>
<button class="iine-button" data-icon="💯"></button>
```

### 多页面追踪

```html
<button class="iine-button" data-slug="/blog/post-1"></button>
<button class="iine-button" data-slug="/blog/post-2"></button>
```

## 🎨 自定义样式

```css
.iine-button {
    /* 自定义你的样式 */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
}

.iine-button:hover {
    transform: scale(1.05);
}

.iine-button.clicked {
    background: #48bb78;
}
```

## 🐛 故障排除

### 数据库连接失败
```bash
# 检查 PostgreSQL 是否运行
psql -U postgres -c "SELECT 1"

# 创建数据库
createdb iine
```

### Redis 连接失败
```bash
# 检查 Redis 是否运行
redis-cli ping

# 启动 Redis
redis-server
```

### 端口已被占用
编辑 `.env` 修改 `PORT` 值

## 📚 扩展功能建议

可以添加的功能:
1. 管理后台 - 查看统计数据
2. 导出功能 - CSV/JSON 格式
3. 通知系统 - 达到里程碑时通知
4. 分析功能 - 趋势图表
5. API 密钥 - 更细粒度的访问控制
6. Webhook - 触发外部事件

## 🤝 与原项目的对比

| 特性 | 原项目 (Supabase) | 本项目 (Python) |
|------|------------------|----------------|
| 后端 | Supabase (PaaS) | FastAPI (自托管) |
| 数据库 | PostgreSQL (Supabase) | PostgreSQL (任意) |
| 速率限制 | PostgreSQL 函数 | Redis + Python |
| 部署 | 云服务 | Docker / 本地 |
| 成本 | 免费额度限制 | 完全免费（自托管） |
| 灵活性 | 受限于 Supabase | 完全可定制 |

## 📄 许可证

本项目采用 GNU Affero General Public License v3.0 (AGPL-3.0)

## 🙏 致谢

- 灵感来源: [welpo/iine](https://github.com/welpo/iine)
- 构建工具: FastAPI, SQLAlchemy, PostgreSQL, Redis

---

**开发完成时间**: 2026-01-22  
**项目状态**: ✅ 生产就绪

欢迎贡献和提出建议！
