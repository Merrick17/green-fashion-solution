import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';

@Injectable()
export class WaitlistService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateWaitlistDto) {
    return this.prisma.waitlistEntry.create({
      data: {
        name: dto.name,
        email: dto.email,
        brand: dto.brand,
      },
    });
  }

  count(): Promise<number> {
    return this.prisma.waitlistEntry.count();
  }
}
