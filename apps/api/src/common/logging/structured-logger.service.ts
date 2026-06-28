import { Injectable } from '@nestjs/common';
import type { LogLevel } from '@repo/types';

/**
 * StructuredLogEntry — the full shape of one emitted JSON log line.
 */
export interface StructuredLogEntry {
  level: LogLevel;
  message: string;
  correlationId?: string;
  [key: string]: unknown;
}

/**
 * LogPayload — caller-facing payload (level is added internally). Defined directly
 * (NOT via Omit<StructuredLogEntry, 'level'>) because Omit over a type with a string
 * index signature collapses the named properties, dropping the required `message`.
 * The index signature lets callers attach arbitrary fields (method, path, status…).
 */
export interface LogPayload {
  message: string;
  correlationId?: string;
  [key: string]: unknown;
}

/**
 * StructuredLoggerService — ADDITIVE, env-gated, best-effort structured (JSON) logging.
 *
 * Emits one JSON line per call to stdout (info/debug) or stderr (warn/error) ONLY when
 * LOG_STRUCTURED === 'true'. When disabled (the default), every method is a no-op, so the
 * existing Nest `Logger` human-readable output is the only logging and behavior is
 * unchanged. Never throws: a logging failure must not break a request. The `isEnabled`
 * flag lets callers short-circuit before building expensive payloads.
 *
 * Validated in config/env.validation.ts but read directly via process.env here (same
 * pattern as EMBEDDING_DIMENSION), so this service has no hard dependency on ConfigService.
 */
@Injectable()
export class StructuredLoggerService {
  private readonly enabled: boolean;

  constructor() {
    this.enabled = process.env.LOG_STRUCTURED === 'true';
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  log(payload: LogPayload): void {
    this.emit('info', payload);
  }

  info(payload: LogPayload): void {
    this.emit('info', payload);
  }

  debug(payload: LogPayload): void {
    this.emit('debug', payload);
  }

  warn(payload: LogPayload): void {
    this.emit('warn', payload);
  }

  error(payload: LogPayload): void {
    this.emit('error', payload);
  }

  private emit(level: LogLevel, payload: LogPayload): void {
    if (!this.enabled) return;
    try {
      const { message, correlationId, ...rest } = payload;
      const line = JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(correlationId ? { correlationId } : {}),
        ...rest,
      });
      if (level === 'error' || level === 'warn') {
        process.stderr.write(line + '\n');
      } else {
        process.stdout.write(line + '\n');
      }
    } catch {
      // Best-effort: never throw out of the logger.
    }
  }
}