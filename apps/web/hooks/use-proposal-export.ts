"use client";

import { useMutation } from "@tanstack/react-query";
import { proposalsApi } from "@/lib/api/proposals.api";

type DownloadProposalPdfInput = {
  proposalId: string;
  title?: string;
};

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useDownloadProposalPdf() {
  return useMutation({
    mutationFn: async ({ proposalId, title }: DownloadProposalPdfInput) => {
      const blob = await proposalsApi.downloadPdf(proposalId);
      const safeTitle = (title ?? "proposal").replace(/\s+/g, "-").toLowerCase();
      triggerBlobDownload(blob, `${safeTitle}.pdf`);
      return blob;
    },
  });
}
