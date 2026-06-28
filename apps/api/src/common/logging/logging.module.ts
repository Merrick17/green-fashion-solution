import { Module } from '@nestjs/common';
import { StructuredLoggerService } from './structured-logger.service';

/**
 * LoggingModule — provides and exports StructuredLoggerService so global interceptors
 * (InstrumentationInterceptor, registered in app.module via APP_INTERCEPTOR) and any
 * future service can inject it. ADDITIVE: importing this module changes no behavior
 * unless LOG_STRUCTURED='true' is set.
 */
@Module({
  providers: [StructuredLoggerService],
  exports: [StructuredLoggerService],
})
export class LoggingModule {}