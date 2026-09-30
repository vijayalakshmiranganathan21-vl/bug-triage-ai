/**
 * Bug Model Schema Blueprint
 * 
 * Defines standard data contracts for bugs in BugFlow AI.
 */
export const BugSchemaDefinition = {
  id: "String (UUID / Primary Key)",
  title: "String",
  description: "String",
  rawInput: "String",
  severity: "Enum ['Critical', 'High', 'Medium', 'Low']",
  priority: "Enum ['P0', 'P1', 'P2', 'P3']",
  status: "Enum ['New', 'Triaged', 'In Progress', 'Ready for QA', 'Verified', 'Closed']",
  assignedTo: "String (User ID / Name)",
  team: "String",
  reportedBy: "String",
  source: "Enum ['github', 'jira', 'sentry', 'portal', 'slack']",
  reproductionSteps: "Array of Strings",
  logs: "String",
  aiTriageMetadata: {
    analyzedAt: "Date",
    confidence: "Number",
    predictedCategory: "String",
    recommendedFix: "String",
    isDuplicate: "Boolean",
    duplicateOfId: "String",
  },
  createdAt: "Date",
  updatedAt: "Date",
};

export default BugSchemaDefinition;
