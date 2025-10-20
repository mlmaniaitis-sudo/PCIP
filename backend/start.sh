#!/bin/bash

# PCIP Backend Quick Start Script

echo "🚀 Starting PCIP Backend Development Environment"
echo "================================================"

# Check if conda environment exists
if ! conda info --envs | grep -q "pcip"; then
    echo "❌ Conda environment 'pcip' not found. Please create it first:"
    echo "   conda create -n pcip python=3.11 -y"
    echo "   conda activate pcip"
    echo "   pip install -r requirements.txt"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start database if not running
if ! docker ps | grep -q "pcip_db"; then
    echo "🗄️ Starting database..."
    docker-compose up -d
    
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    
    # Wait for database to be ready
    while ! docker exec pcip_db pg_isready -U pcip_user -d pcip_db > /dev/null 2>&1; do
        echo "   Still waiting for database..."
        sleep 5
    done
    
    echo "✅ Database is ready!"
else
    echo "✅ Database is already running"
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Show status
echo ""
echo "📊 Current Status:"
echo "=================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=pcip"

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Edit configuration: nano .env"
echo "2. Start API server: conda activate pcip && python main.py"
echo "3. Start MQTT listener (optional): conda activate pcip && python mqtt_listener.py"
echo "4. Visit API docs: http://localhost:8000/docs"
echo ""
echo "🔍 Useful Commands:"
echo "=================="
echo "• View database logs: docker logs pcip_db"
echo "• Connect to database: docker exec -it pcip_db psql -U pcip_user -d pcip_db"
echo "• Stop database: docker-compose down"
echo "• Test telemetry: mosquitto_pub -h localhost -t telemetry/TEST001 -m '{\"battery\":85}'"