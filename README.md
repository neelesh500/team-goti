# AI Interview Agent

An AI Interview Agent designed to conduct a dynamic, multi-turn technical interview based on candidates' learning journey through the 31-day AI Cohort curriculum.

## System Architecture

This project is built using:

1. **Frontend**: React (Vite) + Framer Motion (for animations).
2. **Backend**: Node.js + Express (serving the `/api/interview` REST API).
3. **Data Store**: Synthetic data (`curriculum.json` and `candidates.json`) loaded into memory for interview session persistence.

## Technical Specifications Met

- **Endpoint Structure**: The backend strictly exposes the required `POST /api/interview` contract.
  - _Start_: Accepts `{ sessionId, candidate }` and returns `{ reply, done: false }`.
  - _Chat_: Accepts `{ sessionId, message }` and returns `{ reply, done: false }`.
  - _End_: Concludes organically with `{ reply, done: true, feedback: { summary, strengths, gaps, next } }`.
- **Stateless/Stateful Context**: The session context and conversation turns are maintained in-memory on the backend mapped via `sessionId`.

## How to Run locally

### Prerequisites

Make sure you have `Node.js` installed.

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the environment (Frontend + Backend concurrent script):**
   ```bash
   npm start
   ```

This runs the web interface on `localhost:5173` and the Backend API on `localhost:3001`.

## Included Mock Data

I have integrated the exact JSON resources you required:

- `data/candidates.json`: Contains the candidate profiles and mission attempts.
- `data/curriculum.json`: Contains the 31-day syllabus used to formulate evaluation criteria.

_Note: In the simulated backend (`server.js`), the interviewer actively picks questions across multiple foundational modules (Vector Search, Prompting, MCP, etc.) and halts automatically to supply structured grading outputs matching the spec._
