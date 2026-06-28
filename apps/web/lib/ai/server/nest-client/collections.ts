import type { AxiosInstance } from "axios";
import type {
  AddCollectionItemDto,
  Collection,
  CreateCollectionDto,
  PaginatedResponse,
  PaginationParams,
} from "@repo/types";

export async function listCollections(
  client: AxiosInstance,
  params?: PaginationParams,
): Promise<PaginatedResponse<Collection>> {
  const res = await client.get<PaginatedResponse<Collection>>("/collections", { params });
  return res.data;
}

export async function createCollection(
  client: AxiosInstance,
  dto: CreateCollectionDto,
): Promise<Collection> {
  const res = await client.post<Collection>("/collections", dto);
  return res.data;
}

export async function addCollectionItem(
  client: AxiosInstance,
  collectionId: string,
  dto: AddCollectionItemDto,
): Promise<unknown> {
  const res = await client.post(`/collections/${collectionId}/items`, dto);
  return res.data;
}

export async function reorderCollectionItems(
  client: AxiosInstance,
  collectionId: string,
  itemIds: string[],
): Promise<Collection> {
  const res = await client.post<Collection>(`/collections/${collectionId}/items/reorder`, {
    itemIds,
  });
  return res.data;
}
