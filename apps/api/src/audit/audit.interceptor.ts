import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@repo/types';

const SENSITIVE_KEYS = ['password', 'passwordhash', 'refreshtoken', 'token', 'secret', 'apikey'];

function redact(value: unknown): unknown {
  if (value === null || value === undefined || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      SENSITIVE_KEYS.some(s => k.toLowerCase().includes(s)) ? '[REDACTED]' : redact(v),
    ]),
  );
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method = req.method as string;
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const userId = req.user?.id;
    if (!userId) return next.handle();

    const actionMap: Record<string, AuditAction> = {
      POST: AuditAction.CREATE,
      PATCH: AuditAction.UPDATE,
      PUT: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
    };

    return next.handle().pipe(
      tap(async (data: { id?: string } | unknown) => {
        const entityId = req.params?.id || (data && typeof data === 'object' && 'id' in data ? (data as { id: string }).id : 'unknown');
        const path = req.route?.path || req.url;
        await this.audit.log(userId, actionMap[method]!, path, entityId, {
          method,
          body: redact(req.body),
        });
      }),
    );
  }
}
