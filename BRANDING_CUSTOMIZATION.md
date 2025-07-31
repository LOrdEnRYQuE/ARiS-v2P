# ARiS Enterprise Platform - Branding Customization Guide

> **Complete guide to customize ARiS for your brand**

## 🎯 Quick Customization Checklist

### **Essential Branding Elements**
- [ ] Company name and logo
- [ ] Contact information and support details
- [ ] Color scheme and visual identity
- [ ] Domain and hosting information
- [ ] Legal and compliance information

### **Content Customization**
- [ ] README.md - Main project description
- [ ] Marketing materials - Brochures and presentations
- [ ] Documentation - User guides and API docs
- [ ] Email templates - Support and sales communications
- [ ] Social media - LinkedIn, Twitter, website content

## 🏢 Company Information Template

### **Basic Information**
```yaml
Company Name: [Your Company Name]
Website: https://yourcompany.com
Email: contact@yourcompany.com
Phone: +1 (555) 123-4567
Address: [Your Company Address]

Support Email: support@yourcompany.com
Sales Email: sales@yourcompany.com
Enterprise Email: enterprise@yourcompany.com
```

### **Social Media & Online Presence**
```yaml
LinkedIn: https://linkedin.com/company/yourcompany
Twitter: https://twitter.com/yourcompany
GitHub: https://github.com/yourcompany
Documentation: https://docs.yourcompany.com
API Reference: https://api.yourcompany.com
```

### **Legal Information**
```yaml
Legal Company Name: [Full Legal Name]
Tax ID: [Your Tax ID]
Privacy Policy: https://yourcompany.com/privacy
Terms of Service: https://yourcompany.com/terms
GDPR Compliance: https://yourcompany.com/gdpr
```

## 📝 Files to Customize

### **1. README.md**
**Location**: `/README.md`
**Customization Points**:
- Company name and branding
- Contact information
- Support links
- Legal disclaimers

**Example Changes**:
```markdown
# [Your Company Name] - Enterprise AI Agent Platform

> **White-Label Solution for Enterprise AI Automation**

[Your Company Name] is a comprehensive enterprise-grade AI agent platform...

## 🆘 Support & Contact

### Technical Support
- **Documentation**: [docs.yourcompany.com](https://docs.yourcompany.com)
- **API Reference**: [api.yourcompany.com](https://api.yourcompany.com)
- **Community Forum**: [community.yourcompany.com](https://community.yourcompany.com)

### Enterprise Sales
- **Email**: enterprise@yourcompany.com
- **Phone**: +1 (555) 123-4567
- **Website**: [yourcompany.com](https://yourcompany.com)
```

### **2. Marketing Materials**
**Location**: `/MARKETING_GUIDE.md`
**Customization Points**:
- Company-specific case studies
- Custom pricing tiers
- Industry-specific messaging
- Contact information

### **3. Deployment Guide**
**Location**: `/DEPLOYMENT_GUIDE.md`
**Customization Points**:
- Company-specific deployment instructions
- Custom domain configurations
- Support contact information
- Company-specific troubleshooting

### **4. Environment Configuration**
**Location**: `/.env.example`
**Customization Points**:
- Default domain settings
- Company-specific API endpoints
- Custom feature flags
- Brand-specific configurations

## 🎨 Visual Branding

### **Color Scheme**
```css
/* Primary Brand Colors */
--primary-color: #your-primary-color;
--secondary-color: #your-secondary-color;
--accent-color: #your-accent-color;

/* UI Colors */
--background-color: #your-background;
--text-color: #your-text-color;
--border-color: #your-border-color;
```

### **Logo Integration**
**File Locations**:
- `/apps/mission-control/public/logo.png`
- `/apps/mission-control/public/favicon.ico`
- `/apps/mission-control/public/apple-touch-icon.png`

**Recommended Sizes**:
- Logo: 200x60px (PNG/SVG)
- Favicon: 32x32px (ICO)
- Apple Touch Icon: 180x180px (PNG)

### **Brand Assets**
```bash
# Create brand assets directory
mkdir -p brand-assets
mkdir -p brand-assets/logos
mkdir -p brand-assets/icons
mkdir -p brand-assets/documents
```

## 📧 Email Templates

### **Support Email Template**
```html
Subject: [Your Company] - Support Request

Dear [Customer Name],

Thank you for contacting [Your Company] support.

[Your response here]

Best regards,
[Your Name]
[Your Company] Support Team
support@yourcompany.com
+1 (555) 123-4567
```

### **Sales Email Template**
```html
Subject: [Your Company] - Enterprise AI Platform Demo

Dear [Prospect Name],

Thank you for your interest in [Your Company]'s Enterprise AI Platform.

[Your pitch here]

Best regards,
[Your Name]
[Your Company] Sales Team
sales@yourcompany.com
+1 (555) 123-4567
```

## 🌐 Domain & Hosting Setup

### **Domain Configuration**
```yaml
Primary Domain: yourcompany.com
App Domain: app.yourcompany.com
API Domain: api.yourcompany.com
Docs Domain: docs.yourcompany.com
```

### **SSL Certificates**
```bash
# Generate SSL certificates
certbot certonly --webroot -w /var/www/html -d yourcompany.com
certbot certonly --webroot -w /var/www/html -d app.yourcompany.com
certbot certonly --webroot -w /var/www/html -d api.yourcompany.com
```

### **DNS Configuration**
```yaml
A Records:
  yourcompany.com -> [Your Server IP]
  app.yourcompany.com -> [Your Server IP]
  api.yourcompany.com -> [Your Server IP]

CNAME Records:
  www.yourcompany.com -> yourcompany.com
  docs.yourcompany.com -> yourcompany.com
```

## 📋 Customization Script

### **Automated Branding Script**
```bash
#!/bin/bash
# branding-customization.sh

# Company information
COMPANY_NAME="Your Company Name"
COMPANY_EMAIL="contact@yourcompany.com"
COMPANY_PHONE="+1 (555) 123-4567"
COMPANY_WEBSITE="https://yourcompany.com"

# Update README.md
sed -i "s/yourcompany.com/$COMPANY_WEBSITE/g" README.md
sed -i "s/your-org/$COMPANY_NAME/g" README.md
sed -i "s/contact@yourcompany.com/$COMPANY_EMAIL/g" README.md

# Update environment variables
sed -i "s/your-domain.com/$(echo $COMPANY_WEBSITE | sed 's|https://||')/g" .env.example

# Update marketing materials
sed -i "s/Your Company Name/$COMPANY_NAME/g" MARKETING_GUIDE.md
sed -i "s/yourcompany.com/$(echo $COMPANY_WEBSITE | sed 's|https://||')/g" MARKETING_GUIDE.md

echo "Branding customization complete!"
```

## 🔧 Technical Customization

### **Package.json Updates**
```json
{
  "name": "@yourcompany/aris-enterprise",
  "description": "Enterprise AI Agent Platform by Your Company",
  "author": "Your Company <contact@yourcompany.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourcompany/aris-enterprise.git"
  }
}
```

### **Docker Configuration**
```dockerfile
# Update Docker labels
LABEL maintainer="Your Company <contact@yourcompany.com>"
LABEL vendor="Your Company"
LABEL version="1.0.0"
```

### **Kubernetes Configuration**
```yaml
# Update Kubernetes labels
metadata:
  name: yourcompany-aris
  labels:
    app: yourcompany-aris
    vendor: yourcompany
```

## 📊 Branding Checklist

### **Pre-Launch Checklist**
- [ ] Company name updated in all files
- [ ] Contact information updated
- [ ] Logo and visual assets integrated
- [ ] Domain and hosting configured
- [ ] SSL certificates installed
- [ ] Email templates created
- [ ] Social media accounts set up
- [ ] Legal documents updated
- [ ] Support documentation customized
- [ ] Sales materials branded

### **Post-Launch Checklist**
- [ ] Website analytics configured
- [ ] Customer feedback system set up
- [ ] Support ticket system integrated
- [ ] Sales CRM configured
- [ ] Marketing automation set up
- [ ] Social media monitoring active
- [ ] Brand monitoring tools installed
- [ ] Customer success program launched

## 🚀 Quick Start Commands

### **1. Run Branding Script**
```bash
chmod +x branding-customization.sh
./branding-customization.sh
```

### **2. Update Visual Assets**
```bash
# Replace logo files
cp your-logo.png apps/mission-control/public/logo.png
cp your-favicon.ico apps/mission-control/public/favicon.ico
```

### **3. Update Environment**
```bash
cp .env.example .env
# Edit .env with your specific configuration
```

### **4. Test Customization**
```bash
npm run dev
# Verify branding appears correctly
```

---

**Your Company Name** - Ready to dominate the AI agent market! 🚀 