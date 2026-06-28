import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type {
  Collection,
  CreateCollectionDto,
  UpdateCollectionDto,
  AddCollectionItemDto,
  PaginatedResponse,
  PaginationParams,
} from "@repo/types";

export const collectionsApi = {
  getAll: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<Collection>>("/collections", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Collection>(`/collections/${id}`).then((r) => r.data),

  create: (dto: CreateCollectionDto) =>
    apiClient.post<Collection>("/collections", dto).then((r) => r.data),

  update: (id: string, dto: UpdateCollectionDto) =>
    apiClient.patch<Collection>(`/collections/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/collections/${id}`).then((r) => r.data),

  addItem: (id: string, dto: AddCollectionItemDto) =>
    apiClient.post(`/collections/${id}/items`, dto).then((r) => r.data),

  reorderItems: (id: string, itemIds: string[]) =>
    apiClient.post<Collection>(`/collections/${id}/items/reorder`, { itemIds }).then((r) => r.data),

  removeItem: (collectionId: string, itemId: string) =>
    apiClient.delete(`/collections/${collectionId}/items/${itemId}`).then((r) => r.data),
};
