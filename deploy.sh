#!/bin/bash

# Blaze Intelligence - GitHub Pages Deployment Script
# This script deploys the enhanced Blaze Intelligence platform to GitHub Pages

echo "🔥 Blaze Intelligence Deployment Script"
echo "======================================="

# Configuration
REPO_NAME="blaze-intelligence"
BRANCH="gh-pages"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git remote add origin https://github.com/ahump20/$REPO_NAME.git
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
.DS_Store
*.log
node_modules/
.env
.vscode/
EOF
fi

# Stage all files
echo "📁 Staging files..."
git add -A

# Commit changes
echo "💾 Committing changes..."
git commit -m "🔥 Deploy Blaze Intelligence Enhanced Platform

- Enhanced Portal with 10,000 particles and custom shaders
- Physics Arena with Cannon.js integration
- Real-time Analytics Dashboard
- Command Center interface

🤖 Deployed with Blaze Intelligence Automation"

# Create gh-pages branch if it doesn't exist
if ! git show-ref --quiet refs/heads/gh-pages; then
    echo "🌿 Creating gh-pages branch..."
    git checkout -b gh-pages
else
    echo "🌿 Switching to gh-pages branch..."
    git checkout gh-pages
fi

# Push to GitHub
echo "🚀 Deploying to GitHub Pages..."
git push -u origin gh-pages --force

echo ""
echo "✅ Deployment Complete!"
echo "======================================="
echo "🌐 Your site will be available at:"
echo "   https://ahump20.github.io/$REPO_NAME/"
echo ""
echo "📊 Deployment Stats:"
echo "   - HTML Files: $(ls -1 *.html 2>/dev/null | wc -l)"
echo "   - JS Files: $(ls -1 *.js 2>/dev/null | wc -l)"
echo "   - CSS Files: $(ls -1 *.css 2>/dev/null | wc -l)"
echo ""
echo "🔥 Blaze Intelligence - Where Data Becomes Dominance"