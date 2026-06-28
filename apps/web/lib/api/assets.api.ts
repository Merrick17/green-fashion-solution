import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type {
  FabricAsset,
  ProductAsset,
  CreateFabricAssetDto,
  CreateProductAssetDto,
  PaginatedResponse,
} from "@repo/types";

export interface AssetListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  matchMoodboard?: boolean;
  projectId?: string;
}

export const assetsApi = {
  getFabrics: (params?: AssetListParams) =>
    apiClient
      .get<PaginatedResponse<FabricAsset>>("/assets/fabrics", {
        params: {
          ...toPaginationQuery({ page: params?.page, limit: params?.limit, sortBy: params?.sortBy, sortOrder: params?.sortOrder }),
          search: params?.search,
          matchMoodboard: params?.matchMoodboard ? 'true' : undefined,
          projectId: params?.projectId,
        },
      })
      .then((r) => r.data),

  getProducts: (params?: AssetListParams) =>
    apiClient
      .get<PaginatedResponse<ProductAsset>>("/assets/products", {
        params: {
          ...toPaginationQuery({ page: params?.page, limit: params?.limit, sortBy: params?.sortBy, sortOrder: params?.sortOrder }),
          search: params?.search,
          matchMoodboard: params?.matchMoodboard ? 'true' : undefined,
          projectId: params?.projectId,
        },
      })
      .then((r) => r.data),

  createFabric: (dto: CreateFabricAssetDto) =>
    apiClient.post<FabricAsset>("/assets/fabrics", dto).then((r) => r.data),

  createProduct: (dto: CreateProductAssetDto) =>
    apiClient.post<ProductAsset>("/assets/products", dto).then((r) => r.data),

  deleteFabric: (id: string) =>
    apiClient.delete(`/assets/fabrics/${id}`).then((r) => r.data),

  deleteProduct: (id: string) =>
    apiClient.delete(`/assets/products/${id}`).then((r) => r.data),
};
