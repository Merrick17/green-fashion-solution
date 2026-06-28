"use client";

import { useCallback } from "react";
import { proposalsApi } from "@/lib/api/proposals.api";
import { proposalDisplayTitle } from "@repo/utils";

export function useDownloadProposalExport() {
  const download = useCallback(
    async (
      proposalId: string,
      format: "pdf" | "pptx",
      title?: string,
    ) => {
      const blob =
        format === "pdf"
          ? await proposalsApi.downloadPdf(proposalId)
          : await proposalsApi.downloadPptx(proposalId);
      const safeTitle = (title ?? "proposal").replace(/\s+/g, "-").toLowerCase();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeTitle}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [],
  );

  return download;
}

export function useDownloadProposalPptx() {
  const downloadExport = useDownloadProposalExport();
  return useCallback(
    async (proposal: { id: string; title?: string | null; project?: { title?: string } | null }) => {
      const title = proposalDisplayTitle(proposal);
      await downloadExport(proposal.id, "pptx", title);
    },
    [downloadExport],
  );
}
