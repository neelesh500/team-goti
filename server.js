import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

const PORT = process.env.PORT || 3001;

// Synthetic Curriculum Data
const curriculum = {
    modules: [
        {
            day: 1,
            topic: "Prompt Engineering",
            objectives: ["Zero-shot", "Few-shot", "Chain of Thought"],
        },
        {
            day: 5,
            topic: "Retrieval-Augmented Generation (RAG)",
            objectives: ["Vector Embeddings", "Semantic Search", "Chunking"],
        },
        {
            day: 10,
            topic: "Vector Databases",
            objectives: ["Pinecone", "FAISS", "Cosine Similarity"],
        },
        {
            day: 15,
            topic: "Agentic AI",
            objectives: ["ReAct Framework", "Tool Usage", "Memory"],
        },
        {
            day: 20,
            topic: "Model Context Protocol (MCP)",
            objectives: ["Servers", "Clients", "Tools", "Resources"],
        },
        {
            day: 25,
            topic: "AI Deployment",
            objectives: ["Docker", "Vercel", "Serverless Functions"],
        },
        {
            day: 30,
            topic: "Production AI Systems",
            objectives: ["Monitoring", "Evaluations", "Feedback Loops"],
        },
    ],
};

// Simulated sessions
const sessions = {};

// Mock AI Logic to drive interview using Gemini
async function generateAIResponse(sessionId, candidateMessage) {
    const session = sessions[sessionId];

    if (!session) {
        return { text: "Session error. Please start a new interview.", isFinished: false };
    }

    session.turns++;
    session.history.push({ role: "user", parts: [{ text: candidateMessage }] });

    if (session.turns >= 8 && !session.concluded) {
        session.concluded = true;
        // Request final JSON evaluation
        session.history.push({ role: "user", parts: [{ text: "The interview is now over. Provide a final evaluation of the candidate in STRICT JSON format exactly matching this structure without any markdown or extra text: {\"text\": \"final goodbye message\", \"feedback\": {\"strengths\": [\"str1\"], \"gaps\": [\"gap1\"], \"next\": [\"next1\"], \"summary\": \"overall summary\"}}" }] });
    }

    // Map turns dynamically to curriculum topics (day 1, day 5, etc.)
    const currentTopicObj = curriculum.modules[Math.min(session.turns > 0 ? session.turns - 1 : 0, curriculum.modules.length - 1)];
    const currentTopic = currentTopicObj ? currentTopicObj.topic : "General AI";
    const candidateStr = JSON.stringify(session.candidate.missions || []);

    if (!GEMINI_API_KEY) {
        // Fallback if no API key in server
        return {
            text: `(Offline Server Mode) Let's discuss ${currentTopic}. Tell me what you know about it.`,
            isFinished: session.turns >= 8,
            feedback: session.turns >= 8 ? { strengths: ["Good attempt"], gaps: [], next: [], summary: "Completed in Offline Mode" } : null
        };
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{
                        text: `You are a strict, professional Technical AI Interviewer evaluating ${session.candidate.member.name} for the ${session.candidate.member.jobRole} role based on a 31-day AI Cohort.
Interview Progress: This is turn ${session.turns} of 8.
CURRENT TOPIC FOCUS: ${currentTopic}
Candidate Progress Profile: ${candidateStr} (Use this to personalize: ask harder questions on things they passed easily, and specifically target skipped topics or topics with many attempts.)

CRITICAL BEHAVIOR RULES:
1. CURRENT TOPIC MANDATE: Ask a question related to ${currentTopic}. Move forward progressively.
2. DEEP EVALUATION FIRST: Evaluate their previous answer before asking the next question.
3. SINGLE QUESTION: Ask ONE clear, challenging technical question at a time.` }]
                },
                contents: session.history
            })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        if (session.concluded) {
            try {
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
                    feedback: { strengths: ["Completed assessment"], gaps: [], next: [], summary: "Completed" },
                    isFinished: true
                };
            }
        }

        session.history.push({ role: "model", parts: [{ text: aiText }] });
        return { text: aiText, isFinished: false };
    } catch (err) {
        console.error("Gemini API Error in backend:", err);
        return { text: "Server AI connection error.", isFinished: false };
    }
}

// Required HTTP endpoint format
app.post("/api/interview", async (req, res) => {
    const { sessionId = "default", message, candidate } = req.body;

    // If there is a candidate but no message, it's a "start" action
    if (candidate && !message) {
        sessions[sessionId] = {
            turns: 0,
            concluded: false,
            candidate: candidate,
            history: []
        };
        const msg = `Hi ${candidate.member.name}! I'm your AI Interviewer. We'll be covering the concepts you learned in the 31-day AI Cohort. Are you ready to begin?`;
        sessions[sessionId].history.push({ role: "model", parts: [{ text: msg }] });

        return res.json({
            sessionId,
            reply: msg,
            done: false,
        });
    }

    // Otherwise it's a "chat" action
    if (message) {
        const response = await generateAIResponse(sessionId, message);
        return res.json({
            sessionId,
            reply: response.text,
            done: response.isFinished,
            feedback: response.feedback,
        });
    }

    return res.status(400).json({ error: "Invalid action" });
});

// Mock candidates for the frontend
app.get("/api/candidates", (req, res) => {
    const candidates = [
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
    return res.json(candidates);
});


app.listen(PORT, () => {
    console.log(`Mock AI Interview API listening on port ${PORT}`);
});
