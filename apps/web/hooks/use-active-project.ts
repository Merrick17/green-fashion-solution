"use client";

import { useEffect } from "react";
import { useProjects } from "@/hooks/use-projects";
import { useActiveProjectStore } from "@/lib/stores/active-project-store";
import { ProjectStatus } from "@repo/types";

const listParams = { page: 1, limit: 100 };

export function useActiveProject() {
  const projectId = useActiveProjectStore((s) => s.projectId);
  const setProjectId = useActiveProjectStore((s) => s.setProjectId);
  const { data, isLoading } = useProjects(listParams);
  const projects = data?.data ?? [];

  useEffect(() => {
    if (isLoading || projects.length === 0) return;

    const exists = projectId && projects.some((p) => p.id === projectId);
    if (exists) return;

    const preferred =
      projects.find((p) => p.status !== ProjectStatus.COMPLETED) ?? projects[0];
    setProjectId(preferred?.id ?? null);
  }, [isLoading, projects, projectId, setProjectId]);

  const project = projects.find((p) => p.id === projectId) ?? null;

  return {
    projectId,
    project,
    projects,
    isLoading,
    setProjectId,
  };
}

export function useActiveProjectHref(path: string): string {
  const projectId = useActiveProjectStore((s) => s.projectId);
  if (!projectId) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}projectId=${projectId}`;
}
