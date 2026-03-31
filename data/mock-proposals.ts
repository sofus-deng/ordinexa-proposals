import type { Proposal } from "@/types";

export const proposals: Proposal[] = [
  {
    id: "ordx-1001",
    title: "Regional Proposal Workspace Modernization",
    clientName: "Northstar Advisory Group",
    contactName: "Maya Chen",
    industry: "Professional Services",
    status: "review",
    summary:
      "A modular workspace for intake, pricing alignment, and proposal assembly across APAC commercial teams.",
    scope: [
      "Unified proposal intake workflow",
      "Pricing guardrails for regional teams",
      "Executive-ready proposal presentation layer",
    ],
    createdAt: "2026-03-19",
    updatedAt: "2026-03-30",
    dueDate: "2026-04-04",
    projectTypeId: "ai-workspace",
    styleMultiplierId: "executive-fast-track",
    estimate: {
      subtotal: 42000,
      adjustmentTotal: 8540,
      estimatedTotal: 50540,
      confidenceLabel: "High",
    },
  },
  {
    id: "ordx-1002",
    title: "Revenue Operations Proposal Kit",
    clientName: "Helio Systems",
    contactName: "Daniel Wu",
    industry: "SaaS",
    status: "sent",
    summary:
      "Proposal package and pricing framework for a cross-functional revenue operations transformation.",
    scope: [
      "Proposal template rationalisation",
      "Commercial packaging for service tiers",
      "Internal enablement for account teams",
    ],
    createdAt: "2026-03-08",
    updatedAt: "2026-03-28",
    dueDate: "2026-04-02",
    projectTypeId: "web-platform",
    styleMultiplierId: "standard-delivery",
    estimate: {
      subtotal: 28000,
      adjustmentTotal: 140,
      estimatedTotal: 28140,
      confidenceLabel: "Medium",
    },
  },
  {
    id: "ordx-1003",
    title: "Internal Bid Desk Automation Pilot",
    clientName: "Verdant Logistics",
    contactName: "Elena Park",
    industry: "Logistics",
    status: "draft",
    summary:
      "Pilot proposal for internal approvals, pricing review, and delivery planning automation.",
    scope: [
      "Approval path mapping",
      "Operational estimate placeholders",
      "Pilot workspace handoff plan",
    ],
    createdAt: "2026-03-24",
    updatedAt: "2026-03-31",
    dueDate: "2026-04-11",
    projectTypeId: "ops-automation",
    styleMultiplierId: "embedded-retainer",
    estimate: {
      subtotal: 22500,
      adjustmentTotal: 1430,
      estimatedTotal: 23930,
      confidenceLabel: "Medium",
    },
  },
  {
    id: "ordx-1004",
    title: "Proposal Factory Operating Model",
    clientName: "Aureline Capital",
    contactName: "Grace Lin",
    industry: "Financial Services",
    status: "won",
    summary:
      "Proposal operating model for enterprise deal support, review governance, and reusable commercial assets.",
    scope: [
      "Proposal lifecycle definition",
      "Pricing governance recommendations",
      "Rollout playbook for regional teams",
    ],
    createdAt: "2026-02-27",
    updatedAt: "2026-03-21",
    dueDate: "2026-03-25",
    projectTypeId: "ai-workspace",
    styleMultiplierId: "standard-delivery",
    estimate: {
      subtotal: 42000,
      adjustmentTotal: -3360,
      estimatedTotal: 38640,
      confidenceLabel: "High",
    },
  },
];

export const getProposalById = (id: string) => proposals.find((proposal) => proposal.id === id);
