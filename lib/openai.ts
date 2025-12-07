import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn("OPENAI_API_KEY is not set in environment variables.");
}

export const openai = new OpenAI({
    apiKey: apiKey || "dummy-key", // Prevent crash if key is missing, but calls will fail
    dangerouslyAllowBrowser: true, // Note: We should ideally only use this server-side
});
