import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        name: dto.name,
        brand: dto.brand,
        email: dto.email,
        projectType: dto.projectType,
        budgetRange: dto.budgetRange,
      },
    });
  }

  count(): Promise<number> {
    return this.prisma.lead.count();
  }
}