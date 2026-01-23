# 🚀 Quick Start Guide

This is a quick reference guide to get iine up and running quickly.

## Prerequisites

- Python 3.9+
- PostgreSQL 12+
- Redis 6+ (optional, for rate limiting)

Or just use Docker!

## Option 1: Docker (Recommended)

```bash
# 1. Clone and navigate
cd iine-python

# 2. Copy environment file
cp .env.example .env

# 3. Start everything
docker-compose up -d

# 4. Run migrations
docker-compose exec app alembic upgrade head

# 5. Visit http://localhost:8000
```

Done! 🎉

## Option 2: Local Development

```bash
# 1. Clone and navigate
cd iine-python

# 2. Run setup script
chmod +x setup.sh
./setup.sh

# 3. Configure .env
cp .env.example .env
# Edit .env with your database credentials

# 4. Activate virtual environment
source venv/bin/activate

# 5. Run migrations
alembic upgrade head

# 6. Start server
chmod +x start.sh
./start.sh

# Or manually:
# python -m app.main
```

## Adding to Your Website

### 1. Include the Script

```html
<script defer src="http://your-server:8000/static/iine.js"></script>
```

### 2. Add Button

```html
<button class="iine-button" aria-hidden="true"></button>
```

### 3. Style (Optional)

```html
<link rel="stylesheet" href="http://your-server:8000/static/iine.css">
```

## Configuration

Edit the API endpoint in `static/iine.js`:

```javascript
const API_URL = 'http://your-server:8000/api';
```

Or set it via environment variable in your backend.

## Customization

### Different Icons

```html
<!-- Built-in -->
<button class="iine-button" data-icon="heart"></button>
<button class="iine-button" data-icon="thumbs_up"></button>
<button class="iine-button" data-icon="upvote"></button>

<!-- Emoji -->
<button class="iine-button" data-icon="🎉"></button>
```

### Multiple Pages

```html
<button class="iine-button" data-slug="/page1"></button>
<button class="iine-button" data-slug="/page2"></button>
```

## Testing

Visit the demo page at: `http://localhost:8000/static/index.html`

## Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Create database if it doesn't exist
createdb iine
```

### Redis Connection Error

```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server
```

### Port Already in Use

Edit `.env` and change `PORT=8000` to another port.

## Useful Commands

```bash
# View logs (Docker)
docker-compose logs -f

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Run migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"

# Health check
python healthcheck.py
```

## API Endpoints

- `GET /` - Welcome message
- `GET /api/status` - Health check
- `POST /api/get_hits` - Get counts for slugs
- `POST /api/increment_hits` - Increment count
- `GET /static/index.html` - Demo page
- `GET /docs` - API documentation (debug mode only)

## Environment Variables

Key variables to configure in `.env`:

```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/iine
REDIS_URL=redis://localhost:6379/0
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_WINDOW=3600
DEBUG=False
```

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Use proper PostgreSQL credentials
3. Configure `ALLOWED_ORIGINS` with your domains
4. Use nginx for SSL/TLS termination
5. Set up monitoring and backups

See `README.md` for detailed production setup.

## Support

- GitHub Issues: Report bugs or request features
- Documentation: See `README.md` for full documentation
- Original Project: https://github.com/welpo/iine

---

Happy tracking! ♥️
