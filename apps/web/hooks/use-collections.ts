import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionsApi } from "@/lib/api/collections.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateCollectionDto, UpdateCollectionDto, AddCollectionItemDto, PaginationParams } from "@repo/types";

export function useCollections(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.collections.lists(params),
    queryFn: () => collectionsApi.getAll(params),
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: queryKeys.collections.detail(id),
    queryFn: () => collectionsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCollectionDto) => collectionsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.collections.all }),
  });
}

export function useUpdateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCollectionDto }) =>
      collectionsApi.update(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.collections.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.collections.all });
    },
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.collections.all }),
  });
}

export function useAddCollectionItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AddCollectionItemDto }) =>
      collectionsApi.addItem(id, dto),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: queryKeys.collections.detail(id) }),
  });
}

export function useRemoveCollectionItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, itemId }: { collectionId: string; itemId: string }) =>
      collectionsApi.removeItem(collectionId, itemId),
    onSuccess: (_, { collectionId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.collections.detail(collectionId) }),
  });
}

export function useReorderCollectionItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemIds }: { id: string; itemIds: string[] }) =>
      collectionsApi.reorderItems(id, itemIds),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: queryKeys.collections.detail(id) }),
  });
}
