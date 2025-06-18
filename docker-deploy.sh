#!/bin/bash

# Bumasys Docker Deployment Script
# This script helps deploy Bumasys using Docker with optional configurations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Print script usage
usage() {
    echo "Usage: $0 [OPTIONS] COMMAND"
    echo ""
    echo "Commands:"
    echo "  start       Start production deployment"
    echo "  dev         Start development deployment"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        Show logs from all services"
    echo "  build       Build all Docker images"
    echo "  clean       Remove all containers, images, and volumes"
    echo "  status      Show status of all services"
    echo ""
    echo "Options:"
    echo "  -h, --help  Show this help message"
    echo "  -v          Verbose output"
    echo ""
    echo "Examples:"
    echo "  $0 start              # Start production deployment"
    echo "  $0 dev                # Start development environment"
    echo "  $0 logs               # View logs"
    echo "  $0 clean              # Clean up everything"
}

# Check if Docker and Docker Compose are available
check_dependencies() {
    if ! command -v docker &> /dev/null; then
        print_color $RED "Error: Docker is not installed or not in PATH"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        print_color $RED "Error: Docker Compose is not available"
        exit 1
    fi
}

# Create .env file if it doesn't exist
setup_env() {
    if [ ! -f .env ]; then
        print_color $YELLOW "Warning: .env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_color $GREEN "Created .env file. Please review and update the values before proceeding."
            print_color $BLUE "Edit .env file with: nano .env"
            exit 0
        else
            print_color $RED "Error: .env.example file not found"
            exit 1
        fi
    fi
}

# Start production deployment
start_production() {
    print_color $BLUE "🚀 Starting Bumasys production deployment..."
    
    setup_env
    
    print_color $BLUE "📦 Building images..."
    docker compose build
    
    print_color $BLUE "🔄 Starting services..."
    docker compose up -d
    
    print_color $GREEN "✅ Production deployment started successfully!"
    print_color $BLUE "📊 Frontend: http://localhost"
    print_color $BLUE "🔧 Backend GraphQL: http://localhost:4000/graphql"
    print_color $BLUE "📝 View logs: ./docker-deploy.sh logs"
    print_color $BLUE "🛑 Stop services: ./docker-deploy.sh stop"
}

# Start development deployment
start_development() {
    print_color $BLUE "🚀 Starting Bumasys development environment..."
    
    setup_env
    
    print_color $BLUE "📦 Building development images..."
    docker compose -f docker-compose.dev.yml build
    
    print_color $BLUE "🔄 Starting development services..."
    docker compose -f docker-compose.dev.yml up -d
    
    print_color $GREEN "✅ Development environment started successfully!"
    print_color $BLUE "🌐 Frontend: http://localhost:3000"
    print_color $BLUE "📊 Backend GraphQL: http://localhost:4000/graphql"
    print_color $BLUE "📝 View logs: ./docker-deploy.sh logs"
    print_color $BLUE "🛑 Stop services: ./docker-deploy.sh stop"
}

# Stop all services
stop_services() {
    print_color $BLUE "🛑 Stopping Bumasys services..."
    
    # Stop production services
    if docker compose ps -q > /dev/null 2>&1; then
        docker compose down
    fi
    
    # Stop development services
    if docker compose -f docker-compose.dev.yml ps -q > /dev/null 2>&1; then
        docker compose -f docker-compose.dev.yml down
    fi
    
    print_color $GREEN "✅ All services stopped"
}

# Restart services
restart_services() {
    print_color $BLUE "🔄 Restarting Bumasys services..."
    stop_services
    start_production
}

# Show logs
show_logs() {
    print_color $BLUE "📝 Showing logs from all services..."
    
    # Check which compose file is running
    if docker compose ps -q > /dev/null 2>&1 && [ -n "$(docker compose ps -q)" ]; then
        docker compose logs -f
    elif docker compose -f docker-compose.dev.yml ps -q > /dev/null 2>&1 && [ -n "$(docker compose -f docker-compose.dev.yml ps -q)" ]; then
        docker compose -f docker-compose.dev.yml logs -f
    else
        print_color $YELLOW "No running services found"
    fi
}

# Build images
build_images() {
    print_color $BLUE "📦 Building all Docker images..."
    docker compose build
    docker compose -f docker-compose.dev.yml build
    print_color $GREEN "✅ All images built successfully"
}

# Clean up everything
clean_all() {
    print_color $YELLOW "⚠️  This will remove all containers, images, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_color $BLUE "🧹 Cleaning up Docker resources..."
        
        # Stop all services first
        stop_services
        
        # Remove containers, networks, and volumes
        docker compose down -v --remove-orphans
        docker compose -f docker-compose.dev.yml down -v --remove-orphans
        
        # Remove built images
        docker rmi bumasys-beta-backend bumasys-beta-frontend 2>/dev/null || true
        
        print_color $GREEN "✅ Cleanup completed"
    else
        print_color $BLUE "Cleanup cancelled"
    fi
}

# Show service status
show_status() {
    print_color $BLUE "📊 Service status:"
    
    echo ""
    echo "Production services:"
    docker compose ps
    
    echo ""
    echo "Development services:"
    docker compose -f docker-compose.dev.yml ps
    
    echo ""
    echo "Docker images:"
    docker images | grep bumasys || echo "No Bumasys images found"
    
    echo ""
    echo "Docker volumes:"
    docker volume ls | grep bumasys || echo "No Bumasys volumes found"
}

# Main script logic
main() {
    check_dependencies
    
    case "${1:-}" in
        start)
            start_production
            ;;
        dev)
            start_development
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            show_logs
            ;;
        build)
            build_images
            ;;
        clean)
            clean_all
            ;;
        status)
            show_status
            ;;
        -h|--help|help)
            usage
            ;;
        *)
            print_color $RED "Error: Unknown command '${1:-}'"
            echo ""
            usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"