# Fin Safe AI

A comprehensive React/Supabase risk management web application featuring real-time monitoring, AI-powered analytics, and automated compliance reporting.

## 🚀 Overview

Fin Safe AI is an enterprise-grade risk management platform that combines real-time data monitoring with AI-powered analytics to provide comprehensive risk assessment and compliance management. Built for financial institutions and regulated industries, it offers automated breach detection, regulatory reporting, and intelligent risk forecasting.

### Key Features

- **Real-time Risk Monitoring**: Live dashboard with KRI tracking and breach detection
- **AI-Powered Analytics**: OpenAI-powered risk assessment and predictive modeling
- **Automated Compliance**: OSFI E-21 compliant reporting and documentation
- **Intelligent Alerting**: Multi-channel notifications via email, SMS, and in-app alerts
- **Advanced Reporting**: PDF generation with customizable templates
- **Vendor Risk Management**: Third-party risk assessment and monitoring
- **Audit Trail**: Comprehensive logging and audit capabilities

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with shadcn/ui components
- **React Query** for state management and caching
- **Recharts** for data visualization
- **React Router** for navigation

### Backend
- **Supabase** (PostgreSQL + real-time + auth)
- **187 database tables** with comprehensive RLS policies
- **Edge Functions** for serverless compute
- **Real-time subscriptions** for live updates

### Integrations
- **OpenAI API** for AI-powered analytics
- **Resend** for email notifications
- **PDF generation** for reporting
- **WebSocket** for real-time updates

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Environment Setup

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd fin-safe-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create `.env.local` file with the following variables:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration (for edge functions)
OPENAI_API_KEY=your-openai-key-here

# Resend Configuration (for email notifications)
RESEND_API_KEY=your-resend-key-here

# Environment
NODE_ENV=development
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 🏗 Project Structure

```
fin-safe-ai/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── analytics/        # Analytics dashboards and charts
│   │   ├── auth/            # Authentication components
│   │   ├── common/          # Shared components (skeletons, etc.)
│   │   ├── controls/        # Risk controls management
│   │   ├── home/            # Landing page components
│   │   ├── layout/          # Layout components
│   │   ├── risk-appetite/   # Risk appetite management
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx
│   │   └── EnhancedAuthContext.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useRealtimeMetrics.ts
│   │   └── useControlsDashboardData.ts
│   ├── integrations/        # External integrations
│   │   └── supabase/        # Supabase client and types
│   ├── lib/                 # Utility libraries
│   │   ├── performance-utils.ts
│   │   ├── supabase-utils.ts
│   │   └── utils.ts
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Index.tsx
│   │   └── Auth.tsx
│   ├── services/            # Business logic services
│   │   ├── pdf-generation-service.ts
│   │   ├── kri-service.ts
│   │   └── vendor-service.ts
│   └── __tests__/           # Test files
│       ├── e2e/             # End-to-end tests
│       └── unit/            # Unit tests
├── supabase/
│   ├── functions/           # Edge functions
│   │   ├── ai-assistant/    # OpenAI integration
│   │   ├── calculate-vendor-risk/
│   │   ├── send-notification-email/
│   │   └── check-incident-sla-breaches/
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase configuration
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🎯 Core Features Guide

### 1. Dashboard & Analytics
- **Main Dashboard**: Real-time KRI monitoring with interactive charts
- **AI Assistant**: Natural language queries for risk analysis
- **Performance Monitoring**: System health and performance metrics
- **Alert Management**: Centralized notification center

### 2. Risk Management
- **KRI Monitoring**: Key Risk Indicator tracking with automated thresholds
- **Vendor Risk Assessment**: Third-party risk scoring and monitoring
- **Incident Management**: Automated incident detection and response
- **Compliance Tracking**: Regulatory compliance monitoring and reporting

### 3. AI-Powered Analytics
- **Predictive Modeling**: Machine learning-powered risk forecasting
- **Anomaly Detection**: AI-driven pattern recognition for unusual activity
- **Natural Language Processing**: Chat-based risk queries and insights
- **Automated Reporting**: AI-generated compliance reports

## 🚀 Getting Started

### Admin Onboarding
1. **Login**: Access the application at `/auth` with admin credentials
2. **Dashboard**: Navigate to `/app/dashboard` for the main control center
3. **AI Assistant**: Use the chat interface for natural language risk queries
4. **Alerts**: Configure notification preferences in settings
5. **Reports**: Generate compliance reports from the analytics section

### Using the AI Assistant
```
Example queries:
- "Show me high-risk vendors this month"
- "Generate a compliance report for Q3"
- "What are the trending risk indicators?"
- "Alert me when credit risk exceeds 85%"
```

### Key Navigation Paths
- **Dashboard**: `/app/dashboard` - Main analytics and monitoring
- **Risk Controls**: `/app/controls` - Risk management tools
- **Vendor Management**: `/app/vendors` - Third-party risk assessment
- **Reports**: `/app/reports` - Compliance and audit reporting
- **Settings**: `/app/settings` - System configuration

## ⚡ Performance Optimizations

### Frontend Performance
- **Code Splitting**: Route-based lazy loading
- **Virtualization**: Large dataset rendering with react-window
- **Caching**: React Query with 5-minute cache TTL
- **Bundle Optimization**: Vite-powered build with tree shaking
- **Image Optimization**: Responsive images with lazy loading

### Backend Performance
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Supabase connection management
- **Edge Functions**: Serverless compute for scalability
- **Real-time Subscriptions**: Efficient WebSocket connections
- **Row-Level Security**: Secure data access patterns

## 🔒 Security Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based auth
- **Row-Level Security**: Database-level access control
- **Multi-Factor Authentication**: Optional MFA support
- **Session Management**: Secure session handling
- **Role-Based Access Control**: Granular permissions

### Data Security
- **Encryption**: End-to-end data encryption
- **Audit Logging**: Comprehensive activity tracking
- **Data Validation**: Input sanitization and validation
- **HTTPS**: SSL/TLS encryption for all communications
- **API Security**: Rate limiting and request validation

## 🧪 Testing

### Test Coverage
- **Unit Tests**: 90%+ coverage with Vitest
- **Integration Tests**: API and database testing
- **E2E Tests**: Full workflow validation
- **Performance Tests**: Load testing and benchmarking

### Running Tests
```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Real-time Metrics**: System performance tracking
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Usage patterns and behavior
- **API Monitoring**: Endpoint performance and reliability

### Business Intelligence
- **Risk Dashboards**: Executive-level risk summaries
- **Trend Analysis**: Historical risk pattern analysis
- **Predictive Analytics**: Future risk forecasting
- **Compliance Reporting**: Regulatory requirement tracking

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Environment Variables
Ensure all required environment variables are set for production deployment.

## 🔧 Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📚 Documentation

- **API Documentation**: See `README-API.md`
- **Component Documentation**: Inline JSDoc comments
- **Database Schema**: Supabase dashboard documentation
- **Deployment Guide**: Environment-specific deployment instructions

## 🆘 Support

For technical support and questions:
- **Documentation**: Check README-API.md for detailed API information
- **Issues**: Report bugs via GitHub issues
- **Performance**: Monitor system health via the dashboard
- **Security**: Review security guidelines in the codebase

## 📄 License

This project is proprietary software. All rights reserved.