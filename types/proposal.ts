export type ProposalStatus = "draft" | "review" | "sent" | "won" | "archived";

export interface ProposalEstimateSummary {
  subtotal: number;
  adjustmentTotal: number;
  estimatedTotal: number;
  confidenceLabel: "Low" | "Medium" | "High";
}

export interface Proposal {
  id: string;
  title: string;
  clientName: string;
  contactName: string;
  industry: string;
  status: ProposalStatus;
  summary: string;
  scope: string[];
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  projectTypeId: string;
  styleMultiplierId: string;
  estimate: ProposalEstimateSummary;
}
