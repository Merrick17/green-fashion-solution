import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

/**
 * RequestIdMiddleware — ADDITIVE. Adds a correlation id to every request.
 *
 * - Reuses an inbound `x-request-id` header when present (never overwrites).
 * - Otherwise generates a UUID and attaches it to `req.correlationId`.
 * - Echoes it back as `x-correlation-id` on the response (only if not already set),
 *   so clients can correlate a response with the originating request.
 *
 * Runs before RequestLogMiddleware so the correlation id is available to downstream
 * logging and to the GlobalExceptionFilter on unhandled errors. Non-breaking: it only
 * adds a header and a request-scoped field; no request is rejected or altered.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(
    req: Request & { correlationId?: string },
    res: Response,
    next: NextFunction,
  ): void {
    const inbound = req.headers['x-request-id'];
    const id =
      (Array.isArray(inbound) ? inbound[0] : inbound) || randomUUID();
    req.correlationId = id;
    if (!res.headersSent && !res.getHeader('x-correlation-id')) {
      res.setHeader('x-correlation-id', id);
    }
    next();
  }
}