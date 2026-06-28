import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { GraphModule } from '../graph/graph.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [PrismaModule, RedisModule, GraphModule, FilesModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
