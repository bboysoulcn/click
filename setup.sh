#!/bin/bash

# iine Setup Script
# This script helps you set up the iine application

set -e

echo "=================================="
echo "iine Setup Script"
echo "=================================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file"
    else
        rm .env
    fi
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    
    # Generate random password for PostgreSQL
    PG_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Update .env with generated password
    sed -i.bak "s|postgresql+asyncpg://user:password@localhost:5432/iine|postgresql+asyncpg://iine:${PG_PASSWORD}@localhost:5432/iine|g" .env
    rm .env.bak
    
    echo "✅ .env file created with random PostgreSQL password"
fi

echo ""
echo "🐳 Do you want to use Docker? (recommended)"
read -p "Use Docker? (Y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Nn]$ ]]; then
    # Local setup
    echo "📦 Setting up local environment..."
    
    # Check Python version
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
        exit 1
    fi
    
    # Create virtual environment
    echo "Creating virtual environment..."
    python3 -m venv venv
    
    # Activate virtual environment
    echo "Activating virtual environment..."
    source venv/bin/activate
    
    # Install dependencies
    echo "Installing dependencies..."
    pip install -r requirements.txt
    
    echo ""
    echo "✅ Local setup complete!"
    echo ""
    echo "⚠️  Before running the application:"
    echo "1. Make sure PostgreSQL is running"
    echo "2. Make sure Redis is running (optional, for rate limiting)"
    echo "3. Update DATABASE_URL in .env with your PostgreSQL credentials"
    echo "4. Run database migrations: alembic upgrade head"
    echo "5. Start the server: python -m app.main"
    
else
    # Docker setup
    echo "🐳 Setting up with Docker..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Build and start containers
    echo "Building Docker images..."
    docker-compose build
    
    echo ""
    echo "Starting services..."
    docker-compose up -d
    
    # Wait for database to be ready
    echo "Waiting for database to be ready..."
    sleep 5
    
    # Run migrations
    echo "Running database migrations..."
    docker-compose exec app alembic upgrade head
    
    echo ""
    echo "✅ Docker setup complete!"
    echo ""
    echo "🎉 Application is running at http://localhost:8000"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Stop: docker-compose down"
    echo "  - Restart: docker-compose restart"
fi

echo ""
echo "📚 For more information, see README.md"
echo ""
