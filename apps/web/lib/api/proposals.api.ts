import { apiClient } from "./client";
import { toPaginationQuery } from "./pagination";
import type {
  Proposal,
  ProposalChangeRequest,
  CreateProposalDto,
  CreateChangeRequestDto,
  UpdateProposalDto,
  PaginatedResponse,
  PaginationParams,
} from "@repo/types";

export const proposalsApi = {
  getAll: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<Proposal>>("/proposals", { params: toPaginationQuery(params) })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Proposal>(`/proposals/${id}`).then((r) => r.data),

  create: (dto: CreateProposalDto) =>
    apiClient.post<Proposal>("/proposals", dto).then((r) => r.data),

  update: (id: string, dto: UpdateProposalDto) =>
    apiClient.patch<Proposal>(`/proposals/${id}`, dto).then((r) => r.data),

  createChangeRequest: (id: string, dto: CreateChangeRequestDto) =>
    apiClient
      .post<ProposalChangeRequest>(`/proposals/${id}/change-requests`, dto)
      .then((r) => r.data),

  recordView: (id: string) =>
    apiClient.post(`/proposals/${id}/view`).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/proposals/${id}`).then((r) => r.data),

  downloadPdf: (id: string) =>
    apiClient
      .get(`/proposals/${id}/pdf`, { responseType: "blob" })
      .then((r) => r.data as Blob),

  downloadPptx: (id: string) =>
    apiClient
      .get(`/proposals/${id}/pptx`, { responseType: "blob" })
      .then((r) => r.data as Blob),

  updateProposalItem: (
    proposalId: string,
    itemId: string,
    dto: {
      samplingStatus?: string;
      confirmedQty?: number;
      confirmedColorway?: string;
      deliveryEta?: string;
    },
  ) =>
    apiClient
      .patch(`/proposals/${proposalId}/items/${itemId}`, dto)
      .then((r) => r.data),
};
