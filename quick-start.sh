#!/bin/bash

# ARiS Enterprise Platform - Quick Start Script
# This script automates the setup and deployment of ARiS

set -e  # Exit on any error

echo "🚀 ARiS Enterprise Platform - Quick Start"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check system requirements
print_status "Checking system requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_success "npm $(npm --version) is installed"

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    exit 1
fi

print_success "Git $(git --version | cut -d' ' -f3) is installed"

print_success "System requirements check passed"
echo ""

# Step 1: Clone repository
print_status "Step 1: Setting up ARiS repository..."

if [ -d "ARiS-v2P" ]; then
    print_warning "ARiS-v2P directory already exists"
    read -p "Do you want to remove it and start fresh? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf ARiS-v2P
        print_status "Removed existing directory"
    else
        print_status "Using existing directory"
    fi
fi

if [ ! -d "ARiS-v2P" ]; then
    print_status "Cloning ARiS repository..."
    git clone https://github.com/LOrdEnRYQuE/ARiS-v2P.git
    print_success "Repository cloned successfully"
fi

cd ARiS-v2P

# Step 2: Install dependencies
print_status "Step 2: Installing dependencies..."
npm install
print_success "Dependencies installed successfully"

# Step 3: Environment setup
print_status "Step 3: Setting up environment..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    print_success "Environment file created from template"
else
    print_warning "Environment file already exists"
fi

# Step 4: Interactive configuration
echo ""
print_status "Step 4: Configuration setup"
echo "=================================="
echo ""

# OpenAI API Key
echo "🔑 OpenAI API Key Setup"
echo "----------------------"
echo "You need an OpenAI API key to use ARiS."
echo "Get one from: https://platform.openai.com/api-keys"
echo ""

read -p "Enter your OpenAI API key (or press Enter to skip): " OPENAI_KEY
if [ ! -z "$OPENAI_KEY" ]; then
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$OPENAI_KEY/" .env
    else
        # Linux
        sed -i "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$OPENAI_KEY/" .env
    fi
    print_success "OpenAI API key configured"
else
    print_warning "OpenAI API key not configured. You'll need to add it manually to .env"
fi

# Supabase setup
echo ""
echo "🗄️  Supabase Setup"
echo "-----------------"
echo "ARiS uses Supabase for database and authentication."
echo "Create a project at: https://supabase.com"
echo ""

read -p "Enter your Supabase URL (or press Enter to skip): " SUPABASE_URL
read -p "Enter your Supabase anon key (or press Enter to skip): " SUPABASE_ANON_KEY
read -p "Enter your Supabase service role key (or press Enter to skip): " SUPABASE_SERVICE_KEY

if [ ! -z "$SUPABASE_URL" ] && [ ! -z "$SUPABASE_ANON_KEY" ] && [ ! -z "$SUPABASE_SERVICE_KEY" ]; then
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|" .env
        sed -i '' "s/SUPABASE_ANON_KEY=.*/SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY/" .env
        sed -i '' "s/SUPABASE_SERVICE_ROLE_KEY=.*/SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY/" .env
    else
        # Linux
        sed -i "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|" .env
        sed -i "s/SUPABASE_ANON_KEY=.*/SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY/" .env
        sed -i "s/SUPABASE_SERVICE_ROLE_KEY=.*/SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY/" .env
    fi
    print_success "Supabase configuration updated"
else
    print_warning "Supabase configuration not complete. You'll need to add it manually to .env"
fi

# Generate JWT secret
print_status "Generating JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
else
    # Linux
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
fi
print_success "JWT secret generated and configured"

# Step 5: Test setup
print_status "Step 5: Testing setup..."

# Create test script
cat > test-setup.js << 'EOF'
require('dotenv').config();

async function testSetup() {
    console.log('🔍 Testing ARiS Setup...\n');

    let allTestsPassed = true;

    // Test OpenAI
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            });
            if (response.ok) {
                console.log('✅ OpenAI API: Connected successfully');
            } else {
                console.log('❌ OpenAI API: Connection failed');
                allTestsPassed = false;
            }
        } catch (error) {
            console.log('❌ OpenAI API: Error -', error.message);
            allTestsPassed = false;
        }
    } else {
        console.log('⚠️  OpenAI API: Not configured');
    }

    // Test Supabase
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && 
        process.env.SUPABASE_URL !== 'https://your-project.supabase.co') {
        try {
            const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
                headers: {
                    'apikey': process.env.SUPABASE_ANON_KEY
                }
            });
            if (response.ok) {
                console.log('✅ Supabase: Connected successfully');
            } else {
                console.log('❌ Supabase: Connection failed');
                allTestsPassed = false;
            }
        } catch (error) {
            console.log('❌ Supabase: Error -', error.message);
            allTestsPassed = false;
        }
    } else {
        console.log('⚠️  Supabase: Not configured');
    }

    // Test JWT Secret
    if (process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your-super-secure-jwt-secret-key') {
        console.log('✅ JWT Secret: Configured');
    } else {
        console.log('❌ JWT Secret: Not configured');
        allTestsPassed = false;
    }

    console.log('');
    if (allTestsPassed) {
        console.log('🎉 All tests passed! ARiS is ready to use.');
    } else {
        console.log('⚠️  Some tests failed. Please check your configuration.');
    }
}

testSetup();
EOF

# Run test
node test-setup.js

# Step 6: Start development server
echo ""
print_status "Step 6: Starting development server..."
echo ""

print_success "ARiS setup complete!"
echo ""
echo "🚀 Next Steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Follow the branding customization guide"
echo "3. Deploy to production using the deployment guide"
echo "4. Start marketing and selling your platform"
echo ""
echo "📚 Documentation:"
echo "- Branding: BRANDING_CUSTOMIZATION.md"
echo "- Deployment: DEPLOYMENT_GUIDE.md"
echo "- Environment: ENVIRONMENT_SETUP.md"
echo "- Marketing: MARKETING_GUIDE.md"
echo ""

read -p "Start development server now? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    print_status "Setup complete! Run 'npm run dev' when ready to start."
else
    print_status "Starting development server..."
    npm run dev
fi 