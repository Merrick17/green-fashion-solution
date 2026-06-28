import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { assetsApi } from "@/lib/api/assets.api";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { CreateFabricAssetDto, CreateProductAssetDto, PaginationParams } from "@repo/types";

export function useFabrics(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.assets.fabrics(params),
    queryFn: () => assetsApi.getFabrics(params),
    placeholderData: keepPreviousData,
  });
}

export function useProducts(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.assets.products(params),
    queryFn: () => assetsApi.getProducts(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateFabric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFabricAssetDto) => assetsApi.createFabric(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.assets.fabricsAll }),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductAssetDto) => assetsApi.createProduct(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.assets.productsAll }),
  });
}

export function useDeleteFabric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetsApi.deleteFabric(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.assets.fabricsAll }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetsApi.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.assets.productsAll }),
  });
}

export function useAssetStats(id: string, type: 'fabric' | 'product') {
  return useQuery({
    queryKey: [...queryKeys.assets.fabricsAll, id, 'stats', type] as const,
    queryFn: () =>
      apiClient
        .get<{ proposalCount: number; approvedProposalCount: number; lastUsedAt: string | null }>(
          `/assets/${type === 'fabric' ? 'fabrics' : 'products'}/${id}/stats`,
        )
        .then((r) => r.data),
    enabled: !!id,
  });
}
