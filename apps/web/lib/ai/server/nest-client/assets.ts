import type { AxiosInstance } from "axios";
import type {
  CreateFabricAssetDto,
  CreateProductAssetDto,
  FabricAsset,
  PaginatedResponse,
  ProductAsset,
  StorageUploadTarget,
} from "@repo/types";

export async function listFabrics(
  client: AxiosInstance,
  params?: { q?: string; page?: number; limit?: number },
): Promise<PaginatedResponse<FabricAsset>> {
  const res = await client.get<PaginatedResponse<FabricAsset>>("/assets/fabrics", { params });
  return res.data;
}

export async function listProducts(
  client: AxiosInstance,
  params?: { q?: string; page?: number; limit?: number },
): Promise<PaginatedResponse<ProductAsset>> {
  const res = await client.get<PaginatedResponse<ProductAsset>>("/assets/products", { params });
  return res.data;
}

export async function createFabricAsset(
  client: AxiosInstance,
  dto: CreateFabricAssetDto,
): Promise<FabricAsset> {
  const res = await client.post<FabricAsset>("/assets/fabrics", dto);
  return res.data;
}

export async function createProductAsset(
  client: AxiosInstance,
  dto: CreateProductAssetDto,
): Promise<ProductAsset> {
  const res = await client.post<ProductAsset>("/assets/products", dto);
  return res.data;
}

export async function deleteFabricAsset(
  client: AxiosInstance,
  id: string,
): Promise<void> {
  await client.delete(`/assets/fabrics/${id}`);
}

export async function deleteProductAsset(
  client: AxiosInstance,
  id: string,
): Promise<void> {
  await client.delete(`/assets/products/${id}`);
}

export async function updateFabricAsset(
  client: AxiosInstance,
  id: string,
  dto: Partial<CreateFabricAssetDto>,
): Promise<FabricAsset> {
  const res = await client.patch<FabricAsset>(`/assets/fabrics/${id}`, dto);
  return res.data;
}

export async function updateProductAsset(
  client: AxiosInstance,
  id: string,
  dto: Partial<CreateProductAssetDto>,
): Promise<ProductAsset> {
  const res = await client.patch<ProductAsset>(`/assets/products/${id}`, dto);
  return res.data;
}

export async function requestAssetUploadUrl(
  client: AxiosInstance,
  filename: string,
  contentType: string,
): Promise<StorageUploadTarget> {
  const res = await client.post<StorageUploadTarget>("/files/upload-url/asset", {
    filename,
    contentType,
  });
  return res.data;
}
