// Synthetic Backend for GitHub Pages Deployment

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sessions = {};

function generateAIResponse(sessionId, candidateMessage) {
    const session = sessions[sessionId];

    if (!session) {
        return { text: "Session error. Please start a new interview." };
    }

    session.turns++;

    if (session.turns > 8 && !session.concluded) {
        session.concluded = true;
        return {
            text: "Thank you for these insightful answers. Based on our conversation, you've shown a strong grasp of building RAG systems and Agentic AI, though reviewing Vector Search optimizations could be beneficial. I've compiled your feedback. The interview is now complete. Good luck on your AI engineering journey!",
            feedback: {
                strengths: [
                    "Clear understanding of Agent workflows",
                    "Good practical knowledge of RAG",
                ],
                gaps: ["Deepen knowledge on chunking strategies"],
                next: ["Review Vector Search optimizations", "Explore advanced MCP concepts"],
                summary: "Pass. Ready for production AI roles.",
            },
            isFinished: true,
        };
    }

    const questions = [
        "Welcome to your technical interview for the AI Cohort! Let's start with Prompt Engineering. Can you explain the difference between zero-shot and few-shot prompting, and when you'd use each?",
        "Great. Moving on to Retrieval-Augmented Generation (RAG). If your semantic search is returning irrelevant results, what steps would you take to diagnose and improve the chunking strategy?",
        "That makes sense. In relation to that, how do Vector Databases calculate similarity between these chunks? Can you explain Cosine Similarity in simple terms?",
        "Interesting. Let's switch gears to Agentic AI. You've built systems using the ReAct framework. How does an agent decide when to use a tool versus when it has enough information to answer?",
        "I see. Let's talk about the Model Context Protocol (MCP). How does MCP standardize the connection between AI agents and external data sources?",
        "Good explanation. When preparing these models for AI Deployment, what are the primary challenges of deploying large language models on edge devices vs cloud servers?",
        "Lastly, regarding Production AI Systems, how do you handle monitoring and evaluations in production contexts to detect model drift?",
    ];

    const qIndex = Math.min(session.turns - 1, questions.length - 1);
    return {
        text: questions[qIndex],
        isFinished: false,
    };
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
    sessions[sessionId] = { turns: 0, concluded: false };
    return {
        sessionId,
        reply: "Hi there! I'm your AI Interviewer. We'll be covering the concepts you learned in the 31-day AI Cohort, from Prompt Engineering to Production AI Systems. Are you ready to begin?",
        done: false,
    };
};

export const chatInterview = async (sessionId, message) => {
    await delay(1000);
    const response = generateAIResponse(sessionId, message);
    return {
        sessionId,
        reply: response.text,
        done: response.isFinished,
        feedback: response.feedback,
    };
};
