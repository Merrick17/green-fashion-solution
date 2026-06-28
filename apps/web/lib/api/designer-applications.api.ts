import { apiClient } from "./client";
import type { CreateDesignerApplicationDto, DesignerApplication } from "@repo/types";

export const designerApplicationsApi = {
  submit: (dto: CreateDesignerApplicationDto) =>
    apiClient.post<DesignerApplication>("/designer-applications", dto).then((r) => r.data),
};
