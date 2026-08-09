// Synthetic Backend for GitHub Pages Deployment

// Real AI Integration for GitHub Pages using Gemini API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; // Add your key here before pushing, or in your VITE .env file

const sessions = {};
const curriculum = ["Prompt Engineering", "RAG & Chunking", "Vector Databases & Cosine Similarity", "Agentic AI (ReAct)", "Model Context Protocol (MCP)", "Production & Deployment"];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateAIResponse(sessionId, candidateMessage) {
    const session = sessions[sessionId];
    if (!session) return { text: "Session error. Please start a new interview.", isFinished: false };

    session.turns++;
    session.history.push({ role: "user", parts: [{ text: candidateMessage }] });

    // IF GEMINI IS NOT CONFIGURED, USE ADVANCED OFFLINE ALGORITHM
    if (!GEMINI_API_KEY) {
        const lowerMsg = candidateMessage.toLowerCase();
        const badWords = ["stupid", "idiot", "fuck", "shit", "dumb", "hell", "bastard"];

        let reply = "";
        if (badWords.some(w => lowerMsg.includes(w))) {
            reply = "Excuse me! As your interviewer, I expect a professional tone and appropriate language. Please compose yourself and answer the question technically.";
        } else if (candidateMessage.length < 15 && session.turns % 2 !== 0) {
            reply = "That's a very brief answer. Could you please elaborate with more technical specifics?";
        } else {
            const goodKeywords = ["api", "database", "vector", "embedding", "llm", "rag", "mcp", "agent", "prompt", "context", "model", "function", "token"];
            const foundCount = goodKeywords.filter(k => lowerMsg.includes(k)).length;

            let analysis = "";
            if (foundCount >= 2) {
                analysis = "Good points there, you seem to have a solid grasp on those concepts. ";
            } else if (foundCount === 1) {
                analysis = "That's somewhat relevant, though I would expect a bit more technical depth. ";
            } else {
                analysis = "I'm not fully convinced by that explanation; it lacks specific technical details. ";
            }

            const nextTopic = curriculum[Math.min(session.turns - 1, curriculum.length - 1)];
            const transitions = [
                `Let's pivot to ${nextTopic}. What can you tell me about it?`,
                `Moving on, how do you handle ${nextTopic} in your projects?`,
                `Now, let's discuss ${nextTopic}. What's your practical experience there?`,
                `Next up is ${nextTopic}. Please explain your understanding of it.`
            ];
            const transition = transitions[session.turns % transitions.length];

            reply = analysis + transition;
        }

        if (session.turns > 6) {
            return {
                text: "Thank you for these insightful answers. Based on our conversation, I've compiled your feedback. The interview is now complete.",
                feedback: {
                    strengths: ["Attempted to answer core topics"],
                    gaps: ["Needs more depth in technical explanations without API keys!"],
                    next: ["Integrate Gemini API key for real AI experience."],
                    summary: "Pass (Offline Mode). Configure API Key for real assessment."
                },
                isFinished: true,
            };
        }

        session.history.push({ role: "model", parts: [{ text: reply }] });
        return { text: reply, isFinished: false };
    }

    // --- REAL GEMINI API LOGIC --- //
    if (session.turns > 6 && !session.concluded) {
        session.concluded = true;
        // Ask Gemini to generate JSON feedback
        session.history.push({ role: "user", parts: [{ text: "The interview is now over. Provide a final evaluation of the candidate in STRICT JSON format exactly matching this structure without any markdown or extra text: {\"text\": \"final goodbye message\", \"feedback\": {\"strengths\": [\"str1\"], \"gaps\": [\"gap1\"], \"next\": [\"next1\"], \"summary\": \"overall summary\"}}" }] });
    }

    const currentTopic = curriculum[Math.min(session.turns > 0 ? session.turns - 1 : 0, curriculum.length - 1)];

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{
                        text: `You are a strict, highly professional Technical AI Interviewer evaluating ${session.candidate.member.name} for the ${session.candidate.member.jobRole} role.
Interview Progress: This is turn ${session.turns} of 6.
CURRENT TOPIC FOCUS: ${currentTopic}

CRITICAL BEHAVIOR RULES (DO NOT IGNORE):
1. CURRENT TOPIC MANDATE: You MUST formulate your NEXT question based on the CURRENT TOPIC FOCUS (${currentTopic}). If they already answered well, move on to this new topic. Do NOT stay stuck on previous topics!
2. DEEP EVALUATION FIRST: Before asking the next question, briefly evaluate their previous answer. Point out what was correct, or missing.
3. NEVER BE REPETITIVE: Do not repeat standard transition phrases. Vary your wording completely each time.
4. SINGLE QUESTION: Ask ONE clear, challenging technical question at a time. Keep your response structured: Evaluation first, then the next question on ${currentTopic}.`
                    }]
                },
                contents: session.history
            })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        if (session.concluded) {
            try {
                // Parse the JSON block out of the text if it includes markdown
                const jsonMatch = aiText.match(/\{[\s\S]*\}/);
                const result = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
                return {
                    text: result.text || "Interview concluded. Thank you.",
                    feedback: result.feedback,
                    isFinished: true
                };
            } catch (e) {
                return {
                    text: "Interview concluded successfully.",
                    feedback: { strengths: ["Good completion"], gaps: [], next: [], summary: "Completed" },
                    isFinished: true
                };
            }
        }

        session.history.push({ role: "model", parts: [{ text: aiText }] });
        return { text: aiText, isFinished: false };
    } catch (err) {
        console.error("Gemini Error:", err);
        return { text: "Network error with AI. Please try again.", isFinished: false };
    }
}

export const fetchCandidates = async () => {
    await delay(500); // Simulate network
    return [
        {
            member: {
                id: "c1",
                name: "Abhishek Sharma",
                jobRole: "AI Engineer",
            },
            signals: {
                missionsCompleted: 12,
            },
            missions: [
                { title: "Understand Zero-shot Prompting", passed: true },
                { title: "Implement RAG with Pinecone", passed: true },
                { title: "Build a ReAct Agent", passed: true },
                { title: "Docker Deployments", passed: true },
                { title: "MCP Server Setup", passed: true },
                { title: "Evaluations and Monitoring", passed: false },
            ],
        },
        {
            member: {
                id: "c2",
                name: "Priya Patel",
                jobRole: "Full Stack AI Developer",
            },
            signals: {
                missionsCompleted: 8,
            },
            missions: [
                { title: "Basic Prompting", passed: true },
                { title: "Local Vector Search", passed: true },
                { title: "MCP Client Connection", passed: true },
            ],
        },
    ];
};

export const startInterview = async (sessionId, candidate) => {
    await delay(1000);
    sessions[sessionId] = {
        turns: 0,
        concluded: false,
        candidate: candidate,
        history: []
    };

    // Initial message
    const msg = `Hi ${candidate.member.name}. I'm your AI Interviewer. We'll be evaluating your knowledge on the 31-day AI Cohort topics today. Are you ready to begin your technical assessment?`;
    sessions[sessionId].history.push({ role: "model", parts: [{ text: msg }] });

    return {
        sessionId,
        reply: msg,
        done: false,
    };
};

export const chatInterview = async (sessionId, message) => {
    await delay(1000);
    const response = await generateAIResponse(sessionId, message);
    return {
        sessionId,
        reply: response.text,
        done: response.isFinished,
        feedback: response.feedback,
    };
};
