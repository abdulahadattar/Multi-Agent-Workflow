import { z } from 'zod';

// This schema is based on the existing types in `types.ts`.
// It is used to validate the structure of imported Gem files.
// IDs are omitted as they should be generated upon import to ensure uniqueness.

const AgentAssignmentSchema = z.object({
  persona_ref: z.string(),
  model: z.string(),
  prompt_template: z.string(),
  output_artifact_name: z.string().min(1, "Output artifact name cannot be empty"),
  system_prompt_override: z.string().optional(),
});

const StageSchema = z.object({
  name: z.string(),
  parallel_agents: z.array(AgentAssignmentSchema),
});

export const ImportedGemSchema = z.object({
  name: z.string().min(1, "Gem name is required"),
  description: z.string(),
  stages: z.array(StageSchema),
}).passthrough(); // Allows other properties that we don't validate to exist
