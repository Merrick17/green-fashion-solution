import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter — ADDITIVE ONLY. Does not change any existing error contract.
 *
 * - `HttpException` subclasses are passed through UNCHANGED: the same status code and
 *   response body that Nest's default handling would produce are returned verbatim, so
 *   every existing error response shape is preserved.
 * - Non-`HttpException` (truly unhandled) errors are logged with the request correlation
 *   id and returned as a generic 500 with an `x-correlation-id` header. Previously these
 *   hit Nest's default 500 with no logging or trace — this only ADDS logging + the header.
 *
 * Wired as a single APP_FILTER in app.module.ts (never registered twice).
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response | undefined>();
    const request = ctx.getRequest<
      Request & { correlationId?: string }
    >();

    const correlationId =
      request?.correlationId ??
      (request?.headers?.['x-request-id'] as string | undefined) ??
      'unknown';

    // Preserve existing HttpException behavior exactly (identical status + body).
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (response && typeof response.status === 'function') {
        response.status(status).json(body);
      }
      return;
    }

    // Unhandled error: log with correlation id, then return a generic 500 + header.
    const message =
      exception instanceof Error ? exception.message : String(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error(
      `Unhandled exception [${correlationId}] ${request?.method ?? '-'} ${
        request?.originalUrl ?? '-'
      }: ${message}`,
      stack,
    );

    if (response && typeof response.status === 'function') {
      if (!response.headersSent && !response.getHeader('x-correlation-id')) {
        response.setHeader('x-correlation-id', correlationId);
      }
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({
          statusCode: 500,
          message: 'Internal server error',
          correlationId,
        });
    }
  }
}