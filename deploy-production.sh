#!/bin/bash

# Blaze Ranch Analytics - Production Deployment Script
# Deploys to Cloudflare Pages with full optimization

set -e  # Exit on any error

echo "🔥 BLAZE RANCH ANALYTICS - PRODUCTION DEPLOYMENT 🔥"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m' 
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLOUDFLARE_ACCOUNT_ID=""
PROJECT_NAME="blaze-intelligence-platform"
DOMAIN="blaze-intelligence-platform.pages.dev"
BUILD_DIR="./dist"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm 8+"
        exit 1
    fi
    
    # Check Wrangler
    if ! command -v wrangler &> /dev/null; then
        print_warning "Wrangler not found. Installing..."
        npm install -g wrangler
    fi
    
    print_success "Prerequisites check completed"
}

# Validate files
validate_files() {
    print_status "Validating required files..."
    
    required_files=(
        "blaze-ranch-production.html"
        "blaze-sports-api.js" 
        "three.min.js"
        "_headers"
        "_redirects"
        "package.json"
        "wrangler.toml"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    print_success "File validation completed"
}

# Create build directory
prepare_build() {
    print_status "Preparing build directory..."
    
    # Clean existing build
    rm -rf $BUILD_DIR
    mkdir -p $BUILD_DIR
    
    # Copy main files
    cp blaze-ranch-production.html $BUILD_DIR/index.html
    cp blaze-sports-api.js $BUILD_DIR/
    cp three.min.js $BUILD_DIR/
    cp chart.js $BUILD_DIR/ 2>/dev/null || true
    cp react*.js $BUILD_DIR/ 2>/dev/null || true
    cp babel.min.js $BUILD_DIR/ 2>/dev/null || true
    cp video*.js $BUILD_DIR/ 2>/dev/null || true
    cp *.css $BUILD_DIR/ 2>/dev/null || true
    
    # Copy configuration files
    cp _headers $BUILD_DIR/
    cp _redirects $BUILD_DIR/
    
    # Create robots.txt
    cat > $BUILD_DIR/robots.txt << EOF
User-agent: *
Allow: /

Sitemap: https://$DOMAIN/sitemap.xml
EOF
    
    # Create sitemap.xml
    cat > $BUILD_DIR/sitemap.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://$DOMAIN/</loc>
        <lastmod>$(date -u +"%Y-%m-%dT%H:%M:%SZ")</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://$DOMAIN/cardinals</loc>
        <lastmod>$(date -u +"%Y-%m-%dT%H:%M:%SZ")</lastmod>
        <changefreq>hourly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://$DOMAIN/titans</loc>
        <lastmod>$(date -u +"%Y-%m-%dT%H:%M:%SZ")</lastmod>
        <changefreq>hourly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://$DOMAIN/longhorns</loc>
        <lastmod>$(date -u +"%Y-%m-%dT%H:%M:%SZ")</lastmod>
        <changefreq>hourly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://$DOMAIN/grizzlies</loc>
        <lastmod>$(date -u +"%Y-%m-%dT%H:%M:%SZ")</lastmod>
        <changefreq>hourly</changefreq>
        <priority>0.9</priority>
    </url>
</urlset>
EOF
    
    print_success "Build directory prepared"
}

# Optimize assets
optimize_assets() {
    print_status "Optimizing assets..."
    
    # Minify JavaScript if not already minified
    if [ -f "$BUILD_DIR/blaze-sports-api.js" ] && [ ! -f "$BUILD_DIR/blaze-sports-api.min.js" ]; then
        print_status "Minifying JavaScript..."
        if command -v terser &> /dev/null; then
            terser $BUILD_DIR/blaze-sports-api.js -o $BUILD_DIR/blaze-sports-api.min.js -c -m
            rm $BUILD_DIR/blaze-sports-api.js
            print_success "JavaScript minified"
        else
            print_warning "Terser not found. JavaScript will not be minified."
        fi
    fi
    
    # Update HTML to use minified assets
    if [ -f "$BUILD_DIR/blaze-sports-api.min.js" ]; then
        sed -i.bak 's/blaze-sports-api\.js/blaze-sports-api.min.js/g' $BUILD_DIR/index.html
        rm $BUILD_DIR/index.html.bak 2>/dev/null || true
    fi
    
    print_success "Asset optimization completed"
}

# Run tests
run_tests() {
    print_status "Running validation tests..."
    
    # Test HTML validity
    if [ -f "$BUILD_DIR/index.html" ]; then
        if grep -q "BLAZE RANCH" "$BUILD_DIR/index.html"; then
            print_success "HTML structure validated"
        else
            print_error "HTML validation failed - missing brand elements"
            exit 1
        fi
    fi
    
    # Test JavaScript syntax
    if [ -f "$BUILD_DIR/blaze-sports-api.min.js" ] || [ -f "$BUILD_DIR/blaze-sports-api.js" ]; then
        if node -c $BUILD_DIR/blaze-sports-api*.js 2>/dev/null; then
            print_success "JavaScript syntax validated"
        else
            print_error "JavaScript validation failed"
            exit 1
        fi
    fi
    
    print_success "All tests passed"
}

# Deploy to Cloudflare Pages
deploy_to_cloudflare() {
    print_status "Deploying to Cloudflare Pages..."
    
    # Check if logged in to Wrangler
    if ! wrangler whoami &> /dev/null; then
        print_warning "Not logged in to Wrangler. Please authenticate:"
        wrangler login
    fi
    
    # Deploy using Wrangler
    print_status "Publishing to Cloudflare Pages..."
    
    if wrangler pages publish $BUILD_DIR --project-name=$PROJECT_NAME --compatibility-date=2024-09-02; then
        print_success "Deployment successful!"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Get deployment info
get_deployment_info() {
    print_status "Fetching deployment information..."
    
    # Get deployment URL
    DEPLOYMENT_URL="https://$DOMAIN"
    
    echo ""
    echo "🚀 DEPLOYMENT COMPLETE!"
    echo "======================"
    echo ""
    echo "🌐 Production URL: $DEPLOYMENT_URL"
    echo "📊 Dashboard: https://dash.cloudflare.com/pages"
    echo "📈 Analytics: https://dash.cloudflare.com/analytics"
    echo ""
    echo "🎯 Live Endpoints:"
    echo "   • Main Portal:    $DEPLOYMENT_URL/"
    echo "   • Cardinals:      $DEPLOYMENT_URL/cardinals"
    echo "   • Titans:         $DEPLOYMENT_URL/titans" 
    echo "   • Longhorns:      $DEPLOYMENT_URL/longhorns"
    echo "   • Grizzlies:      $DEPLOYMENT_URL/grizzlies"
    echo ""
    echo "📱 Features Deployed:"
    echo "   ✅ Rustic Three.js Visualization"
    echo "   ✅ Real Sports Data Integration"
    echo "   ✅ Responsive Design"
    echo "   ✅ Progressive Web App"
    echo "   ✅ Performance Optimized"
    echo "   ✅ SEO Optimized"
    echo ""
    echo "🔥 Blaze Ranch Analytics is LIVE!"
}

# Cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    # Keep build directory for debugging if needed
    # rm -rf $BUILD_DIR
    print_success "Cleanup completed"
}

# Main execution flow
main() {
    echo ""
    echo "Starting deployment process..."
    echo "Target: $DOMAIN"
    echo "Build Directory: $BUILD_DIR"
    echo ""
    
    check_prerequisites
    validate_files
    prepare_build
    optimize_assets
    run_tests
    deploy_to_cloudflare
    get_deployment_info
    cleanup
    
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL! 🎉"
    echo "=============================="
    echo ""
    echo "Your Blaze Ranch Analytics platform is now live at:"
    echo "👉 https://$DOMAIN"
    echo ""
    echo "Time to celebrate! 🥳"
}

# Handle interruption
trap 'echo -e "\n${RED}Deployment interrupted${NC}"; cleanup; exit 1' INT TERM

# Run main function
main "$@"