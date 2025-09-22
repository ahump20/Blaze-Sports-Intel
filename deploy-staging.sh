#!/bin/bash
# Blaze Intelligence - Staging Environment Deployment Script
# Automated deployment pipeline with performance optimization and error handling

set -euo pipefail

# Configuration
PROJECT_NAME="blaze-ranch-analytics"
STAGING_ENV="staging"
PRODUCTION_ENV="production"
BUILD_DIR="./dist"
BACKUP_DIR="./backups"
LOG_FILE="./deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Utility functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

header() {
    echo -e "${PURPLE}🏆 BLAZE INTELLIGENCE DEPLOYMENT${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Pre-deployment checks
check_dependencies() {
    log "Checking deployment dependencies..."
    
    # Check if wrangler is installed
    if ! command -v wrangler &> /dev/null; then
        error "Wrangler CLI not found. Installing..."
        npm install -g wrangler
    fi
    
    # Check if node is available
    if ! command -v node &> /dev/null; then
        error "Node.js not found. Please install Node.js"
        exit 1
    fi
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        error "npm not found. Please install npm"
        exit 1
    fi
    
    success "All dependencies verified"
}

# Validate environment configuration
validate_config() {
    log "Validating configuration files..."
    
    # Check wrangler.toml exists
    if [[ ! -f "wrangler.toml" ]]; then
        error "wrangler.toml not found"
        exit 1
    fi
    
    # Check package.json exists
    if [[ ! -f "package.json" ]]; then
        error "package.json not found"
        exit 1
    fi
    
    # Validate critical HTML files exist
    local required_files=(
        "index.html"
        "blaze-executive-platform.html"
        "blaze-advanced-analytics.html"
        "blaze-performance-optimizer.js"
        "blaze-sports-api.js"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error "Required file missing: $file"
            exit 1
        fi
    done
    
    success "Configuration validation completed"
}

# Create backup of current deployment
create_backup() {
    log "Creating deployment backup..."
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Create timestamped backup
    local timestamp=$(date +'%Y%m%d_%H%M%S')
    local backup_name="backup_${timestamp}.tar.gz"
    
    tar -czf "${BACKUP_DIR}/${backup_name}" \
        --exclude="node_modules" \
        --exclude="dist" \
        --exclude="backups" \
        --exclude=".git" \
        .
    
    success "Backup created: ${backup_name}"
}

# Run performance optimizations
optimize_assets() {
    log "Running asset optimization..."
    
    # Create dist directory
    mkdir -p "$BUILD_DIR"
    
    # Copy HTML files
    cp *.html "$BUILD_DIR/"
    
    # Copy and optimize JavaScript files
    if command -v terser &> /dev/null; then
        log "Minifying JavaScript files..."
        for js_file in *.js; do
            if [[ -f "$js_file" ]]; then
                terser "$js_file" -o "${BUILD_DIR}/${js_file}" -c -m
            fi
        done
    else
        warning "Terser not found, copying JS files without minification"
        cp *.js "$BUILD_DIR/" 2>/dev/null || true
    fi
    
    # Copy CSS files
    cp *.css "$BUILD_DIR/" 2>/dev/null || true
    
    # Copy configuration files
    cp wrangler.toml "$BUILD_DIR/"
    cp _headers "$BUILD_DIR/" 2>/dev/null || true
    cp _redirects "$BUILD_DIR/" 2>/dev/null || true
    
    success "Asset optimization completed"
}

# Run quality checks
run_quality_checks() {
    log "Running quality checks..."
    
    # Check HTML syntax
    local html_files=("$BUILD_DIR"/*.html)
    for html_file in "${html_files[@]}"; do
        if [[ -f "$html_file" ]]; then
            log "Validating HTML: $(basename "$html_file")"
            # Basic HTML validation (check for unclosed tags)
            if grep -q "<script" "$html_file" && ! grep -q "</script>" "$html_file"; then
                warning "Potential unclosed script tag in $(basename "$html_file")"
            fi
        fi
    done
    
    # Check JavaScript syntax
    local js_files=("$BUILD_DIR"/*.js)
    for js_file in "${js_files[@]}"; do
        if [[ -f "$js_file" ]] && command -v node &> /dev/null; then
            if ! node -c "$js_file" 2>/dev/null; then
                error "JavaScript syntax error in $(basename "$js_file")"
                exit 1
            fi
        fi
    done
    
    success "Quality checks passed"
}

# Deploy to staging environment
deploy_staging() {
    log "Deploying to staging environment..."
    
    # Set environment variables
    export ENVIRONMENT="staging"
    
    # Deploy using wrangler
    if wrangler pages publish "$BUILD_DIR" --project-name="${PROJECT_NAME}-staging" --env staging; then
        success "Staging deployment completed successfully"
        
        # Get deployment URL
        local staging_url="https://${PROJECT_NAME}-staging.pages.dev"
        log "Staging URL: $staging_url"
        
        # Run post-deployment tests
        test_deployment "$staging_url"
    else
        error "Staging deployment failed"
        exit 1
    fi
}

# Deploy to production environment
deploy_production() {
    log "Deploying to production environment..."
    
    # Confirmation prompt for production deployment
    echo -e "${YELLOW}⚠️  About to deploy to PRODUCTION environment${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        warning "Production deployment cancelled by user"
        exit 0
    fi
    
    # Set environment variables
    export ENVIRONMENT="production"
    
    # Deploy using wrangler
    if wrangler pages publish "$BUILD_DIR" --project-name="$PROJECT_NAME" --env production; then
        success "Production deployment completed successfully"
        
        # Get deployment URL
        local production_url="https://blaze-intelligence-platform.pages.dev"
        log "Production URL: $production_url"
        
        # Run post-deployment tests
        test_deployment "$production_url"
    else
        error "Production deployment failed"
        
        # Attempt rollback
        rollback_deployment
        exit 1
    fi
}

# Test deployment
test_deployment() {
    local url="$1"
    log "Testing deployment at: $url"
    
    # Basic connectivity test
    if curl -sSf "$url" > /dev/null; then
        success "Basic connectivity test passed"
    else
        error "Basic connectivity test failed"
        return 1
    fi
    
    # Test critical endpoints
    local endpoints=(
        "/"
        "/blaze-executive-platform.html"
        "/blaze-advanced-analytics.html"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -sSf "${url}${endpoint}" > /dev/null; then
            success "Endpoint test passed: $endpoint"
        else
            warning "Endpoint test failed: $endpoint"
        fi
    done
    
    # Performance test (basic load time check)
    local load_time=$(curl -o /dev/null -s -w "%{time_total}" "$url")
    if (( $(echo "$load_time < 3.0" | bc -l) )); then
        success "Performance test passed: ${load_time}s load time"
    else
        warning "Performance test concern: ${load_time}s load time (>3s)"
    fi
}

# Rollback deployment
rollback_deployment() {
    log "Attempting to rollback deployment..."
    
    # Get latest backup
    local latest_backup=$(ls -t "$BACKUP_DIR" | head -n1)
    
    if [[ -n "$latest_backup" ]]; then
        log "Rolling back to: $latest_backup"
        
        # Extract backup
        tar -xzf "${BACKUP_DIR}/${latest_backup}"
        
        # Redeploy previous version
        optimize_assets
        wrangler pages publish "$BUILD_DIR" --project-name="$PROJECT_NAME" --env production
        
        success "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Cleanup temporary files
cleanup() {
    log "Cleaning up temporary files..."
    
    # Remove dist directory
    if [[ -d "$BUILD_DIR" ]]; then
        rm -rf "$BUILD_DIR"
    fi
    
    # Remove old backups (keep last 5)
    if [[ -d "$BACKUP_DIR" ]]; then
        cd "$BACKUP_DIR"
        ls -t | tail -n +6 | xargs rm -f
        cd ..
    fi
    
    success "Cleanup completed"
}

# Performance monitoring setup
setup_monitoring() {
    log "Setting up performance monitoring..."
    
    # Create monitoring configuration
    cat > monitoring-config.json << EOF
{
    "endpoints": [
        "https://blaze-intelligence-platform.pages.dev",
        "https://${PROJECT_NAME}-staging.pages.dev"
    ],
    "checks": {
        "responseTime": 3000,
        "uptime": 99.9,
        "performance": {
            "fcp": 2000,
            "lcp": 2500,
            "cls": 0.1
        }
    },
    "notifications": {
        "email": "ahump20@outlook.com",
        "webhook": null
    }
}
EOF
    
    success "Monitoring configuration created"
}

# Main deployment function
main() {
    header
    
    # Parse command line arguments
    local environment="${1:-staging}"
    
    log "Starting Blaze Intelligence deployment pipeline..."
    log "Target environment: $environment"
    
    # Pre-deployment phase
    check_dependencies
    validate_config
    create_backup
    
    # Build phase
    optimize_assets
    run_quality_checks
    
    # Deployment phase
    case "$environment" in
        "staging")
            deploy_staging
            ;;
        "production")
            deploy_production
            ;;
        *)
            error "Invalid environment: $environment. Use 'staging' or 'production'"
            exit 1
            ;;
    esac
    
    # Post-deployment phase
    setup_monitoring
    cleanup
    
    success "🎉 Deployment pipeline completed successfully!"
    log "Environment: $environment"
    log "Timestamp: $(date)"
    
    echo -e "${PURPLE}🏆 BLAZE INTELLIGENCE - WHERE DATA BECOMES DOMINANCE 🏆${NC}"
}

# Handle script interruption
trap cleanup EXIT

# Run main function with all arguments
main "$@"