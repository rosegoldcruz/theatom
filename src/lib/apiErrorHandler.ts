// 🚨 CENTRALIZED API ERROR HANDLING
// Day 3 Morning - Comprehensive error management

import { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
  timestamp: string;
  requestId: string;
}

export class CustomApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'CustomApiError';
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;
  }
}

// 🔧 PREDEFINED ERROR TYPES

export const ApiErrors = {
  // Authentication Errors (401)
  UNAUTHORIZED: (details?: any) => new CustomApiError('Unauthorized access', 401, 'UNAUTHORIZED', details),
  INVALID_TOKEN: (details?: any) => new CustomApiError('Invalid or expired token', 401, 'INVALID_TOKEN', details),
  TOKEN_REQUIRED: (details?: any) => new CustomApiError('Authentication token required', 401, 'TOKEN_REQUIRED', details),

  // Authorization Errors (403)
  FORBIDDEN: (details?: any) => new CustomApiError('Access forbidden', 403, 'FORBIDDEN', details),
  INSUFFICIENT_PERMISSIONS: (details?: any) => new CustomApiError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS', details),

  // Validation Errors (400)
  VALIDATION_ERROR: (details?: any) => new CustomApiError('Validation failed', 400, 'VALIDATION_ERROR', details),
  INVALID_INPUT: (details?: any) => new CustomApiError('Invalid input data', 400, 'INVALID_INPUT', details),
  MISSING_REQUIRED_FIELD: (field: string) => new CustomApiError(`Missing required field: ${field}`, 400, 'MISSING_REQUIRED_FIELD', { field }),

  // Resource Errors (404)
  NOT_FOUND: (resource?: string) => new CustomApiError(`${resource || 'Resource'} not found`, 404, 'NOT_FOUND', { resource }),
  USER_NOT_FOUND: () => new CustomApiError('User not found', 404, 'USER_NOT_FOUND'),
  TRADE_NOT_FOUND: () => new CustomApiError('Trade not found', 404, 'TRADE_NOT_FOUND'),

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: (retryAfter?: number) => new CustomApiError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter }),

  // Business Logic Errors (422)
  INSUFFICIENT_BALANCE: (balance: number, required: number) => new CustomApiError('Insufficient balance', 422, 'INSUFFICIENT_BALANCE', { balance, required }),
  TRADE_EXECUTION_FAILED: (reason?: string) => new CustomApiError('Trade execution failed', 422, 'TRADE_EXECUTION_FAILED', { reason }),
  INVALID_TRADE_PARAMETERS: (details?: any) => new CustomApiError('Invalid trade parameters', 422, 'INVALID_TRADE_PARAMETERS', details),

  // External Service Errors (502, 503)
  BLOCKCHAIN_ERROR: (details?: any) => new CustomApiError('Blockchain service error', 502, 'BLOCKCHAIN_ERROR', details),
  DATABASE_ERROR: (details?: any) => new CustomApiError('Database service error', 503, 'DATABASE_ERROR', details),
  EXTERNAL_API_ERROR: (service: string, details?: any) => new CustomApiError(`External API error: ${service}`, 502, 'EXTERNAL_API_ERROR', { service, ...details }),

  // Server Errors (500)
  INTERNAL_ERROR: (details?: any) => new CustomApiError('Internal server error', 500, 'INTERNAL_ERROR', details),
  CONFIGURATION_ERROR: (details?: any) => new CustomApiError('Server configuration error', 500, 'CONFIGURATION_ERROR', details)
};

// 🛡️ MAIN ERROR HANDLER

export async function handleApiError(
  error: any,
  req: NextApiRequest,
  res: NextApiResponse,
  context?: { endpoint?: string; userId?: string }
): Promise<void> {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  const timestamp = new Date().toISOString();

  let apiError: ApiError;

  // Handle different error types
  if (error instanceof CustomApiError) {
    apiError = {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
      timestamp,
      requestId
    };
  } else if (error instanceof ZodError) {
    apiError = {
      code: 'VALIDATION_ERROR',
      message: 'Input validation failed',
      details: error.errors,
      statusCode: 400,
      timestamp,
      requestId
    };
  } else if (error.name === 'JsonWebTokenError') {
    apiError = {
      code: 'INVALID_TOKEN',
      message: 'Invalid authentication token',
      details: { reason: error.message },
      statusCode: 401,
      timestamp,
      requestId
    };
  } else if (error.name === 'TokenExpiredError') {
    apiError = {
      code: 'TOKEN_EXPIRED',
      message: 'Authentication token has expired',
      details: { expiredAt: error.expiredAt },
      statusCode: 401,
      timestamp,
      requestId
    };
  } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    apiError = {
      code: 'EXTERNAL_SERVICE_UNAVAILABLE',
      message: 'External service unavailable',
      details: { service: error.hostname || 'unknown' },
      statusCode: 503,
      timestamp,
      requestId
    };
  } else {
    // Generic error
    apiError = {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined,
      statusCode: 500,
      timestamp,
      requestId
    };
  }

  // Log error details
  console.error('🚨 API Error:', {
    requestId,
    endpoint: context?.endpoint || req.url,
    method: req.method,
    userId: context?.userId,
    error: {
      code: apiError.code,
      message: apiError.message,
      statusCode: apiError.statusCode,
      stack: error.stack
    },
    timestamp
  });

  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    await reportErrorToMonitoring(error, apiError, req, context);
  }

  // Set error response headers
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Error-Code', apiError.code);

  // Send error response
  res.status(apiError.statusCode).json({
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details && { details: apiError.details }),
      requestId,
      timestamp
    }
  });
}

// 🔧 UTILITY FUNCTIONS

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function reportErrorToMonitoring(
  originalError: any,
  apiError: ApiError,
  req: NextApiRequest,
  context?: { endpoint?: string; userId?: string }
): Promise<void> {
  try {
    // Example: Send to error tracking service
    // await Sentry.captureException(originalError, {
    //   tags: {
    //     errorCode: apiError.code,
    //     endpoint: context?.endpoint || req.url,
    //     method: req.method
    //   },
    //   user: context?.userId ? { id: context.userId } : undefined,
    //   extra: {
    //     requestId: apiError.requestId,
    //     apiError
    //   }
    // });

    // Send to custom monitoring endpoint
    if (process.env.MONITORING_WEBHOOK_URL) {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'api_error',
          error: apiError,
          request: {
            url: req.url,
            method: req.method,
            headers: req.headers,
            userAgent: req.headers['user-agent']
          },
          context
        })
      });
    }
  } catch (reportingError) {
    console.error('Failed to report error to monitoring:', reportingError);
  }
}

// 🎯 ERROR HANDLER WRAPPER

export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  context?: { endpoint?: string }
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      await handleApiError(error, req, res, context);
    }
  };
}

// 🔍 ERROR VALIDATION HELPERS

export function validateRequired(data: any, fields: string[]): void {
  for (const field of fields) {
    if (!data[field]) {
      throw ApiErrors.MISSING_REQUIRED_FIELD(field);
    }
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw ApiErrors.VALIDATION_ERROR({ field: 'email', message: 'Invalid email format' });
  }
}

export function validatePositiveNumber(value: any, fieldName: string): void {
  if (typeof value !== 'number' || value <= 0) {
    throw ApiErrors.VALIDATION_ERROR({ field: fieldName, message: 'Must be a positive number' });
  }
}

export default {
  handleApiError,
  withErrorHandler,
  ApiErrors,
  CustomApiError,
  validateRequired,
  validateEmail,
  validatePositiveNumber
};
