import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { proposalsApi } from "@/lib/api/proposals.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateProposalDto, CreateChangeRequestDto, UpdateProposalDto, PaginationParams } from "@repo/types";

export function useProposals(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.proposals.lists(params),
    queryFn: () => proposalsApi.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: queryKeys.proposals.detail(id),
    queryFn: () => proposalsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProposalDto) => proposalsApi.create(dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.proposals.all }),
  });
}

export function useUpdateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProposalDto }) =>
      proposalsApi.update(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.proposals.all });
      qc.invalidateQueries({ queryKey: queryKeys.proposals.detail(id) });
    },
  });
}

export function useCreateProposalChangeRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CreateChangeRequestDto }) =>
      proposalsApi.createChangeRequest(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.proposals.all });
      qc.invalidateQueries({ queryKey: queryKeys.proposals.detail(id) });
    },
  });
}

export function useDeleteProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proposalsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.proposals.all }),
  });
}

export function useRecordProposalView() {
  return useMutation({
    mutationFn: (proposalId: string) => proposalsApi.recordView(proposalId),
  });
}

export function useUpdateProposalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      proposalId,
      itemId,
      dto,
    }: {
      proposalId: string;
      itemId: string;
      dto: {
        samplingStatus?: string;
        confirmedQty?: number;
        confirmedColorway?: string;
        deliveryEta?: string;
      };
    }) => proposalsApi.updateProposalItem(proposalId, itemId, dto),
    onSuccess: (_data, { proposalId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.proposals.detail(proposalId) });
    },
  });
}
