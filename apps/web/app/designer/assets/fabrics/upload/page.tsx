import { Suspense } from 'react';
import { AssetUploader } from '@/components/designer/asset-uploader';
export default function UploadFabricPage() {
  return (
    <Suspense>
      <AssetUploader
        assetType="fabric"
        listHref="/designer/assets/fabrics"
        title="Upload Fabric"
        description="Drop images, add sourcing details, and publish to the library."
        keywordPlaceholder="silk, twill, navy, lightweight, draping"
      />
    </Suspense>
  );
}
