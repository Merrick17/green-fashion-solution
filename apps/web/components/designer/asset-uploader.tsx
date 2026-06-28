'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { SectionCard } from '@/components/shared/section-card';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { Button } from '@/components/ui/button';
import { AssetDropzone, fileBaseName } from './asset-dropzone';
import {
  AssetMetadataForm,
  EMPTY_SOURCING,
  type AssetSourcingFormValues,
} from './asset-metadata-form';
import { AssetUploadQueue, type UploadJob } from './asset-upload-queue';
import { buildAssetPayload, newJobId } from './asset-upload-dto';
import { useCreateFabric, useCreateProduct } from '@/hooks/use-assets';
import { uploadAssetFile } from '@/lib/storage/upload-file';
import { toast } from 'sonner';
import type { CreateFabricAssetDto, CreateProductAssetDto, AssetKind } from '@repo/types';
type AssetType = AssetKind;
interface AssetUploaderProps {
  assetType: AssetType;
  listHref: string;
  title: string;
  description: string;
  keywordPlaceholder: string;
}
export function AssetUploader({
  assetType,
  listHref,
  title,
  description,
  keywordPlaceholder,
}: AssetUploaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const briefId = searchParams.get('briefId') ?? undefined;
  const createFabric = useCreateFabric();
  const createProduct = useCreateProduct();
  const [meta, setMeta] = useState<AssetSourcingFormValues>(EMPTY_SOURCING);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [running, setRunning] = useState(false);
  const addFiles = (files: File[]) =>
    setJobs((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: newJobId(),
        file,
        name: fileBaseName(file.name),
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'pending' as const,
      })),
    ]);
  const removeJob = (id: string) =>
    setJobs((prev) =>
      prev.filter((j) => {
        if (j.id === id) URL.revokeObjectURL(j.preview);
        return j.id !== id;
      }),
    );
  const patchJob = (id: string, patch: Partial<UploadJob>) =>
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  const submit = async () => {
    if (!jobs.length) {
      toast.error('Add at least one image');
      return;
    }
    setRunning(true);
    let ok = 0;
    try {
      for (const job of jobs) {
        patchJob(job.id, { status: 'uploading', progress: 0 });
        try {
          const imageUrl = await uploadAssetFile(job.file, (loaded, total) =>
            patchJob(job.id, {
              progress: total ? Math.round((loaded / total) * 100) : 0,
            }),
          );
          const dto = buildAssetPayload(job, meta, imageUrl, briefId);
          if (assetType === 'fabric') {
            const result = await createFabric.mutateAsync(dto as CreateFabricAssetDto);
            if ((result as { _warning?: string })._warning === 'POSSIBLE_DUPLICATE') {
              toast.warning(
                `A similar asset already exists: ${(result as { _similarAssetName?: string })._similarAssetName}`,
              );
            }
          } else {
            const result = await createProduct.mutateAsync(dto as CreateProductAssetDto);
            if ((result as { _warning?: string })._warning === 'POSSIBLE_DUPLICATE') {
              toast.warning(
                `A similar asset already exists: ${(result as { _similarAssetName?: string })._similarAssetName}`,
              );
            }
          }
          patchJob(job.id, { status: 'done', progress: 100 });
          ok++;
        } catch {
          patchJob(job.id, { status: 'error' });
        }
      }
      if (ok) toast.success(`${ok} ${assetType}${ok > 1 ? 's' : ''} uploaded`);
      if (ok === jobs.length) router.push(listHref);
    } finally {
      setRunning(false);
    }
  };
  const breadcrumbLabel =
    assetType === 'fabric' ? 'Fabric Library' : 'Product References';
  return (
    <AppPage width="full" className="max-w-3xl">
      <Breadcrumb
        items={[
          { label: breadcrumbLabel, href: listHref },
          { label: 'Upload' },
        ]}
      />
      <PageHeader title={title} description={description} />
      <SectionCard title="Images">
        <AssetDropzone onFiles={addFiles} disabled={running} />
        <AssetUploadQueue
          jobs={jobs}
          disabled={running}
          onNameChange={(id, name) => patchJob(id, { name })}
          onRemove={removeJob}
        />
      </SectionCard>
      <SectionCard
        title="Sourcing details"
        description="Applied to every image in this batch"
      >
        <AssetMetadataForm
          values={meta}
          onChange={setMeta}
          disabled={running}
          keywordPlaceholder={keywordPlaceholder}
        />
      </SectionCard>
      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={running || !jobs.length}>
          {running && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Upload
          {jobs.length > 0
            ? ` ${jobs.length} ${assetType}${jobs.length > 1 ? 's' : ''}`
            : ''}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(listHref)}
          disabled={running}
        >
          Cancel
        </Button>
      </div>
    </AppPage>
  );
}
