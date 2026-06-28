import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProposalStatus, ProjectStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const [proposals, projects, fabrics, products] = await Promise.all([
      this.prisma.proposal.findMany({
        select: { status: true, createdAt: true, projectId: true },
      }),
      this.prisma.project.findMany({
        select: { status: true, briefSubmittedAt: true, customerId: true, createdAt: true, id: true },
      }),
      this.prisma.fabricAsset.count(),
      this.prisma.productAsset.count(),
    ]);

    // Approval rate
    const decided = proposals.filter(
      (p) => p.status === ProposalStatus.APPROVED || p.status === ProposalStatus.REJECTED,
    );
    const approved = decided.filter((p) => p.status === ProposalStatus.APPROVED);
    const proposalApprovalRate = decided.length
      ? Math.round((approved.length / decided.length) * 100)
      : 0;

    // Proposals by status
    const proposalsByStatus = Object.fromEntries(
      Object.values(ProposalStatus).map((s) => [
        s,
        proposals.filter((p) => p.status === s).length,
      ]),
    );

    // Projects by status
    const projectsByStatus = Object.fromEntries(
      Object.values(ProjectStatus).map((s) => [
        s,
        projects.filter((p) => p.status === s).length,
      ]),
    );

    // Customer retention
    const projectsPerCustomer = projects.reduce(
      (acc, p) => {
        acc[p.customerId] = (acc[p.customerId] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const totalCustomers = Object.keys(projectsPerCustomer).length;
    const returningCustomers = Object.values(projectsPerCustomer).filter((c) => c >= 2).length;
    const customerRetentionRate = totalCustomers
      ? Math.round((returningCustomers / totalCustomers) * 100)
      : 0;

    // Asset utilization
    const [usedFabricItems, usedProductItems] = await Promise.all([
      this.prisma.proposalItem.findMany({
        where: { fabricAssetId: { not: null } },
        select: { fabricAssetId: true },
        distinct: ['fabricAssetId'],
      }),
      this.prisma.proposalItem.findMany({
        where: { productAssetId: { not: null } },
        select: { productAssetId: true },
        distinct: ['productAssetId'],
      }),
    ]);
    const usedCount = usedFabricItems.length + usedProductItems.length;
    const totalAssets = fabrics + products;
    const assetUtilizationRate = totalAssets > 0
      ? Math.round((usedCount / totalAssets) * 100)
      : 0;

    // Avg cycle time (briefSubmittedAt → first proposal)
    const projectProposalDates = await this.prisma.proposal.groupBy({
      by: ['projectId'],
      _min: { createdAt: true },
    });
    const cycleTimes: number[] = [];
    for (const pp of projectProposalDates) {
      const proj = projects.find((p) => p.id === pp.projectId);
      if (proj?.briefSubmittedAt && pp._min.createdAt) {
        const days =
          (pp._min.createdAt.getTime() - new Date(proj.briefSubmittedAt).getTime()) / 86400000;
        if (days > 0) cycleTimes.push(days);
      }
    }
    const avgProposalCycleTimeDays = cycleTimes.length
      ? Math.round(cycleTimes.reduce((s, d) => s + d, 0) / cycleTimes.length)
      : 0;

    // Top designers by fabric asset count
    const designerAssets = await this.prisma.fabricAsset.groupBy({
      by: ['designerId'],
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });
    const designerUsers = await this.prisma.user.findMany({
      where: { id: { in: designerAssets.map((d) => d.designerId) } },
      select: { id: true, name: true },
    });
    const topDesigners = designerAssets.map((d) => ({
      id: d.designerId,
      name: designerUsers.find((u) => u.id === d.designerId)?.name ?? 'Unknown',
      assetCount: d._count._all,
    }));

    return {
      avgProposalCycleTimeDays,
      proposalApprovalRate,
      assetUtilizationRate,
      customerRetentionRate,
      proposalsByStatus,
      projectsByStatus,
      topDesigners,
    };
  }
}
