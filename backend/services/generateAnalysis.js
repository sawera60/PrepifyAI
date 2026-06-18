import { getAIResponse } from "./groq.js";
export const generateAnalysis = async ({ transcript, interview }) => {
  // Build a readable transcript string for the AI
  const transcriptText = transcript
    .map((msg) => `${msg.role === "user" ? "Candidate" : "Interviewer"}: ${msg.content}`)
    .join("\n");

  const prompt = [
    {
      role: "system",
      content: `You are an expert interview evaluator. 
Analyze the interview transcript and return ONLY a valid JSON object — no extra text, no markdown, no backticks.
The JSON must follow this exact structure:
{
  "score": <overall score 0-100>,
  "feedback": "<2-3 sentence overall feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "dimensions": {
    "communication": <0-100>,
    "technicalKnowledge": <0-100>,
    "confidence": <0-100>,
    "problemSolving": <0-100>,
    "clarity": <0-100>
  }
}

CRITICAL RULES:
1. Base your evaluation ONLY on the candidate's actual responses in the transcript.
2. If the candidate did not answer any questions, ended the interview early without providing substantial technical answers, or if the transcript only contains greetings/questions from the interviewer, you MUST assign an overall score of 0 and 0 for all dimensions.
3. In such cases (score of 0), the feedback should clearly state that the interview was incomplete or no answers were provided, and list "None" or "Not enough data" for strengths.`,
    },
    {
      role: "user",
      content: `Interview Role: ${interview?.title || "General"}
Difficulty: ${interview?.difficulty || "Medium"}
Experience Level: ${interview?.experience || "Intermediate"}
Tech Stack: ${interview?.category || interview?.techStack || "General"}
 
Transcript:
${transcriptText}
 
Evaluate the candidate based on the transcript above and return the JSON.`,
    },
  ];

  const raw = await getAIResponse(prompt);

  // Strip markdown fences if AI adds them despite instructions
  const cleaned = raw.replace(/```json|```/g, "").trim();

  const parsed = JSON.parse(cleaned);
  return parsed;
};