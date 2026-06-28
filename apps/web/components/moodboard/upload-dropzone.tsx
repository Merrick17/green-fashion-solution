'use client';
import { useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface UploadDropzoneProps {
  uploading: boolean;
  uploadedCount: number;
  onFilesSelected: (files: FileList) => void;
}
export function UploadDropzone({
  uploading,
  uploadedCount,
  onFilesSelected,
}: UploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) onFilesSelected(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {uploading ? 'Uploading…' : 'Select images'}
      </Button>
      {uploadedCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {uploadedCount} image(s) ready
        </p>
      )}
    </>
  );
}
