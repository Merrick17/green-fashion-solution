import type { AxiosInstance } from "axios";
import {
  ProposalStatus,
  type CreateProposalDto,
  type Proposal,
  type UpdateProposalDto,
} from "@repo/types";

export async function fetchProposal(
  client: AxiosInstance,
  proposalId: string,
): Promise<Proposal> {
  const res = await client.get<Proposal>(`/proposals/${proposalId}`);
  return res.data;
}

export async function createProposal(
  client: AxiosInstance,
  dto: CreateProposalDto,
): Promise<Proposal> {
  const res = await client.post<Proposal>("/proposals", {
    ...dto,
    status: dto.status ?? ProposalStatus.DRAFT,
  });
  return res.data;
}

export async function updateProposal(
  client: AxiosInstance,
  proposalId: string,
  dto: UpdateProposalDto,
): Promise<Proposal> {
  const res = await client.patch<Proposal>(`/proposals/${proposalId}`, dto);
  return res.data;
}

export async function downloadProposalPdf(
  client: AxiosInstance,
  proposalId: string,
): Promise<ArrayBuffer> {
  const res = await client.get<ArrayBuffer>(`/proposals/${proposalId}/pdf`, {
    responseType: "arraybuffer",
  });
  return res.data;
}

export async function downloadProposalPptx(
  client: AxiosInstance,
  proposalId: string,
): Promise<ArrayBuffer> {
  const res = await client.get<ArrayBuffer>(`/proposals/${proposalId}/pptx`, {
    responseType: "arraybuffer",
  });
  return res.data;
}
