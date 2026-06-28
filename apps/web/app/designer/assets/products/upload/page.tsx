import { Suspense } from 'react';
import { AssetUploader } from '@/components/designer/asset-uploader';
export default function UploadProductPage() {
  return (
    <Suspense>
      <AssetUploader
        assetType="product"
        listHref="/designer/assets/products"
        title="Upload Product Reference"
        description="Drop images, add sourcing details, and publish to the library."
        keywordPlaceholder="blazer, tailored, wool, structured, menswear"
      />
    </Suspense>
  );
}
