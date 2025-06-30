
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: APIParameter[];
  responses: APIResponse[];
  authentication: 'bearer' | 'api_key' | 'oauth' | 'none';
  rateLimit: {
    requests: number;
    window: string; // e.g., "1m", "1h", "1d"
  };
}

export interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: any;
}

export interface APIResponse {
  status: number;
  description: string;
  schema: any;
  example?: any;
}

export interface GraphQLSchema {
  types: GraphQLType[];
  queries: GraphQLQuery[];
  mutations: GraphQLMutation[];
}

export interface GraphQLType {
  name: string;
  fields: GraphQLField[];
  description?: string;
}

export interface GraphQLField {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
}

export interface GraphQLQuery {
  name: string;
  returnType: string;
  parameters: GraphQLParameter[];
  description: string;
}

export interface GraphQLMutation {
  name: string;
  returnType: string;
  parameters: GraphQLParameter[];
  description: string;
}

export interface GraphQLParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface RateLimitConfig {
  endpoint: string;
  requests: number;
  window: string;
  burst?: number;
  skipIf?: string; // condition to skip rate limiting
}

class APIFrameworkService {
  async getRESTAPIDocumentation(): Promise<APIEndpoint[]> {
    return [
      {
        path: '/api/v1/customers',
        method: 'GET',
        description: 'Retrieve customer information',
        parameters: [
          {
            name: 'page',
            type: 'number',
            required: false,
            description: 'Page number for pagination',
            example: 1
          },
          {
            name: 'limit',
            type: 'number',
            required: false,
            description: 'Number of records per page',
            example: 100
          },
          {
            name: 'status',
            type: 'string',
            required: false,
            description: 'Filter by customer status',
            example: 'active'
          }
        ],
        responses: [
          {
            status: 200,
            description: 'Successfully retrieved customers',
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Customer' }
                },
                pagination: { $ref: '#/components/schemas/Pagination' }
              }
            },
            example: {
              data: [
                {
                  id: '12345',
                  name: 'John Doe',
                  email: 'john.doe@example.com',
                  status: 'active'
                }
              ],
              pagination: {
                page: 1,
                limit: 100,
                total: 1250,
                pages: 13
              }
            }
          }
        ],
        authentication: 'bearer',
        rateLimit: {
          requests: 1000,
          window: '1h'
        }
      },
      {
        path: '/api/v1/incidents',
        method: 'POST',
        description: 'Create a new incident report',
        parameters: [
          {
            name: 'title',
            type: 'string',
            required: true,
            description: 'Incident title',
            example: 'System Outage'
          },
          {
            name: 'severity',
            type: 'string',
            required: true,
            description: 'Incident severity level',
            example: 'critical'
          },
          {
            name: 'description',
            type: 'string',
            required: true,
            description: 'Detailed incident description',
            example: 'Core banking system is experiencing downtime'
          }
        ],
        responses: [
          {
            status: 201,
            description: 'Incident created successfully',
            schema: {
              $ref: '#/components/schemas/Incident'
            },
            example: {
              id: 'INC-2024-001',
              title: 'System Outage',
              severity: 'critical',
              status: 'open',
              created_at: '2024-01-15T10:30:00Z'
            }
          }
        ],
        authentication: 'bearer',
        rateLimit: {
          requests: 100,
          window: '1h'
        }
      },
      {
        path: '/api/v1/controls/{controlId}/tests',
        method: 'GET',
        description: 'Get control test results',
        parameters: [
          {
            name: 'controlId',
            type: 'string',
            required: true,
            description: 'Control identifier',
            example: 'CTRL-001'
          },
          {
            name: 'from_date',
            type: 'string',
            required: false,
            description: 'Start date for test results (ISO 8601)',
            example: '2024-01-01T00:00:00Z'
          },
          {
            name: 'to_date',
            type: 'string',
            required: false,
            description: 'End date for test results (ISO 8601)',
            example: '2024-01-31T23:59:59Z'
          }
        ],
        responses: [
          {
            status: 200,
            description: 'Control test results retrieved successfully',
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/ControlTest' }
            }
          }
        ],
        authentication: 'bearer',
        rateLimit: {
          requests: 500,
          window: '1h'
        }
      }
    ];
  }

  async getGraphQLSchema(): Promise<GraphQLSchema> {
    return {
      types: [
        {
          name: 'Customer',
          fields: [
            { name: 'id', type: 'ID', nullable: false, description: 'Unique customer identifier' },
            { name: 'name', type: 'String', nullable: false, description: 'Customer full name' },
            { name: 'email', type: 'String', nullable: true, description: 'Customer email address' },
            { name: 'status', type: 'CustomerStatus', nullable: false, description: 'Customer account status' },
            { name: 'accounts', type: '[Account]', nullable: false, description: 'Customer accounts' },
            { name: 'createdAt', type: 'DateTime', nullable: false, description: 'Account creation date' }
          ],
          description: 'Customer information and account details'
        },
        {
          name: 'Incident',
          fields: [
            { name: 'id', type: 'ID', nullable: false, description: 'Unique incident identifier' },
            { name: 'title', type: 'String', nullable: false, description: 'Incident title' },
            { name: 'description', type: 'String', nullable: true, description: 'Detailed description' },
            { name: 'severity', type: 'IncidentSeverity', nullable: false, description: 'Severity level' },
            { name: 'status', type: 'IncidentStatus', nullable: false, description: 'Current status' },
            { name: 'reportedAt', type: 'DateTime', nullable: false, description: 'Reporting timestamp' },
            { name: 'resolvedAt', type: 'DateTime', nullable: true, description: 'Resolution timestamp' }
          ],
          description: 'Incident tracking and management'
        },
        {
          name: 'Control',
          fields: [
            { name: 'id', type: 'ID', nullable: false, description: 'Control identifier' },
            { name: 'name', type: 'String', nullable: false, description: 'Control name' },
            { name: 'description', type: 'String', nullable: true, description: 'Control description' },
            { name: 'category', type: 'ControlCategory', nullable: false, description: 'Control category' },
            { name: 'effectivenessScore', type: 'Float', nullable: true, description: 'Effectiveness rating' },
            { name: 'tests', type: '[ControlTest]', nullable: false, description: 'Control test results' }
          ],
          description: 'Risk control and testing information'
        }
      ],
      queries: [
        {
          name: 'customers',
          returnType: '[Customer]',
          parameters: [
            { name: 'filter', type: 'CustomerFilter', required: false, description: 'Customer filtering options' },
            { name: 'pagination', type: 'PaginationInput', required: false, description: 'Pagination settings' }
          ],
          description: 'Query customers with optional filtering and pagination'
        },
        {
          name: 'customer',
          returnType: 'Customer',
          parameters: [
            { name: 'id', type: 'ID', required: true, description: 'Customer ID to retrieve' }
          ],
          description: 'Get a specific customer by ID'
        },
        {
          name: 'incidents',
          returnType: '[Incident]',
          parameters: [
            { name: 'status', type: 'IncidentStatus', required: false, description: 'Filter by incident status' },
            { name: 'severity', type: 'IncidentSeverity', required: false, description: 'Filter by severity level' },
            { name: 'dateRange', type: 'DateRangeInput', required: false, description: 'Filter by date range' }
          ],
          description: 'Query incidents with filtering options'
        },
        {
          name: 'controls',
          returnType: '[Control]',
          parameters: [
            { name: 'category', type: 'ControlCategory', required: false, description: 'Filter by control category' },
            { name: 'effectivenessThreshold', type: 'Float', required: false, description: 'Minimum effectiveness score' }
          ],
          description: 'Query risk controls with filtering'
        }
      ],
      mutations: [
        {
          name: 'createIncident',
          returnType: 'Incident',
          parameters: [
            { name: 'input', type: 'CreateIncidentInput', required: true, description: 'Incident creation data' }
          ],
          description: 'Create a new incident report'
        },
        {
          name: 'updateIncidentStatus',
          returnType: 'Incident',
          parameters: [
            { name: 'id', type: 'ID', required: true, description: 'Incident ID to update' },
            { name: 'status', type: 'IncidentStatus', required: true, description: 'New incident status' },
            { name: 'notes', type: 'String', required: false, description: 'Update notes' }
          ],
          description: 'Update incident status and add notes'
        },
        {
          name: 'createControlTest',
          returnType: 'ControlTest',
          parameters: [
            { name: 'input', type: 'CreateControlTestInput', required: true, description: 'Control test data' }
          ],
          description: 'Record a new control test result'
        }
      ]
    };
  }

  async getRateLimitConfiguration(): Promise<RateLimitConfig[]> {
    return [
      {
        endpoint: '/api/v1/customers',
        requests: 1000,
        window: '1h',
        burst: 50,
        skipIf: 'user.role === "admin"'
      },
      {
        endpoint: '/api/v1/incidents',
        requests: 500,
        window: '1h',
        burst: 25
      },
      {
        endpoint: '/api/v1/controls',
        requests: 2000,
        window: '1h',
        burst: 100
      },
      {
        endpoint: '/api/v1/regulatory-reports',
        requests: 100,
        window: '1h',
        burst: 10
      },
      {
        endpoint: '/graphql',
        requests: 5000,
        window: '1h',
        burst: 250,
        skipIf: 'query.complexity < 100'
      }
    ];
  }

  async validateAPIKey(apiKey: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, is_active, expires_at')
        .eq('key_value', apiKey)
        .single();

      if (error || !data) return false;

      // Check if key is active
      if (!data.is_active) return false;

      // Check if key has not expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return false;
      }

      // Update last used timestamp
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id);

      return true;
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  }

  async logAPIRequest(endpoint: string, method: string, userId?: string, responseTime?: number): Promise<void> {
    try {
      await supabase
        .from('api_request_logs')
        .insert({
          endpoint,
          method,
          user_id: userId,
          response_time_ms: responseTime,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging API request:', error);
    }
  }

  generateOpenAPISpec(): any {
    return {
      openapi: '3.0.0',
      info: {
        title: 'Business Continuity Platform API',
        version: '1.0.0',
        description: 'Comprehensive API for business continuity and risk management',
        contact: {
          name: 'API Support',
          email: 'api-support@yourcompany.com'
        }
      },
      servers: [
        {
          url: 'https://api.yourcompany.com/v1',
          description: 'Production server'
        },
        {
          url: 'https://staging-api.yourcompany.com/v1',
          description: 'Staging server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          },
          apiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          }
        },
        schemas: {
          Customer: {
            type: 'object',
            required: ['id', 'name', 'status'],
            properties: {
              id: { type: 'string', description: 'Unique customer identifier' },
              name: { type: 'string', description: 'Customer full name' },
              email: { type: 'string', format: 'email', description: 'Customer email' },
              status: { 
                type: 'string', 
                enum: ['active', 'inactive', 'suspended'],
                description: 'Customer account status'
              }
            }
          },
          Incident: {
            type: 'object',
            required: ['id', 'title', 'severity', 'status'],
            properties: {
              id: { type: 'string', description: 'Incident identifier' },
              title: { type: 'string', description: 'Incident title' },
              description: { type: 'string', description: 'Detailed description' },
              severity: { 
                type: 'string', 
                enum: ['low', 'medium', 'high', 'critical'],
                description: 'Incident severity'
              },
              status: { 
                type: 'string', 
                enum: ['open', 'in_progress', 'resolved', 'closed'],
                description: 'Current status'
              }
            }
          },
          Error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: { type: 'string', description: 'Error code' },
              message: { type: 'string', description: 'Error message' },
              details: { type: 'object', description: 'Additional error details' }
            }
          }
        }
      },
      security: [
        { bearerAuth: [] },
        { apiKeyAuth: [] }
      ]
    };
  }
}

export const apiFrameworkService = new APIFrameworkService();
