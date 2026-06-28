'use client';

import { useState } from 'react';
import { FileType } from '@repo/types';
import { FileText, Upload } from 'lucide-react';
import { FileUploadField } from '@/components/shared/file-upload-field';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjectFiles, useRequestUpload } from '@/hooks/use-files';
import { performStorageUpload } from '@/lib/storage/perform-upload';
import { toast } from 'sonner';

const FILE_TYPE_OPTIONS = [
  { value: FileType.IMAGE, label: 'Image' },
  { value: FileType.PDF, label: 'PDF' },
  { value: FileType.TECHNICAL_SHEET, label: 'Technical sheet' },
  { value: FileType.REFERENCE, label: 'Reference' },
] as const;

const listParams = { page: 1, limit: 100 };

function inferFileType(file: File, selected: FileType): FileType {
  if (selected !== FileType.REFERENCE) return selected;
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return FileType.PDF;
  if (/\.(png|jpe?g|webp|gif|svg)$/.test(name)) return FileType.IMAGE;
  return FileType.REFERENCE;
}

interface ProjectFilesPanelProps {
  projectId: string;
}

export function ProjectFilesPanel({ projectId }: ProjectFilesPanelProps) {
  const { data: filesData, isLoading } = useProjectFiles(projectId, listParams);
  const requestUpload = useRequestUpload();
  const files = filesData?.data ?? [];
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>(FileType.REFERENCE);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Choose a file to upload');
      return;
    }
    setUploading(true);
    try {
      const type = inferFileType(file, fileType);
      const target = await requestUpload.mutateAsync({
        projectId,
        filename: file.name,
        type,
        contentType: file.type || 'application/octet-stream',
      });
      await performStorageUpload(
        target,
        file,
        file.type || 'application/octet-stream',
        file.name,
      );
      toast.success('File uploaded');
      setFile(null);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="border border-portal-border bg-portal-surface p-[var(--spacing-card-pad)] lg:p-8">
      <div className="mb-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Attachments</p>
        <h2 className="mt-2 font-serif text-xl text-portal-foreground">
          Project files ({filesData?.meta.total ?? files.length})
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Tech packs, references, and supporting documents for your brief.
        </p>
      </div>
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>File type</Label>
            <Select
              value={fileType}
              onValueChange={(value) => setFileType(value as FileType)}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FileUploadField
            label="Upload file"
            accept="image/*,.pdf,.doc,.docx"
            onFileSelect={setFile}
            disabled={uploading}
          />
        </div>
        <Button
          type="button"
          variant="brand"
          size="sm"
          onClick={handleUpload}
          disabled={uploading || !file}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading…' : 'Upload to project'}
        </Button>

        {isLoading ? (
          <p className="text-sm text-muted-foreground leading-relaxed">Loading files…</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-muted-foreground leading-relaxed">No files uploaded yet.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 border border-portal-border bg-portal-surface-muted p-4 text-sm"
              >
                <FileText className="h-4 w-4 shrink-0 text-portal-accent" />
                <span className="min-w-0 truncate text-portal-foreground">
                  {f.type} · v{f.version}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
