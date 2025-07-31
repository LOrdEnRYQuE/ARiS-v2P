# ARiS Enterprise Platform - Environment Setup Guide

> **Step-by-step guide to configure your ARiS environment**

## 🚀 Quick Setup (5 minutes)

### **1. Clone and Install**
```bash
git clone https://github.com/LOrdEnRYQuE/ARiS-v2P.git
cd ARiS-v2P
npm install
```

### **2. Create Environment File**
```bash
cp .env.example .env
```

### **3. Configure Essential Variables**
```bash
# Edit .env with your API keys
nano .env
```

## 🔑 API Keys Setup

### **OpenAI API Key**

#### **Step 1: Get OpenAI API Key**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys" in the sidebar
4. Click "Create new secret key"
5. Copy the generated key (starts with `sk-`)

#### **Step 2: Configure in .env**
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
```

#### **Step 3: Test OpenAI Connection**
```bash
# Test the API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### **Supabase Setup**

#### **Step 1: Create Supabase Project**
1. Go to [Supabase](https://supabase.com/)
2. Click "Start your project"
3. Sign up or log in
4. Create a new project
5. Note your project URL and API keys

#### **Step 2: Get Supabase Credentials**
1. In your Supabase dashboard, go to "Settings" → "API"
2. Copy the following values:
   - Project URL (e.g., `https://your-project.supabase.co`)
   - Anon public key (starts with `eyJ`)
   - Service role key (starts with `eyJ`)

#### **Step 3: Configure in .env**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### **Step 4: Run Database Migrations**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

#### **Step 5: Test Supabase Connection**
```bash
# Test the connection
curl -H "apikey: $SUPABASE_ANON_KEY" \
  $SUPABASE_URL/rest/v1/
```

### **Pinecone Setup (Optional)**

#### **Step 1: Create Pinecone Account**
1. Go to [Pinecone](https://www.pinecone.io/)
2. Sign up for a free account
3. Create a new index
4. Note your API key and environment

#### **Step 2: Configure in .env**
```env
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-environment
PINECONE_INDEX_NAME=aris-embeddings
```

#### **Step 3: Test Pinecone Connection**
```bash
# Test the connection
curl -H "Api-Key: $PINECONE_API_KEY" \
  https://controller.$PINECONE_ENVIRONMENT.pinecone.io/databases
```

## 🗄️ Database Configuration

### **PostgreSQL Setup**

#### **Option 1: Use Supabase (Recommended)**
```env
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

#### **Option 2: Local PostgreSQL**
```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt-get install postgresql  # Ubuntu

# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Ubuntu

# Create database
createdb aris_enterprise
```

#### **Option 3: Docker PostgreSQL**
```bash
# Run PostgreSQL in Docker
docker run --name postgres-aris \
  -e POSTGRES_PASSWORD=aris_password \
  -e POSTGRES_DB=aris_enterprise \
  -p 5432:5432 \
  -d postgres:15
```

### **Database Schema Setup**

#### **Step 1: Enable Vector Extension**
```sql
-- Connect to your database and run:
CREATE EXTENSION IF NOT EXISTS vector;
```

#### **Step 2: Run Migrations**
```bash
# Run the migration files
psql $DATABASE_URL -f supabase/migrations/001_create_code_chunks_table.sql
psql $DATABASE_URL -f supabase/migrations/002_fix_stats_function.sql
```

#### **Step 3: Verify Setup**
```bash
# Test database connection
npm run test:db
```

## 🔧 Application Configuration

### **JWT Secret Generation**
```bash
# Generate a secure JWT secret
openssl rand -base64 32
```

Add to `.env`:
```env
JWT_SECRET=your-generated-jwt-secret-here
JWT_EXPIRES_IN=7d
```

### **Domain Configuration**
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### **Environment Mode**
```env
NODE_ENV=development  # or production
DEBUG=false
LOG_LEVEL=info
```

## 🧪 Testing Your Setup

### **1. Test All Connections**
```bash
# Create test script
cat > test-connections.js << 'EOF'
require('dotenv').config();

async function testConnections() {
  console.log('🔍 Testing ARiS Environment Setup...\n');

  // Test OpenAI
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
    }
  } catch (error) {
    console.log('❌ OpenAI API: Error -', error.message);
  }

  // Test Supabase
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
    }
  } catch (error) {
    console.log('❌ Supabase: Error -', error.message);
  }

  // Test Database
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    await pool.query('SELECT NOW()');
    console.log('✅ Database: Connected successfully');
    await pool.end();
  } catch (error) {
    console.log('❌ Database: Error -', error.message);
  }

  console.log('\n🎉 Environment setup complete!');
}

testConnections();
EOF

# Run the test
node test-connections.js
```

### **2. Test Application**
```bash
# Start the development server
npm run dev

# Open in browser
open http://localhost:3000
```

### **3. Test Agent System**
```bash
# Test the agent system
node test-hello-agent.js
```

## 🔒 Security Configuration

### **Environment Variables Security**
```bash
# Never commit .env to git
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### **API Key Rotation**
```bash
# Create a script to rotate API keys
cat > rotate-keys.sh << 'EOF'
#!/bin/bash
echo "🔑 Rotating API keys..."

# Generate new JWT secret
NEW_JWT_SECRET=$(openssl rand -base64 32)
echo "New JWT Secret: $NEW_JWT_SECRET"

# Update .env file
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$NEW_JWT_SECRET/" .env

echo "✅ API keys rotated successfully!"
EOF

chmod +x rotate-keys.sh
```

### **Production Security**
```env
# Production security settings
ENABLE_AUDIT_LOGGING=true
ENABLE_RBAC=true
ENABLE_COMPLIANCE_MODE=true
ENABLE_DATA_ENCRYPTION=true
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Monitoring Setup

### **Health Check Endpoints**
```bash
# Test health endpoints
curl http://localhost:3000/health
curl http://localhost:3000/health/db
curl http://localhost:3000/health/agents
```

### **Logging Configuration**
```env
# Logging settings
LOG_LEVEL=info
ENABLE_ERROR_TRACKING=true
ENABLE_ANALYTICS=true
```

## 🚨 Troubleshooting

### **Common Issues**

#### **1. OpenAI API Key Issues**
```bash
# Check if API key is valid
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# If you get 401, your key is invalid
# If you get 429, you've hit rate limits
# If you get 200, your key is working
```

#### **2. Supabase Connection Issues**
```bash
# Check Supabase status
curl -H "apikey: $SUPABASE_ANON_KEY" \
  $SUPABASE_URL/rest/v1/

# Check if vector extension is enabled
psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

#### **3. Database Connection Issues**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check if tables exist
psql $DATABASE_URL -c "\dt"
```

#### **4. Port Conflicts**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 $(lsof -t -i:3000)
```

### **Reset Environment**
```bash
# Reset to clean state
rm -rf node_modules
rm -rf .next
npm install
npm run dev
```

## 📋 Environment Checklist

### **Pre-Launch Checklist**
- [ ] OpenAI API key configured and tested
- [ ] Supabase project created and connected
- [ ] Database migrations run successfully
- [ ] JWT secret generated and configured
- [ ] Domain and CORS settings configured
- [ ] All health checks passing
- [ ] Agent system tested and working
- [ ] Security settings enabled
- [ ] Monitoring configured
- [ ] Backup strategy in place

### **Production Checklist**
- [ ] Environment variables secured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] Performance monitoring active
- [ ] Disaster recovery plan ready

## 🎉 Success!

Your ARiS environment is now configured and ready for development or production deployment!

### **Next Steps:**
1. **Customize Branding**: Follow the branding guide
2. **Deploy Platform**: Use the deployment guide
3. **Market & Sell**: Use the marketing materials

---

**ARiS Enterprise Platform** - Environment setup complete! 🚀 