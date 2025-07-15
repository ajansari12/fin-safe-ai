# Fin Safe AI - API Documentation

Comprehensive API documentation for the Fin Safe AI risk management platform.

## 🔐 Authentication

### Supabase JWT Authentication
All API requests require authentication using Supabase JWT tokens.

```typescript
// Authentication headers
const headers = {
  'Authorization': `Bearer ${session.access_token}`,
  'apikey': process.env.VITE_SUPABASE_ANON_KEY,
  'Content-Type': 'application/json'
}
```

### Session Management
- **Session Duration**: 1 hour (configurable)
- **Refresh Tokens**: Automatic token refresh
- **Multi-device Support**: Concurrent session handling
- **Session Invalidation**: Logout across all devices

## 🚀 Edge Functions

### 1. AI Assistant (`ai-assistant`)
**Purpose**: OpenAI-powered risk analysis and natural language processing

**Endpoint**: `POST /functions/v1/ai-assistant`

**Request Body**:
```json
{
  "message": "Show me high-risk vendors this month",
  "context": {
    "module": "vendor_management",
    "user_id": "uuid",
    "org_id": "uuid"
  }
}
```

**Response**:
```json
{
  "response": "Based on current data, you have 3 high-risk vendors...",
  "confidence": 0.95,
  "sources": ["vendor_risk_assessments", "kri_logs"],
  "execution_time": 2.3
}
```

**Error Handling**:
- `400`: Invalid request format
- `401`: Unauthorized access
- `429`: Rate limit exceeded
- `500`: OpenAI API error

### 2. Vendor Risk Calculation (`calculate-vendor-risk`)
**Purpose**: Automated vendor risk scoring and assessment

**Endpoint**: `POST /functions/v1/calculate-vendor-risk`

**Request Body**:
```json
{
  "vendor_id": "uuid",
  "assessment_date": "2024-01-15",
  "factors": {
    "financial_stability": 0.85,
    "security_posture": 0.92,
    "operational_resilience": 0.78
  }
}
```

**Response**:
```json
{
  "risk_score": 3.2,
  "risk_level": "medium",
  "recommendations": [
    "Increase monitoring frequency",
    "Request updated financial statements"
  ],
  "next_assessment_date": "2024-04-15"
}
```

### 3. Email Notifications (`send-notification-email`)
**Purpose**: Automated email notifications using Resend

**Endpoint**: `POST /functions/v1/send-notification-email`

**Request Body**:
```json
{
  "recipient": "admin@company.com",
  "template": "kri_breach_alert",
  "data": {
    "kri_name": "Credit Risk Ratio",
    "current_value": 0.87,
    "threshold": 0.85,
    "breach_time": "2024-01-15T14:30:00Z"
  }
}
```

### 4. SLA Breach Detection (`check-incident-sla-breaches`)
**Purpose**: Automated incident SLA monitoring and escalation

**Endpoint**: `POST /functions/v1/check-incident-sla-breaches`

**Response**:
```json
{
  "breaches_detected": 2,
  "escalations_triggered": 1,
  "incidents_processed": 45,
  "execution_time": 1.2
}
```

## 🗄️ Database Schema

### Core Tables

#### 1. `organizations`
Organization master data and configuration.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT,
  size TEXT,
  regulatory_guidelines TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 2. `kri_logs`
Key Risk Indicator measurement logs and breach tracking.

```sql
CREATE TABLE kri_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kri_id UUID NOT NULL REFERENCES kri_definitions(id),
  measurement_date DATE NOT NULL,
  actual_value NUMERIC NOT NULL,
  threshold_value NUMERIC,
  threshold_breached TEXT,
  variance_percentage NUMERIC,
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 3. `third_party_profiles`
Vendor and third-party risk management.

```sql
CREATE TABLE third_party_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name TEXT NOT NULL,
  risk_rating TEXT DEFAULT 'medium',
  last_assessment_date DATE,
  contract_end_date DATE,
  criticality_level TEXT DEFAULT 'medium',
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 4. `analytics_insights`
AI-generated insights and analytics results.

```sql
CREATE TABLE analytics_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL,
  insight_data JSONB DEFAULT '{}',
  confidence_score NUMERIC,
  valid_until TIMESTAMP WITH TIME ZONE,
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Key Relationships
- All tables include `org_id` for multi-tenant architecture
- Row-Level Security (RLS) policies enforce data isolation
- Foreign key constraints ensure data integrity
- Indexed columns for performance optimization

## 🔄 Service Integrations

### OpenAI Integration
```typescript
// AI Assistant Service
const aiResponse = await supabase.functions.invoke('ai-assistant', {
  body: {
    message: query,
    context: {
      module: 'risk_analysis',
      user_id: user.id,
      org_id: profile.organization_id
    }
  }
});
```

### Resend Email Service
```typescript
// Email Notification Service
const emailResult = await supabase.functions.invoke('send-notification-email', {
  body: {
    recipient: 'admin@company.com',
    template: 'kri_breach_alert',
    data: breachData
  }
});
```

### PDF Generation Service
```typescript
// PDF Report Generation
const pdfResult = await supabase.functions.invoke('generate-pdf-report', {
  body: {
    reportType: 'compliance',
    data: reportData,
    template: 'osfi_e21'
  }
});
```

## 📊 Performance Considerations

### Database Performance
- **Connection Pooling**: Supabase manages connection pools automatically
- **Query Optimization**: Indexed columns for frequent queries
- **Pagination**: Limit results to 50 items per page
- **Caching**: React Query with 5-minute TTL for dashboard data

### API Performance
- **Response Times**: Target <3s for dashboard queries
- **Concurrent Limits**: 25 concurrent users supported
- **Rate Limiting**: 100 requests per minute per user
- **Error Recovery**: Exponential backoff for failed requests

### Real-time Performance
```typescript
// Real-time subscription setup
const channel = supabase
  .channel('kri-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'kri_logs'
  }, (payload) => {
    handleKRIUpdate(payload.new);
  })
  .subscribe();
```

## 🛡️ Security

### Row-Level Security (RLS)
All tables implement RLS policies for data isolation:

```sql
-- Example RLS policy
CREATE POLICY "Users can only access their org data"
ON kri_logs
FOR ALL
USING (
  org_id IN (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid()
  )
);
```

### API Security
- **JWT Validation**: All endpoints validate JWT tokens
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all user inputs
- **SQL Injection Prevention**: Parameterized queries only

## 🔍 Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "kri_id",
      "reason": "UUID format required"
    },
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Invalid request parameters
- `AUTHENTICATION_ERROR`: Invalid or expired JWT
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Requested resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server-side error

## 🔄 Webhooks

### Real-time Updates
```typescript
// WebSocket connection for real-time updates
const subscription = supabase
  .channel('realtime-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'kri_logs'
  }, handleRealtimeUpdate)
  .subscribe();
```

### Webhook Endpoints
- **KRI Breach Alerts**: Triggered when KRI thresholds are exceeded
- **Vendor Risk Updates**: Notifications for vendor risk changes
- **Incident Escalations**: Automated incident escalation notifications
- **Report Generation**: Completion notifications for generated reports

## 🧪 Development & Testing

### API Testing
```bash
# Run API tests
npm run test:api

# Test specific endpoint
npm run test:api -- --grep "ai-assistant"
```

### Mock Data Generation
```typescript
// Generate test data for development
const mockKRIData = await supabase.functions.invoke('generate-mock-data', {
  body: {
    table: 'kri_logs',
    count: 1000,
    date_range: '2024-01-01,2024-12-31'
  }
});
```

### Performance Testing
```bash
# Load testing
npm run test:load

# Performance benchmarking
npm run test:performance
```

## 📈 Monitoring & Observability

### API Metrics
- **Response Time**: Average response time per endpoint
- **Error Rate**: Percentage of failed requests
- **Throughput**: Requests per second
- **Availability**: Uptime percentage

### Business Metrics
- **KRI Breach Rate**: Percentage of KRI measurements exceeding thresholds
- **Vendor Risk Distribution**: Risk level distribution across vendors
- **Incident Resolution Time**: Average time to resolve incidents
- **Report Generation Time**: Time to generate compliance reports

### Logging
```typescript
// Structured logging example
console.log({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  service: 'ai-assistant',
  message: 'Processing risk query',
  context: {
    user_id: userId,
    org_id: orgId,
    query_type: 'vendor_risk'
  }
});
```

## 📚 Additional Resources

### Supabase Documentation
- **Database Schema**: [Supabase Dashboard](https://supabase.com/dashboard)
- **Edge Functions**: [Function Logs](https://supabase.com/dashboard/functions)
- **Real-time**: [Realtime Documentation](https://supabase.com/docs/guides/realtime)

### External APIs
- **OpenAI**: [API Documentation](https://platform.openai.com/docs)
- **Resend**: [Email API](https://resend.com/docs)
- **Compliance**: OSFI E-21 Guidelines

### Development Tools
- **Database Migration**: `npm run db:migrate`
- **Schema Generation**: `npm run db:generate-types`
- **API Testing**: Postman collection available
- **Performance Profiling**: Built-in performance monitoring

## 🔧 Configuration

### Environment Variables
```env
# Required for all environments
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Edge function secrets (configured in Supabase dashboard)
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
```

### Supabase Configuration
```toml
# supabase/config.toml
[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://your-domain.com"]
```

This API documentation provides comprehensive coverage of the Fin Safe AI platform's backend architecture, endpoints, and integration patterns. For implementation details, refer to the main README.md file.