#!/bin/bash

# Cleanup Script for Your Thoughts App
# This removes orphaned directories from earlier development

echo "🧹 Cleaning up orphaned directories..."

# Check if orphaned directories exist
if [ -d "src" ]; then
    echo "  Removing orphaned /src directory..."
    rm -rf src
    echo "  ✅ /src removed"
fi

if [ -d "your-thoughts-app" ]; then
    echo "  Removing orphaned /your-thoughts-app directory..."
    rm -rf your-thoughts-app
    echo "  ✅ /your-thoughts-app removed"
fi

if [ -d "dist" ]; then
    echo "  Removing orphaned /dist directory..."
    rm -rf dist
    echo "  ✅ /dist removed"
fi

# Remove root-level config files that belong in frontend/
ROOT_FRONTEND_FILES=(
    "index.html"
    "vite.config.ts"
    "tailwind.config.js"
    "postcss.config.js"
    "eslint.config.js"
    "tsconfig.json"
    "tsconfig.app.json"
    "tsconfig.node.json"
)

for file in "${ROOT_FRONTEND_FILES[@]}"; do
    if [ -f "$file" ] && [ -f "frontend/$file" ]; then
        echo "  Removing duplicate root /$file..."
        rm -f "$file"
        echo "  ✅ /$file removed (exists in frontend/)"
    fi
done

# Remove root package files if frontend/backend have their own
if [ -f "package.json" ] && [ -f "frontend/package.json" ] && [ -f "backend/package.json" ]; then
    echo "  Removing root /package.json and /package-lock.json..."
    rm -f package.json package-lock.json
    echo "  ✅ Root package files removed"
fi

# Remove public if it exists at root
if [ -d "public" ] && [ -d "frontend/public" ]; then
    echo "  Removing duplicate root /public..."
    rm -rf public
    echo "  ✅ /public removed (exists in frontend/)"
fi

echo ""
echo "🎉 Cleanup complete!"
echo ""
echo "Final structure:"
echo "  your-thoughts-app/"
echo "  ├── frontend/     # React app"
echo "  ├── backend/      # Node.js API"
echo "  ├── docs/         # Documentation"
echo "  └── .github/      # CI/CD"
