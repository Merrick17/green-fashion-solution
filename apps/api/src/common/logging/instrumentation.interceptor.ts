import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { StructuredLoggerService } from './structured-logger.service';

type HttpRequest = Request & { correlationId?: string };

/**
 * InstrumentationInterceptor — ADDITIVE global APP_INTERCEPTOR for structured request
 * logging. Env-gated via StructuredLoggerService (LOG_STRUCTURED='true').
 *
 * When disabled (the default) it short-circuits immediately — zero overhead, and the
 * existing RequestLogMiddleware human-readable line is the only request log (unchanged).
 * When enabled, it attaches a one-time `finish` listener that emits a structured JSON
 * line: { message:'http.request', method, path, status, durationMs, correlationId }.
 *
 * HTTP-only (skips WS/RPC contexts via context.getType()), non-mutating, never throws,
 * and does NOT replace RequestLogMiddleware (both emit independently; the structured
 * line is the value-add). Registered globally via APP_INTERCEPTOR so no per-service
 * instrumentation calls are needed — keeping it decoupled from the Phase 4 service edits.
 */
@Injectable()
export class InstrumentationInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.logger.isEnabled || context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<HttpRequest>();
    const res = context.switchToHttp().getResponse<Response>();
    const start = Date.now();
    const method = req.method;
    const path = req.originalUrl ?? req.url;
    const correlationId = req.correlationId;

    res.on('finish', () => {
      this.logger.info({
        message: 'http.request',
        method,
        path,
        status: res.statusCode,
        durationMs: Date.now() - start,
        ...(correlationId ? { correlationId } : {}),
      });
    });

    return next.handle();
  }
}