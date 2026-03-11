# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Click is a privacy-focused like/click button system for websites. Users can add buttons to their pages that track click counts without storing user data (no IPs, timestamps, or tracking).

**Tech Stack:**
- Backend: FastAPI + Uvicorn
- Database: PostgreSQL + SQLAlchemy 2.0 (async)
- Frontend: Pure JavaScript (~7KB), no dependencies
- Deployment: Docker + Docker Compose

## Development Commands

### Local Development

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server (auto-reload)
python -m app.main
```

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Run database migrations
docker-compose exec app alembic upgrade head

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history

# Check current version
alembic current
```

## Architecture

### Request Flow

1. **Client-side (JavaScript):** Sends requests from user's browser
2. **CORS Check:** Validates origin from `Origin` or `Referer` header
3. **Rate Limiting:** Memory cache + PostgreSQL hybrid check
4. **Domain/Slug Canonicalization:** Normalizes input before database operations
5. **Database:** UPSERT using PostgreSQL `ON CONFLICT` for atomic counter updates

### Key Components

**`app/routes.py`** - API endpoints:
- `POST /api/get_hits` - Batch retrieve counts (max 20 slugs)
- `POST /api/increment_hits` - Increment counter with rate limiting
- `GET /api/status` - Health check

**`app/models.py`** - Database models:
- `Counter` - Stores click counts with composite primary key (origin_domain, slug)
- `RateLimit` - Stores rate limit data by hashed identifier

**`app/rate_limit.py`** - Hybrid rate limiting:
- Memory cache for fast lookups
- PostgreSQL as persistent store
- Client identifier from Cloudflare headers → X-Forwarded-For → client IP
- Time-based hashing for hourly rotation

**`static/click.js`** - Client-side JavaScript (embedded on user websites):
- Auto-discovers buttons with `.click-button` class
- Supports `data-icon` attribute for custom icons
- Supports `data-slug` attribute for custom page paths

### Domain/Slug Canonicalization

The `Counter` model contains critical canonicalization logic:

- **Domain** (`canonicalize_domain`): Strips protocol, removes `www.`, removes port/path, lowercases
- **Slug** (`canonicalize_slug`): Extracts path from full URLs, removes query strings/fragments, lowercases, removes trailing slash (except root)

This normalization happens on all inputs before database operations to ensure consistency.

### Rate Limiting Strategy

Two-tier system for performance and reliability:

1. **Memory Cache:** First check (fast), expires after time window
2. **Database:** Fallback/persistence, hashed by hour to enable automatic rotation

Identifier includes: IP + current hour (e.g., "192.168.1.1:2026-03-11-14")

### Privacy Design

**What is NOT stored:**
- IP addresses (only hashed for rate limiting)
- User-Agent strings
- Timestamps of individual clicks
- Any tracking identifiers

**What IS stored:**
- Domain name (canonicalized)
- Page slug (canonicalized)
- Click count (integer)

### Slug and Icon Encoding

Recent changes fix emoji support in slugs:
- Slugs are now: `{page_url} + {url_encoded_icon}`
- This allows different icons on the same page to have independent counters
- Example: `/mypath` with heart icon → `/mypath%E2%9D%A4%EF%B8%8F`

## Configuration

Environment variables (`.env` file):

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL async URL | Required |
| `HOST` | Server bind address | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `DEBUG` | Enable debug mode/docs | `False` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `*` |
| `RATE_LIMIT_REQUESTS` | Max requests per window | `60` |
| `RATE_LIMIT_WINDOW` | Time window in seconds | `3600` |
| `TELEGRAM_BOT_TOKEN` | Bot token for notifications | Empty |
| `TELEGRAM_CHAT_ID` | Chat ID for notifications | Empty |

## Important Conventions

### Code Style

- **Comments**: Code uses Chinese comments (中文注释) - maintain this convention
- **Logging**: Use Python's logging module, not print statements
- **Error Messages**: API responses use Chinese error messages for end users

### Async/Await Throughout

All database operations use SQLAlchemy 2.0 async patterns:
```python
async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        yield session
```

### PostgreSQL UPSERT Pattern

Use PostgreSQL-specific `ON CONFLICT` for atomic counter updates:
```python
stmt = insert(Counter).values(...).on_conflict_do_update(
    index_elements=['origin_domain', 'slug'],
    set_={'counter': Counter.counter + 1}
)
```

### Error Handling

- Rollback database transactions on error in `/api/increment_hits`
- Rate limiter fails open (allows request) on error to prevent service disruption
- Log errors but don't expose internal details in API responses

### API Version

Current version: `1.0.1` (defined in multiple places - update all when changing):
- `app/main.py` - FastAPI app version
- `app/schemas.py` - StatusResponse version
- `README.md` - Documentation version

## Frontend Integration

Users add this to their websites:
```html
<script defer src="https://your-domain.com/static/click.js"></script>
<button class="click-button" aria-hidden="true"></button>
```

The JavaScript automatically:
1. Finds all `.click-button` elements on page load
2. Fetches current counts via `/api/get_hits`
3. Displays the count
4. Handles clicks via `/api/increment_hits`
5. Stores click state in `localStorage` to prevent duplicate clicks

### Slug Format for Independent Counters

Each button gets a unique slug combining page URL and icon:
```
{page_url_or_slug}-{url_encoded_icon}
```

Examples:
- `/mypath-❤️` → `/mypath-%E2%9D%A4%EF%B8%8F` (heart icon on /mypath)
- `/mypath-👍` → `/mypath-%F0%9F%91%8D` (thumbs up on same page)

This allows multiple buttons with different icons on the same page to have independent counters.

### Client-Side Configuration

Override API URL globally or per-script:
```html
<!-- Global override -->
<script>window.CLICK_API_URL = 'https://api.example.com/api';</script>
<script defer src="click.js"></script>

<!-- Per-script override -->
<script defer src="click.js" data-api-url="https://api.example.com/api"></script>
```

### Debug Functions

Browser console utilities for testing:
```javascript
// Clear all click history from localStorage
window.clearClickStorage()

// Show all click storage keys
window.showStorage()

// Test API connectivity
window.testAPI()
```

## Deployment

### Docker Image

Built automatically via GitHub Actions on push to `main`:
- Registry: `ghcr.io/bboysoulcn/click:latest`
- Workflow: `.github/workflows/docker.yml`

### Kubernetes

Manifest provided in `k8s-deployment.yaml`:
- Deployment with readiness/liveness probes
- Service (ClusterIP on port 80 → container 8000)
- Ingress (nginx, requires domain update)

**Key differences from Docker Compose:**
- Uses synchronous PostgreSQL URL format: `postgresql://...` (not `postgresql+asyncpg://`)
- Namespace: `click`
- Includes health check probes

## Version Updates

When updating version, change in ALL locations:
1. `app/main.py` - FastAPI `version` parameter
2. `app/schemas.py` - `StatusResponse.version` default
3. `README.md` - Documentation version badges

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose exec db pg_isready -U click

# View database logs
docker-compose logs db

# Test connection from app container
docker-compose exec app python -c "from app.database import engine; print(engine)"
```

### Rate Limiting Not Working

Check that identifier hashing is working:
- Verify headers: `cf-connecting-ip`, `x-forwarded-for`
- Check memory cache isn't being cleared too frequently
- Confirm `rate_limit_requests` and `rate_limit_window` values

### CORS Errors

Verify `ALLOWED_ORIGINS` includes the requesting domain:
- Must match exactly (protocol + domain + port)
- Use comma-separated list for multiple origins
- Wildcard `*` allows all origins (not recommended for production)

### Buttons Not Appearing

Check browser console for:
- API connectivity errors (test with `window.testAPI()`)
- Incorrect API URL configuration
- Missing CORS headers on API responses
- JavaScript errors from other page scripts
