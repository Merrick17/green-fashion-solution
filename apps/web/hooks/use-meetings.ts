import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { meetingsApi } from "@/lib/api/meetings.api";
import { queryKeys } from "@/lib/query-keys";
import type { CreateMeetingDto, UpdateMeetingDto, PaginationParams } from "@repo/types";

export function useMeetings(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.meetings.lists(params),
    queryFn: () => meetingsApi.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: queryKeys.meetings.detail(id),
    queryFn: () => meetingsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMeetingDto) => meetingsApi.create(dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all }),
  });
}

export function useUpdateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMeetingDto }) =>
      meetingsApi.update(id, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.meetings.all }),
  });
}
