import { Gem, Persona } from './types';

// NOTE: Per user request, models have been updated to 'gemini-2.5-pro', 'gemini-2.5-flash', and 'gemini-2.5-flash-lite'.
// These are the latest available models in Google AI Studio and should not be changed back.
export const AVAILABLE_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite', 'gemini-2.5-flash-image-preview'];


// --- ARTIFACT NAMES (Constants) ---
const INITIAL_PROMPT = 'INITIAL_PROMPT';
const IDEAS = 'Ideas';
const FINAL_ANSWER = 'Final_Answer';
const REFINED_IMAGE_PROMPT = 'Refined_Image_Prompt';


// --- PERSONA DEFINITIONS ---
// Planning
export const P_PO = { persona_id: 'p-product-owner', name: 'Product Owner', system_prompt: 'You are a Product Owner. Your task is to interpret user requests and create a detailed Product Requirements Document (PRD).' };
export const P_ARCHITECT = { persona_id: 'p-architect', name: 'Architect', system_prompt: 'You are a System Architect. Design a high-level structure and technical plan based on the user request and requirements.' };
export const P_RESEARCHER = { persona_id: 'p-researcher', name: 'Researcher', system_prompt: 'You are a Researcher. Your goal is to find, analyze, and summarize factual information, data, or existing work relevant to the user\'s request.' };
export const P_PROMPT_ARCHITECT = { persona_id: 'p-prompt-architect', name: 'Prompt Architect', system_prompt: 'You are a master of crafting prompts for generative AI. Your task is to take a user\'s request and refine it into a detailed, specific, and effective prompt that will yield the best possible result from an AI model. Consider the model\'s perspective, desired output format, and any nuances of the user\'s intent.' };


// Sharding
export const P_SHARDER = { persona_id: 'p-sharder', name: 'Sharder', system_prompt: 'You are a project manager who specializes in breaking down large tasks. Convert a Product Requirements Document into a set of high-level Epics.' };
export const P_STORY_WRITER = { persona_id: 'p-story-writer', name: 'Story Writer', system_prompt: 'You are an agile specialist. Convert high-level Epics into detailed, actionable User Stories for the development team.' };

// Development
export const P_CODER = { persona_id: 'p-coder', name: 'Coder/Engineer', system_prompt: 'You are an expert software engineer. Write clean, efficient, and well-documented code based on the provided user stories and architecture.' };
export const P_REVIEWER = { persona_id: 'p-reviewer', name: 'Reviewer', system_prompt: 'You are a senior code reviewer. Analyze the provided code for correctness, style, bugs, and potential improvements. Provide clear, constructive feedback.' };
export const P_DEBUGGER = { persona_id: 'p-debugger', name: 'Debugger', system_prompt: 'You are a debugging expert. Analyze the code and any provided feedback or error logs to identify and fix issues.' };

// Quality
export const P_QA = { persona_id: 'p-qa', name: 'QA (Test Architect)', system_prompt: 'You are a QA Architect. Verify the logic of the solution, write test cases, and check for robustness against the original requirements.' };
export const P_RISK_PROFILER = { persona_id: 'p-risk-profiler', name: 'Risk Profiler', system_prompt: 'You are a risk management specialist. Analyze the proposed solution or plan and identify potential issues, edge cases, or long-term problems.' };

// Finalization
export const P_SUMMARIZER = { persona_id: 'p-summarizer', name: 'Summarizer', system_prompt: 'You are a skilled summarizer. Condense all provided information, reports, and outputs into a concise summary.' };
export const P_PRESENTER = { persona_id: 'p-presenter', name: 'Presenter', system_prompt: 'You are a presenter who creates final, user-facing responses. Format all relevant information into a clear, well-structured, and easy-to-read Markdown document.' };

// Other Specialized Personas
export const P_BRAINSTORMER = { persona_id: 'p-brainstormer', name: 'Brainstormer', system_prompt: 'You are a creative idea generator. Brainstorm a wide range of diverse and innovative ideas based on the prompt.' };
export const P_SKEPTIC = { persona_id: 'p-skeptic', name: 'Skeptic', system_prompt: 'You are a critical thinker and skeptic. Your role is to challenge assumptions, question the validity of sources, and find potential flaws in arguments or research findings.' };
export const P_SLO_INTERPRETER = { persona_id: 'p-slo-interpreter', name: 'SLO Interpreter', system_prompt: 'You are an educator who interprets Student Learning Objectives (SLOs). Your goal is to understand the core educational goal from a user prompt.' };
export const P_LESSON_PLANNER = { persona_id: 'p-lesson-planner', name: 'Lesson Planner', system_prompt: 'You are an instructional designer. Create a structured, logical, and engaging lesson plan based on the learning objectives.' };
export const P_CONTENT_GENERATOR = { persona_id: 'p-content-generator', name: 'Content Generator', system_prompt: 'You are a subject matter expert and writer. Generate the detailed educational content, examples, and explanations for the lesson plan.' };
export const P_PEDAGOGY_CHECKER = { persona_id: 'p-pedagogy-checker', name: 'Pedagogy Checker', system_prompt: 'You are an expert in pedagogy. Review the lesson content to ensure it is effective, engaging, and follows sound educational principles.' };

export const ALL_PERSONAS: Persona[] = [P_PO, P_ARCHITECT, P_RESEARCHER, P_PROMPT_ARCHITECT, P_SHARDER, P_STORY_WRITER, P_CODER, P_REVIEWER, P_DEBUGGER, P_QA, P_RISK_PROFILER, P_SUMMARIZER, P_PRESENTER, P_BRAINSTORMER, P_SKEPTIC, P_SLO_INTERPRETER, P_LESSON_PLANNER, P_CONTENT_GENERATOR, P_PEDAGOGY_CHECKER];

// --- GEM DEFINITIONS ---
export const DEFAULT_GEMS: Gem[] = [
  // 1. Coder Gem
  {
    gem_id: 'gem-coder',
    name: 'Coder Gem',
    description: 'Full workflow (Planning -> Dev -> QA -> Final) for coding tasks.',
    isDefault: true,
    stages: [
      {
        stage_id: 's-plan', name: 'Planning',
        parallel_agents: [
          { assignment_id: 'a-plan-prd', persona_ref: P_PO.persona_id, model: 'gemini-2.5-flash', prompt_template: `Create a PRD for this user request: {${INITIAL_PROMPT}}`, output_artifact_name: 'PRD' },
          { assignment_id: 'a-plan-arch', persona_ref: P_ARCHITECT.persona_id, model: 'gemini-2.5-flash', prompt_template: `Design the system architecture for this user request: {${INITIAL_PROMPT}}`, output_artifact_name: 'Architecture_Doc' },
        ],
      },
      {
        stage_id: 's-shard', name: 'Sharding',
        parallel_agents: [
          { assignment_id: 'a-shard-epics', persona_ref: P_SHARDER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Break this PRD into Epics:\n\n{PRD}`, output_artifact_name: 'Epics' },
        ],
      },
      {
        stage_id: 's-story', name: 'Story Writing',
        parallel_agents: [
          { assignment_id: 'a-story-write', persona_ref: P_STORY_WRITER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Convert these Epics into User Stories:\n\n{Epics}`, output_artifact_name: 'Stories' },
        ],
      },
      {
        stage_id: 's-dev', name: 'Development',
        parallel_agents: [
          { assignment_id: 'a-dev-code', persona_ref: P_CODER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Write the code based on the following stories and architecture:\n\n# Stories:\n{Stories}\n\n# Architecture:\n{Architecture_Doc}`, output_artifact_name: 'Initial_Code' },
        ],
      },
       {
        stage_id: 's-review', name: 'Review & QA',
        parallel_agents: [
          { assignment_id: 'a-review-code', persona_ref: P_REVIEWER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Review this code:\n\n{Initial_Code}`, output_artifact_name: 'Code_Review' },
          { assignment_id: 'a-review-qa', persona_ref: P_QA.persona_id, model: 'gemini-2.5-flash', prompt_template: `Perform QA on this code based on the original stories. Does it meet requirements?\n\n# Code:\n{Initial_Code}\n\n# Stories:\n{Stories}`, output_artifact_name: 'QA_Report' },
        ],
      },
      {
        stage_id: 's-refine', name: 'Refinement',
        parallel_agents: [
          { assignment_id: 'a-refine-debug', persona_ref: P_DEBUGGER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Based on the following code review, please fix the initial code.\n\n# Code Review:\n{Code_Review}\n\n# Initial Code to Fix:\n{Initial_Code}`, output_artifact_name: 'Refined_Code' },
        ],
      },
      {
        stage_id: 's-final', name: 'Finalization',
        parallel_agents: [
          { assignment_id: 'a-final-present', persona_ref: P_PRESENTER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Synthesize the following into a final user-facing response. Include the final, refined code and a summary of the review process.\n\n# Refined Code:\n{Refined_Code}\n\n# Code Review:\n{Code_Review}\n\n# QA Report:\n{QA_Report}`, output_artifact_name: FINAL_ANSWER },
        ],
      },
    ],
  },
  // 2. Image Generator Gem
  {
    gem_id: 'gem-image-gen',
    name: 'Image Generator Gem',
    description: 'Uses a prompt architect and an image model to generate visuals.',
    isDefault: true,
    stages: [
      {
        stage_id: 's-img-refine', name: 'Prompt Refinement',
        parallel_agents: [
          {
            assignment_id: 'a-img-refine-prompt',
            persona_ref: P_PROMPT_ARCHITECT.persona_id,
            model: 'gemini-2.5-flash',
            prompt_template: `Refine the following user request into a powerful, descriptive prompt for an image generation AI. The prompt should be a single, detailed paragraph.\n\nUser Request: "{${INITIAL_PROMPT}}"`,
            output_artifact_name: REFINED_IMAGE_PROMPT
          }
        ]
      },
      {
        stage_id: 's-img-gen', name: 'Image Generation',
        parallel_agents: [
          {
            assignment_id: 'a-img-gen-create',
            persona_ref: P_PRESENTER.persona_id,
            model: 'gemini-2.5-flash-image-preview',
            prompt_template: `{${REFINED_IMAGE_PROMPT}}`,
            output_artifact_name: FINAL_ANSWER
          }
        ]
      }
    ]
  },
  // 3. Teacher Gem
  {
    gem_id: 'gem-teacher',
    name: 'Teacher Gem',
    description: 'Specialized for lesson plans, quizzes, and explanations.',
    isDefault: true,
    stages: [
        { stage_id: 's-teach-obj', name: 'Interpret Objective',
            parallel_agents: [{ assignment_id: 'a-teach-obj', persona_ref: P_SLO_INTERPRETER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Interpret the student learning objective from this prompt: {${INITIAL_PROMPT}}`, output_artifact_name: 'Learning_Objective' }]
        },
        { stage_id: 's-teach-plan', name: 'Plan Lesson',
            parallel_agents: [{ assignment_id: 'a-teach-plan', persona_ref: P_LESSON_PLANNER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Create a lesson plan for this objective: {Learning_Objective}`, output_artifact_name: 'Lesson_Plan' }]
        },
        { stage_id: 's-teach-gen', name: 'Generate Content',
            parallel_agents: [{ assignment_id: 'a-teach-gen', persona_ref: P_CONTENT_GENERATOR.persona_id, model: 'gemini-2.5-flash', prompt_template: `Generate lesson content based on this plan: {Lesson_Plan}`, output_artifact_name: 'Lesson_Content' }]
        },
        { stage_id: 's-teach-review', name: 'Review Pedagogy',
            parallel_agents: [{ assignment_id: 'a-teach-review', persona_ref: P_PEDAGOGY_CHECKER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Review this content for pedagogical effectiveness: {Lesson_Content}`, output_artifact_name: 'Pedagogy_Review' }]
        },
        { stage_id: 's-teach-final', name: 'Finalize',
            parallel_agents: [{ assignment_id: 'a-teach-final', persona_ref: P_PRESENTER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Format the following content and review into a final lesson for the user.\n\n# Lesson Content:\n{Lesson_Content}\n\n# Educator's Note:\n{Pedagogy_Review}`, output_artifact_name: FINAL_ANSWER }]
        },
    ]
  },
  // 4. Research Gem
  {
    gem_id: 'gem-research',
    name: 'Research Gem',
    description: 'Researcher + Skeptic + Summarizer for fact-heavy topics.',
    isDefault: true,
    stages: [
      { stage_id: 's-res-initial', name: 'Initial Research',
        parallel_agents: [
            { assignment_id: 'a-res-a', persona_ref: P_RESEARCHER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Research this topic: {${INITIAL_PROMPT}}`, output_artifact_name: 'Research_Notes_A' },
            { assignment_id: 'a-res-b', persona_ref: P_RESEARCHER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Find alternative sources or viewpoints on this topic: {${INITIAL_PROMPT}}`, output_artifact_name: 'Research_Notes_B' }
        ]
      },
      { stage_id: 's-res-crit', name: 'Critique & Verify',
        parallel_agents: [
            { assignment_id: 'a-res-crit', persona_ref: P_SKEPTIC.persona_id, model: 'gemini-2.5-flash', prompt_template: `Critically analyze and fact-check these research findings. Identify weaknesses or unsupported claims.\n\n# Research A:\n{Research_Notes_A}\n\n# Research B:\n{Research_Notes_B}`, output_artifact_name: 'Skeptic_Report' }
        ]
      },
      { stage_id: 's-res-sum', name: 'Summarize',
        parallel_agents: [
            { assignment_id: 'a-res-sum', persona_ref: P_SUMMARIZER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Synthesize the research and the skeptic's report into a balanced final answer.\n\n# Research A:\n{Research_Notes_A}\n\n# Research B:\n{Research_Notes_B}\n\n# Skeptic Report:\n{Skeptic_Report}`, output_artifact_name: FINAL_ANSWER }
        ]
      }
    ]
  },
  // 5. Flash Gem
  {
    gem_id: 'gem-flash',
    name: 'Flash Gem',
    description: 'Brainstormer + Summarizer for quick answers.',
    isDefault: true,
    stages: [
      {
        stage_id: 's-flash-brain', name: 'Brainstorm',
        parallel_agents: [
          { assignment_id: 'a-flash-brain', persona_ref: P_BRAINSTORMER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Brainstorm ideas for: {${INITIAL_PROMPT}}`, output_artifact_name: IDEAS },
        ],
      },
      {
        stage_id: 's-flash-sum', name: 'Summarize',
        parallel_agents: [
          { assignment_id: 'a-flash-sum', persona_ref: P_SUMMARIZER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Summarize these ideas into a concise answer: {${IDEAS}}`, output_artifact_name: FINAL_ANSWER },
        ],
      },
    ]
  },
  // 6. Brainstorm Gem
  {
    gem_id: 'gem-brainstorm',
    name: 'Brainstorm Gem',
    description: 'Multiple divergent agents + aggregator.',
    isDefault: true,
     stages: [
      {
        stage_id: 's-brain-div', name: 'Divergent Ideas',
        parallel_agents: [
          { assignment_id: 'a-brain-prac', persona_ref: P_BRAINSTORMER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Brainstorm a list of practical, safe ideas for: {${INITIAL_PROMPT}}`, output_artifact_name: 'Practical_Ideas' },
          { assignment_id: 'a-brain-wild', persona_ref: P_BRAINSTORMER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Brainstorm a list of wild, out-of-the-box ideas for: {${INITIAL_PROMPT}}`, output_artifact_name: 'Wild_Ideas' },
          { assignment_id: 'a-brain-risk', persona_ref: P_SKEPTIC.persona_id, model: 'gemini-2.5-flash', prompt_template: `What are the risks or downsides of pursuing ideas related to: {${INITIAL_PROMPT}}`, output_artifact_name: 'Risks' },
        ],
      },
      {
        stage_id: 's-brain-agg', name: 'Aggregate',
        parallel_agents: [
          { assignment_id: 'a-brain-agg', persona_ref: P_SUMMARIZER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Combine the following brainstorm lists and risk analysis into a single, structured report.\n\n# Practical Ideas\n{Practical_Ideas}\n\n# Wild Ideas\n{Wild_Ideas}\n\n# Risks\n{Risks}`, output_artifact_name: FINAL_ANSWER },
        ],
      },
    ]
  },
  // 7. Reviewer Gem
  {
    gem_id: 'gem-reviewer',
    name: 'Reviewer Gem',
    description: 'QA-only for fact-checking and refinement of provided text.',
    isDefault: true,
     stages: [
      {
        stage_id: 's-rev-crit', name: 'Critique',
        parallel_agents: [
          { assignment_id: 'a-rev-style', persona_ref: P_REVIEWER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Provide a stylistic and structural review of the following text: {${INITIAL_PROMPT}}`, output_artifact_name: 'Stylistic_Review' },
          { assignment_id: 'a-rev-fact', persona_ref: P_QA.persona_id, model: 'gemini-2.5-flash', prompt_template: `Fact-check and verify the claims made in the following text: {${INITIAL_PROMPT}}`, output_artifact_name: 'Fact-Check_Report' },
          { assignment_id: 'a-rev-risk', persona_ref: P_RISK_PROFILER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Identify potential risks or misinterpretations in the following text: {${INITIAL_PROMPT}}`, output_artifact_name: 'Risk_Report' },
        ],
      },
      {
        stage_id: 's-rev-final', name: 'Finalize Review',
        parallel_agents: [
          { assignment_id: 'a-rev-final', persona_ref: P_PRESENTER.persona_id, model: 'gemini-2.5-flash', prompt_template: `Combine the initial text with the feedback into a final, improved version. Present the original text, the critiques, and the suggested final version clearly.\n\n# Original Text\n{${INITIAL_PROMPT}}\n\n# Stylistic Review\n{Stylistic_Review}\n\n# Fact-Check Report\n{Fact-Check_Report}\n\n# Risk Report\n{Risk_Report}`, output_artifact_name: FINAL_ANSWER },
        ],
      },
    ]
  },
    // 8. Ultra Pro Gem
  {
    gem_id: 'gem-ultra-pro',
    name: 'Ultra Pro Gem',
    description: 'Full workflow using Pro models for maximum thoroughness.',
    isDefault: true,
    stages: [
       {
        stage_id: 's-pro-plan', name: 'Planning (Pro)',
        parallel_agents: [
          { assignment_id: 'a-pro-prd', persona_ref: P_PO.persona_id, model: 'gemini-2.5-pro', prompt_template: `Create a PRD for this user request: {${INITIAL_PROMPT}}`, output_artifact_name: 'PRD' },
          { assignment_id: 'a-pro-arch', persona_ref: P_ARCHITECT.persona_id, model: 'gemini-2.5-pro', prompt_template: `Design the system architecture for this user request: {${INITIAL_PROMPT}}`, output_artifact_name: 'Architecture_Doc' },
        ],
      },
      {
        stage_id: 's-pro-shard', name: 'Sharding (Pro)',
        parallel_agents: [
          { assignment_id: 'a-pro-shard', persona_ref: P_SHARDER.persona_id, model: 'gemini-2.5-pro', prompt_template: `Break this PRD into Epics:\n\n{PRD}`, output_artifact_name: 'Epics' },
        ],
      },
      {
        stage_id: 's-pro-story', name: 'Story Writing (Pro)',
        parallel_agents: [
          { assignment_id: 'a-pro-story', persona_ref: P_STORY_WRITER.persona_id, model: 'gemini-2.5-pro', prompt_template: `Convert these Epics into User Stories:\n\n{Epics}`, output_artifact_name: 'Stories' },
        ],
      },
      {
        stage_id: 's-pro-dev', name: 'Development (Pro)',
        parallel_agents: [
          { assignment_id: 'a-pro-dev', persona_ref: P_CODER.persona_id, model: 'gemini-2.5-pro', prompt_template: `Write the code based on the following stories and architecture:\n\n# Stories:\n{Stories}\n\n# Architecture:\n{Architecture_Doc}`, output_artifact_name: 'Initial_Code' },
        ],
      },
       {
        stage_id: 's-pro-review', name: 'Review & QA (Pro)',
        parallel_agents: [
          { assignment_id: 'a-pro-review', persona_ref: P_REVIEWER.persona_id, model: 'gemini-2.5-pro', prompt_template: `Review this code:\n\n{Initial_Code}`, output_artifact_name: 'Code_Review' },
          { assignment_id: 'a-pro-qa', persona_ref: P_QA.persona_id, model: 'gemini-2.5-pro', prompt_template: `Perform QA on this code based on the original stories. Does it meet requirements?\n\n# Code:\n{Initial_Code}\n\n# Stories:\n{Stories}`, output_artifact_name: 'QA_Report' },
        ],
      },
      {
        stage_id: 's-pro-refine', name: 'Refinement (Pro)',
        parallel_agents: [
          { assignment_id: 'a-pro-refine', persona_ref: P_DEBUGGER.persona_id, model: 'gemini-2.5-pro', prompt_template: `Based on the following code review, please fix the initial code.\n\n# Code Review:\n{Code_Review}\n\n# Initial Code to Fix:\n{Initial_Code}`, output_artifact_name: 'Refined_Code' },
        ],
      },
      {
        stage_id: 's-pro-final', name: 'Finalization (Pro)',
        parallel_agents: [
          { assignment_id: 'a-pro-final', persona_ref: P_PRESENTER.persona_id, model: 'gemini-2.5-pro', prompt_template: `Synthesize the following into a final user-facing response. Include the final, refined code and a summary of the review process.\n\n# Refined Code:\n{Refined_Code}\n\n# Code Review:\n{Code_Review}\n\n# QA Report:\n{QA_Report}`, output_artifact_name: FINAL_ANSWER },
        ],
      },
    ]
  },
  // 9. Lite Gem
  {
    gem_id: 'gem-lite',
    name: 'Lite Gem',
    description: 'All agents on Lite models for speed and cost-effectiveness.',
    isDefault: true,
    stages: [
      {
        stage_id: 's-lite-brain', name: 'Brainstorm (Lite)',
        parallel_agents: [
          { assignment_id: 'a-lite-brain', persona_ref: P_BRAINSTORMER.persona_id, model: 'gemini-2.5-flash-lite', prompt_template: `Brainstorm ideas for: {${INITIAL_PROMPT}}`, output_artifact_name: IDEAS },
        ],
      },
      {
        stage_id: 's-lite-sum', name: 'Summarize (Lite)',
        parallel_agents: [
          { assignment_id: 'a-lite-sum', persona_ref: P_SUMMARIZER.persona_id, model: 'gemini-2.5-flash-lite', prompt_template: `Summarize these ideas into a concise answer: {${IDEAS}}`, output_artifact_name: FINAL_ANSWER },
        ],
      },
    ]
  },
  // 10. Mixed Mode Gem
  {
    gem_id: 'gem-mixed-mode',
    name: 'Mixed Mode Gem',
    description: 'Uses Lite, Flash, and Pro models to generate, critique, and synthesize the best possible answer.',
    isDefault: true,
    stages: [
      {
        stage_id: 's-mix-gen',
        name: 'Idea Generation',
        parallel_agents: [
          {
            assignment_id: 'a-mix-lite',
            persona_ref: P_BRAINSTORMER.persona_id,
            model: 'gemini-2.5-flash-lite',
            prompt_template: `Generate a concise, fast, and practical response for the user's request: {${INITIAL_PROMPT}}`,
            output_artifact_name: 'Lite_Response'
          },
          {
            assignment_id: 'a-mix-flash',
            persona_ref: P_BRAINSTORMER.persona_id,
            model: 'gemini-2.5-flash',
            prompt_template: `Generate a creative and slightly more detailed response for the user's request: {${INITIAL_PROMPT}}`,
            output_artifact_name: 'Flash_Response'
          }
        ]
      },
      {
          stage_id: 's-mix-crit',
          name: 'Critique',
          parallel_agents: [
              {
                  assignment_id: 'a-mix-crit',
                  persona_ref: P_SKEPTIC.persona_id,
                  model: 'gemini-2.5-flash',
                  prompt_template: `Review the two responses below. Identify the strengths of each and any potential weaknesses or contradictions.\n\n# Response from Lite model:\n{Lite_Response}\n\n# Response from Flash model:\n{Flash_Response}`,
                  output_artifact_name: 'Critique_Report'
              }
          ]
      },
      {
        stage_id: 's-mix-synth',
        name: 'Final Synthesis (Pro)',
        parallel_agents: [
          {
            assignment_id: 'a-mix-synth',
            persona_ref: P_PRESENTER.persona_id,
            model: 'gemini-2.5-pro',
            prompt_template: `You are the final editor. Your task is to synthesize the best elements from the two initial responses, taking into account the critique, to create a single, comprehensive, and high-quality final answer for the user.\n\n## User's Original Request:\n{${INITIAL_PROMPT}}\n\n## Response from Lite model (fast, concise):\n{Lite_Response}\n\n## Response from Flash model (more creative):\n{Flash_Response}\n\n## Critique and Analysis:\n{Critique_Report}\n\nCombine the strengths of both responses, address the critique, and present the final, polished answer below.`,
            output_artifact_name: FINAL_ANSWER
          }
        ]
      }
    ]
  },
];