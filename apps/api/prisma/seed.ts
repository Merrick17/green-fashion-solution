import {
  PrismaClient,
  UserRole,
  ProjectStatus,
  ProposalStatus,
  TaskStatus,
  BriefType,
  BriefPriority,
  BriefOptionType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// BriefOptions
// ---------------------------------------------------------------------------

const SEASONS = ['SS25', 'FW25', 'SS26', 'FW26'];
const CATEGORIES = ['Knitwear', 'Woven Tops', 'Denim', 'Outerwear', 'Accessories'];

async function seedBriefOptions() {
  for (const [index, label] of SEASONS.entries()) {
    await prisma.briefOption.upsert({
      where: { type_label: { type: BriefOptionType.SEASON, label } },
      update: { sortOrder: index, active: true },
      create: { type: BriefOptionType.SEASON, label, sortOrder: index, active: true },
    });
  }
  for (const [index, label] of CATEGORIES.entries()) {
    await prisma.briefOption.upsert({
      where: { type_label: { type: BriefOptionType.CATEGORY, label } },
      update: { sortOrder: index, active: true },
      create: { type: BriefOptionType.CATEGORY, label, sortOrder: index, active: true },
    });
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await seedBriefOptions();

  // ── Users ────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  const brandPassword = await bcrypt.hash('brand123', 10);
  const designerPassword = await bcrypt.hash('design123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gfs.com' },
    update: { password: adminPassword, blocked: false },
    create: {
      email: 'admin@gfs.com',
      password: adminPassword,
      name: 'Green Admin',
      role: UserRole.ADMIN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'brand@example.com' },
    update: { password: brandPassword, blocked: false },
    create: {
      email: 'brand@example.com',
      password: brandPassword,
      name: 'Maison Lumière',
      role: UserRole.CUSTOMER,
    },
  });

  const designer = await prisma.user.upsert({
    where: { email: 'designer@gfs.com' },
    update: { password: designerPassword, blocked: false },
    create: {
      email: 'designer@gfs.com',
      password: designerPassword,
      name: 'Amina Sourcing',
      role: UserRole.DESIGNER,
    },
  });

  // ── Fabric Assets ─────────────────────────────────────────────────────────
  const fabricLinen = await prisma.fabricAsset.upsert({
    where: { id: 'seed-fabric-linen' },
    update: {},
    create: {
      id: 'seed-fabric-linen',
      designerId: designer.id,
      name: 'Organic Linen — Natural',
      description: '100% Linen, 185gsm, naturally sourced and sustainable',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      keywords: ['linen', 'organic', 'natural', 'sustainable', 'ss25'],
      metadata: { composition: '100% Linen', weight: '185gsm' },
    },
  });

  const fabricDenim = await prisma.fabricAsset.upsert({
    where: { id: 'seed-fabric-denim' },
    update: {},
    create: {
      id: 'seed-fabric-denim',
      designerId: designer.id,
      name: 'Washed Denim — Indigo',
      description: '98% Cotton 2% Elastane, 340gsm, washed indigo finish',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      keywords: ['denim', 'indigo', 'washed'],
      metadata: { composition: '98% Cotton 2% Elastane', weight: '340gsm' },
    },
  });

  // ── Product Asset ─────────────────────────────────────────────────────────
  const productShirt = await prisma.productAsset.upsert({
    where: { id: 'seed-product-shirt' },
    update: {},
    create: {
      id: 'seed-product-shirt',
      designerId: designer.id,
      name: 'Oversized Linen Shirt',
      description: 'Relaxed silhouette linen shirt, Woven Tops category, SS25',
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      keywords: ['shirt', 'linen', 'oversized', 'ss25'],
      metadata: { category: 'Woven Tops' },
    },
  });

  // ── Collection ────────────────────────────────────────────────────────────
  const collection = await prisma.collection.upsert({
    where: { id: 'seed-collection-ss25' },
    update: { name: 'SS25 Essentials' },
    create: {
      id: 'seed-collection-ss25',
      designerId: designer.id,
      name: 'SS25 Essentials',
      description: 'Core sourcing assets for the SS25 season',
    },
  });

  // Re-create collection items idempotently
  await prisma.collectionItem.deleteMany({ where: { collectionId: collection.id } });
  await prisma.collectionItem.createMany({
    data: [
      { collectionId: collection.id, fabricAssetId: fabricLinen.id, position: 0 },
      { collectionId: collection.id, fabricAssetId: fabricDenim.id, position: 1 },
      { collectionId: collection.id, productAssetId: productShirt.id, position: 2 },
    ],
  });

  // ── Project ───────────────────────────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { id: 'seed-project-ml-ss25' },
    update: {
      title: 'Maison Lumière — SS25 Collection',
      status: ProjectStatus.SOURCING,
      customerId: customer.id,
      coverImageUrl:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    },
    create: {
      id: 'seed-project-ml-ss25',
      title: 'Maison Lumière — SS25 Collection',
      description: 'Spring/Summer 2025 sourcing project for Maison Lumière',
      status: ProjectStatus.SOURCING,
      customerId: customer.id,
      season: 'SS25',
      category: 'Woven Tops',
      budgetBand: 'RANGE_25K_50K',
      targetDelivery: new Date('2025-03-01T00:00:00.000Z'),
      coverImageUrl:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    },
  });

  // ── Moodboard ─────────────────────────────────────────────────────────────
  await prisma.moodboard.upsert({
    where: { id: 'seed-moodboard-ml-ss25' },
    update: {
      styleDirection: 'Effortless natural textures with a Parisian summer edit',
    },
    create: {
      id: 'seed-moodboard-ml-ss25',
      projectId: project.id,
      styleDirection: 'Effortless natural textures with a Parisian summer edit',
      colorPalette: ['#F5E6D3', '#2C2416', '#8B7355', '#FFFFFF'],
      fabricSuggestions: ['organic linen', 'washed denim', 'cotton voile'],
      mood: 'natural, effortless, summer-ready',
      canvasViewport: { x: 0, y: 0, zoom: 1 },
    },
  });

  // ── Task ──────────────────────────────────────────────────────────────────
  await prisma.task.upsert({
    where: { id: 'seed-task-linen' },
    update: {
      status: TaskStatus.IN_PROGRESS,
      designerId: designer.id,
    },
    create: {
      id: 'seed-task-linen',
      projectId: project.id,
      designerId: designer.id,
      title: 'Source organic linen fabrics — min 3 options',
      description: 'Find at least 3 organic linen options with composition and weight specs for SS25 collection.',
      briefType: BriefType.FABRIC_SOURCING,
      priority: BriefPriority.HIGH,
      deliverables: 'Swatch photos + composition + weight for each option',
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  // ── Proposal ──────────────────────────────────────────────────────────────
  const proposal = await prisma.proposal.upsert({
    where: { id: 'seed-proposal-ml-ss25' },
    update: {
      title: 'SS25 Sourcing Proposal',
      season: 'SS25',
      status: ProposalStatus.DRAFT,
    },
    create: {
      id: 'seed-proposal-ml-ss25',
      projectId: project.id,
      title: 'SS25 Sourcing Proposal',
      season: 'SS25',
      status: ProposalStatus.DRAFT,
      styleSummary: 'Natural textures and relaxed silhouettes — organic linen and washed denim for a Parisian summer capsule.',
    },
  });

  // Re-create proposal sections idempotently
  await prisma.proposalSection.deleteMany({ where: { proposalId: proposal.id } });
  await prisma.proposalSection.create({
    data: {
      id: 'seed-proposal-section-ml',
      proposalId: proposal.id,
      title: 'Sourcing Assets',
      description: 'All curated sourcing assets for SS25',
      position: 0,
      items: {
        create: [
          { fabricAssetId: fabricLinen.id, notes: 'Primary fabric option — organic linen', position: 0 },
          { fabricAssetId: fabricDenim.id, notes: 'Secondary fabric option — washed denim', position: 1 },
          { productAssetId: productShirt.id, notes: 'Key silhouette reference — oversized linen shirt', position: 2 },
        ],
      },
    },
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n✓ Seed complete');
  console.log(`  Admin:    admin@gfs.com      / admin123`);
  console.log(`  Customer: brand@example.com  / brand123`);
  console.log(`  Designer: designer@gfs.com   / design123`);
  console.log('');
  console.log('IDs:', { project: project.id, proposal: proposal.id });

  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
