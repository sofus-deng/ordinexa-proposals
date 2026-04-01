/**
 * Proposal Export Route (ORDX-024C)
 *
 * Export-oriented route for rendering saved proposals in a print-friendly,
 * client-facing format. This route uses the export view model and components
 * to create a clean, structured presentation suitable for PDF output.
 */

import { notFound } from "next/navigation";

import { ProposalExportLayout } from "@/components/export";
import { createMockProposalRepository } from "@/lib/proposals";
import { buildExportViewModel } from "@/lib/proposals/export-view-model";

interface ExportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProposalExportPage({ params }: ExportPageProps) {
  const { id } = await params;

  // Get the proposal record from the repository
  const proposalRepository = createMockProposalRepository();
  const proposalRecord = await proposalRepository.getById(id);

  // Return 404 if proposal not found
  if (!proposalRecord) {
    notFound();
  }

  // Build the export view model
  const viewModel = buildExportViewModel(proposalRecord);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <ProposalExportLayout viewModel={viewModel} />
    </div>
  );
}
