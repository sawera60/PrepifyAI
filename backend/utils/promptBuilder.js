
//promptBuilder: Builds final message array for OpenAI.
const promptBuilder = ({ interview, transcript }) => {
    const systemPrompt = {
        role: "system",
        content: `
You are a professional technical interviewer.

Rules:
- Ask one question at a time
- Wait for user response before next question
- Be polite, clear, and professional
- Focus on the interview role: ${interview?.title || "General Interview"}
- Do not give multiple questions at once
        `.trim(),
    };

    return [
        systemPrompt,
        ...transcript,
    ];
};

export default promptBuilder;