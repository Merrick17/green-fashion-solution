import { useMutation } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api/leads.api";
import type { CreateLeadDto } from "@repo/types";

export function useCreateLead() {
  return useMutation({
    mutationFn: (dto: CreateLeadDto) => leadsApi.create(dto),
  });
}
