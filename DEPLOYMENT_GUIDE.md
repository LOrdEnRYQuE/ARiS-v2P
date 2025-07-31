# ARiS Enterprise Platform - Deployment Guide

> **Complete deployment guide for enterprise environments**

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Development Deployment](#development-deployment)
5. [Production Deployment](#production-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Kubernetes Deployment](#kubernetes-deployment)
8. [Cloud Deployment](#cloud-deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version
- **Docker**: 20.x or higher (for containerized deployment)
- **Kubernetes**: 1.24+ (for K8s deployment)

### Cloud Services
- **Supabase Account**: For database and authentication
- **OpenAI API Key**: For AI model access
- **Pinecone Account**: For vector database (optional)
- **Cloud Provider**: AWS, GCP, or Azure for production

## 🌍 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/aris-enterprise.git
cd aris-enterprise
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Set Up Database
```bash
# Run Supabase migrations
npx supabase db push

# Verify database connection
npm run test:db
```

## 🗄️ Database Configuration

### Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and API keys

2. **Configure Environment Variables**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Run Migrations**
   ```bash
   npx supabase db push
   ```

4. **Verify Setup**
   ```bash
   npm run test:supabase
   ```

### Vector Database Setup

#### Option 1: Pinecone
```env
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX_NAME=aris-embeddings
```

#### Option 2: Supabase Vector
```env
SUPABASE_VECTOR_ENABLED=true
```

## 🚀 Development Deployment

### Local Development
```bash
# Start development server
npm run dev

# Access the application
open http://localhost:3000
```

### Development with Docker
```bash
# Build development image
docker build -f Dockerfile.dev -t aris-dev .

# Run development container
docker run -p 3000:3000 -v $(pwd):/app aris-dev
```

## 🏭 Production Deployment

### 1. Build Application
```bash
# Install dependencies
npm ci --only=production

# Build application
npm run build

# Test build
npm run test:build
```

### 2. Environment Configuration
```bash
# Set production environment
export NODE_ENV=production

# Configure production variables
export PORT=3000
export JWT_SECRET=your-super-secure-secret
export DATABASE_URL=your-production-database-url
```

### 3. Start Production Server
```bash
# Start with PM2 (recommended)
npm install -g pm2
pm2 start npm --name "aris-enterprise" -- start

# Or start directly
npm start
```

## 🐳 Docker Deployment

### 1. Create Dockerfile
```dockerfile
# Use the existing Dockerfile or create a production one
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

### 2. Build and Run
```bash
# Build Docker image
docker build -t aris-enterprise .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=$DATABASE_URL \
  -e JWT_SECRET=$JWT_SECRET \
  aris-enterprise
```

### 3. Docker Compose (Recommended)
```yaml
# docker-compose.yml
version: '3.8'
services:
  aris-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: aris
      POSTGRES_USER: aris_user
      POSTGRES_PASSWORD: aris_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  redis_data:
  postgres_data:
```

## ☸️ Kubernetes Deployment

### 1. Create Namespace
```bash
kubectl create namespace aris
kubectl config set-context --current --namespace=aris
```

### 2. Create ConfigMap
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: aris-config
data:
  NODE_ENV: "production"
  PORT: "3000"
  DATABASE_URL: "your-database-url"
```

### 3. Create Secret
```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: aris-secrets
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  OPENAI_API_KEY: <base64-encoded-key>
```

### 4. Create Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aris-enterprise
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aris-enterprise
  template:
    metadata:
      labels:
        app: aris-enterprise
    spec:
      containers:
      - name: aris-app
        image: aris-enterprise:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: aris-config
        - secretRef:
            name: aris-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 5. Create Service
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: aris-service
spec:
  selector:
    app: aris-enterprise
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### 6. Deploy to Kubernetes
```bash
# Apply all configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. ECS Deployment
```bash
# Create ECR repository
aws ecr create-repository --repository-name aris-enterprise

# Build and push image
docker build -t aris-enterprise .
docker tag aris-enterprise:latest $AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com/aris-enterprise:latest
docker push $AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com/aris-enterprise:latest
```

#### 2. EKS Deployment
```bash
# Create EKS cluster
eksctl create cluster --name aris-cluster --region us-east-1

# Deploy to EKS
kubectl apply -f k8s/
```

### Google Cloud Deployment

#### 1. GKE Deployment
```bash
# Create GKE cluster
gcloud container clusters create aris-cluster --zone us-central1-a

# Deploy to GKE
kubectl apply -f k8s/
```

#### 2. Cloud Run Deployment
```bash
# Deploy to Cloud Run
gcloud run deploy aris-enterprise \
  --image gcr.io/$PROJECT_ID/aris-enterprise \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment

#### 1. AKS Deployment
```bash
# Create AKS cluster
az aks create --resource-group aris-rg --name aris-cluster --node-count 3

# Deploy to AKS
kubectl apply -f k8s/
```

## 📊 Monitoring & Maintenance

### 1. Health Checks
```bash
# Application health
curl http://localhost:3000/health

# Database health
curl http://localhost:3000/health/db

# Agent health
curl http://localhost:3000/health/agents
```

### 2. Logging
```bash
# View application logs
pm2 logs aris-enterprise

# View Docker logs
docker logs aris-container

# View Kubernetes logs
kubectl logs -l app=aris-enterprise
```

### 3. Performance Monitoring
```bash
# Monitor system resources
htop
iotop
nethogs

# Monitor application metrics
curl http://localhost:3000/metrics
```

### 4. Backup & Recovery
```bash
# Database backup
pg_dump $DATABASE_URL > backup.sql

# Application backup
tar -czf aris-backup.tar.gz /app

# Restore from backup
psql $DATABASE_URL < backup.sql
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Test database connection
npm run test:db

# Check database status
npx supabase status
```

#### 2. API Key Issues
```bash
# Verify OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Verify Supabase keys
curl -H "apikey: $SUPABASE_ANON_KEY" \
  $SUPABASE_URL/rest/v1/
```

#### 3. Memory Issues
```bash
# Check memory usage
free -h
docker stats

# Increase memory limits
docker run -m 2g aris-enterprise
```

#### 4. Network Issues
```bash
# Test network connectivity
ping google.com
nslookup your-domain.com

# Check firewall rules
sudo ufw status
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_code_chunks_embeddings ON code_chunks USING ivfflat (embeddings vector_cosine_ops);

-- Analyze table statistics
ANALYZE code_chunks;
```

#### 2. Application Optimization
```bash
# Enable compression
npm install compression

# Enable caching
npm install redis

# Optimize bundle size
npm run build:analyze
```

#### 3. Infrastructure Optimization
```bash
# Auto-scaling configuration
kubectl autoscale deployment aris-enterprise --cpu-percent=70 --min=3 --max=10

# Resource limits
kubectl set resources deployment aris-enterprise --limits=cpu=1,memory=1Gi
```

## 📞 Support

For deployment support:
- **Documentation**: [docs.yourcompany.com](https://docs.yourcompany.com)
- **Community**: [community.yourcompany.com](https://community.yourcompany.com)
- **Support**: [support.yourcompany.com](https://support.yourcompany.com)

---

**ARiS Enterprise Platform** - Deployed and ready for enterprise success! 🚀 