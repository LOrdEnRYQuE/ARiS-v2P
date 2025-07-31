# ARiS Mission Control Panel

A real-time monitoring dashboard for the ARiS agent society, providing comprehensive observability and control over the entire AI system.

## Features

### 🎯 Mission Control Panel (Operations Dashboard)
- **Live Agent Graph**: Visual representation of active agents with real-time status
- **Task Queue Status**: Real-time view of Prometheus's task execution
- **Resource Monitoring**: Live charts for API costs, model latency, and token usage
- **Quality Metrics**: Auditor performance and self-correction insights
- **System Status**: Overall system health and service monitoring

### 🏭 Model Control Plane (AI Factory)
- **Model Registry**: Central repository for fine-tuned AI models
- **A/B Testing**: Performance comparison and traffic management
- **Performance Monitoring**: Model drift detection and automated retraining
- **Model Deployment**: Version control and deployment management

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React for consistent iconography

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Architecture

### Components Structure

```
components/
├── Header.tsx              # Navigation and system status
├── AgentGraph.tsx          # Live agent activity visualization
├── TaskQueue.tsx           # Real-time task execution tracking
├── ResourceMonitoring.tsx  # System performance metrics
├── QualityMetrics.tsx      # Auditor performance insights
├── SystemStatus.tsx        # Overall system health
├── ModelRegistry.tsx       # AI model management
├── ABTesting.tsx          # A/B testing interface
├── PerformanceMonitoring.tsx # Model drift detection
└── ModelDeployment.tsx    # Deployment management
```

### Key Features

#### Real-Time Monitoring
- WebSocket integration for live updates
- Debounced data refresh to prevent UI lag
- Animated status indicators and progress bars

#### Agent Society Visualization
- Interactive agent cards with glow effects
- Status-based color coding (active, idle, error)
- Task completion counters and activity timestamps

#### Resource Analytics
- Time-series charts for API costs and latency
- System resource utilization (CPU, Memory, Disk)
- Token usage tracking and optimization insights

#### Quality Assurance
- Success rate tracking with visual indicators
- Error type breakdown and analysis
- Self-correction loop monitoring
- Response time optimization

#### Model Management
- Version control for fine-tuned models
- Performance comparison and drift detection
- Automated retraining triggers
- Deployment pipeline management

## Design System

### Color Palette
- **Primary**: Blue (#0ea5e9) - Main actions and highlights
- **Success**: Green (#22c55e) - Positive states and completions
- **Warning**: Orange (#f59e0b) - Caution and pending states
- **Error**: Red (#ef4444) - Errors and critical issues
- **Secondary**: Gray (#64748b) - Neutral and background elements

### Typography
- **Font**: Inter for clean, modern readability
- **Monospace**: JetBrains Mono for technical data
- **Hierarchy**: Clear size and weight variations

### Components
- **Cards**: Consistent padding and border radius
- **Status Indicators**: Color-coded badges and icons
- **Progress Bars**: Animated with smooth transitions
- **Charts**: Responsive with dark theme optimization

## Integration

### Agent Manager Integration
The dashboard connects to the ARiS Agent Manager to:
- Monitor agent status and activity
- Track task execution and progress
- Collect performance metrics
- Manage workflow coordination

### Real-Time Updates
- WebSocket connection for live data streaming
- Event-driven updates for immediate feedback
- Optimistic UI updates for better UX

## Development

### Adding New Components

1. Create component in `components/` directory
2. Follow naming convention: `ComponentName.tsx`
3. Use TypeScript interfaces for props
4. Implement responsive design with Tailwind
5. Add animations with Framer Motion

### Styling Guidelines

- Use Tailwind utility classes
- Follow the established color system
- Implement responsive breakpoints
- Ensure accessibility compliance
- Optimize for dark theme

### State Management

- Use React hooks for local state
- Implement proper TypeScript interfaces
- Handle loading and error states
- Provide fallback UI for missing data

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Follow the established code style
2. Add TypeScript types for all props
3. Include proper error handling
4. Test responsive design
5. Update documentation

## License

MIT License - see LICENSE file for details 