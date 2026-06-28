import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  FileStack,
  Layers,
  PackageCheck,
} from 'lucide-react';
import { LANDING_MEDIA } from '@/lib/landing-media';

export type ProcessStep = {
  id: string;
  number: string;
  title: string;
  tag: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: LucideIcon;
};

export const SOURCING_PROCESS: ProcessStep[] = [
  {
    id: 'intake',
    number: '01',
    title: 'Project Intake',
    tag: 'Briefs · Inspiration · Requirements',
    description:
      'Capture client briefs, inspiration, and requirements to start every sourcing project with a clear, shared brief.',
    image: LANDING_MEDIA.expertise.intake,
    imageAlt:
      'Fashion designer reviewing a mood board with sketches and references',
    icon: ClipboardList,
  },
  {
    id: 'library',
    number: '02',
    title: 'Sourcing Library',
    tag: 'Fabrics · References · Collections',
    description:
      'Build an internal library of curated fabrics, product references, and collections, managed by designers.',
    image: LANDING_MEDIA.expertise.materials,
    imageAlt:
      'Fabric swatches and textile samples laid out for sourcing selection',
    icon: Layers,
  },
  {
    id: 'proposal',
    number: '03',
    title: 'Proposal Builder',
    tag: 'Curation · Proposals · Export',
    description:
      'Curate sourced fabrics and references into client-ready proposals for review and approval.',
    image: LANDING_MEDIA.expertise.craft,
    imageAlt: 'Tailor fitting and adjusting a garment sample on a client',
    icon: FileStack,
  },
  {
    id: 'execution',
    number: '04',
    title: 'Execution Tracking',
    tag: 'Sampling · Production · Delivery',
    description:
      'Track sampling, production, and delivery to completion after proposal approval.',
    image: LANDING_MEDIA.expertise.production,
    imageAlt: 'Workers sewing garments on a factory production line',
    icon: PackageCheck,
  },
];
