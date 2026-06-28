import { useMutation } from "@tanstack/react-query";
import { waitlistApi } from "@/lib/api/waitlist.api";
import type { CreateWaitlistDto } from "@repo/types";

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: (dto: CreateWaitlistDto) => waitlistApi.join(dto),
  });
}
