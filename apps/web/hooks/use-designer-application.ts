import { useMutation } from "@tanstack/react-query";
import { designerApplicationsApi } from "@/lib/api/designer-applications.api";
import type { CreateDesignerApplicationDto } from "@repo/types";

export function useSubmitDesignerApplication() {
  return useMutation({
    mutationFn: (dto: CreateDesignerApplicationDto) => designerApplicationsApi.submit(dto),
  });
}
