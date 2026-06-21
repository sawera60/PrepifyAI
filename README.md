## What is PrepifyAI?

### AI-Powered Mock Interview Platform with Real-Time Voice Conversation

PrepifyAI is a SaaS mock interview platform where users have a **real voice conversation with an AI interviewer**. You speak, the AI listens, responds in voice, and evaluates your performance — just like a real interview.

Unlike text-based interview tools, PrepifyAI uses a full **speech-to-speech pipeline** for a natural, pressure-test experience.

---

## ✨ Key Features

- 🎤 **Real-time voice interview** — speak naturally, AI responds in voice (not just text)
- 📄 **3 interview modes** — Mock, Custom topic, and Resume-based interviews
- 📊 **Post-interview analytics** — scored on Communication, Technical Depth, Confidence, Problem Solving & Clarity
- 🔐 **Secure auth** — JWT refresh token rotation + Google OAuth via Passport.js
- ⚡ **Low-latency streaming** — SSE (Server-Sent Events) for real-time token delivery

---

## 🏗️ Architecture

```
User Speaks
    ↓
MediaRecorder (browser)
    ↓
Deepgram Nova-2 (Speech-to-Text)
    ↓
Groq SDK → OpenRouter Llama 3.1 8B (LLM reasoning + streaming via SSE)
    ↓
Deepgram Aura (Text-to-Speech)
    ↓
Base64 Audio → Played back to user
```

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 19 + Vite | UI framework |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| React Context API | Auth & global state |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (refresh rotation) | Stateless auth |
| HTTP-only cookies | Secure token storage |
| Passport.js | Google OAuth 2.0 |
| SSE | Real-time streaming |
| Helmet + CORS + Rate Limiting | API hardening |

### AI & Voice Layer
| Tech | Purpose |
|------|---------|
| Groq SDK | Ultra-fast LLM inference |
| OpenRouter (Llama 3.1 8B) | Interview question generation & evaluation |
| Deepgram Nova-2 | Speech-to-text transcription |
| Deepgram Aura | Text-to-speech AI voice |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Deepgram API key
- OpenRouter API key
- Groq API key

### Installation

```bash
# Clone the repo
git clone https://github.com/sawera60/PrepifyAI.git
cd PrepifyAI

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in `/server`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DEEPGRAM_API_KEY=your_deepgram_key
OPENROUTER_API_KEY=your_openrouter_key
GROQ_API_KEY=your_groq_key
CLIENT_URL=http://localhost:5173
```

### Run Locally

```bash
# Start backend (from /server)
npm run dev

# Start frontend (from /client)
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:5000`

---

## 📁 Project Structure

```
PrepifyAI/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── context/         # Auth & global state
│   │   └── hooks/           # Custom React hooks
├── server/                  # Express backend
│   ├── controllers/         # Route handlers
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Auth, error handling
│   └── services/            # AI/voice pipeline logic
```

---

## 🔒 Security Implementation

- JWT **refresh token rotation** — new refresh token issued on every access token refresh
- Tokens stored in **HTTP-only cookies** (not localStorage) — prevents XSS attacks
- **Helmet.js** — sets secure HTTP headers
- **CORS** configured for production origin only
- **Rate limiting** on auth endpoints — prevents brute force

---

## 🎯 Interview Modes

| Mode | Description |
|------|-------------|
| **Mock Interview** | AI selects questions based on a general tech role |
| **Custom Interview** | User specifies topic/role, AI tailors questions |
| **Resume-based** | Upload your CV, AI generates questions from your actual experience |

---

## 📈 Post-Interview Evaluation

After each session, a background async job evaluates your performance across 5 dimensions:

| Dimension | What's Measured |
|-----------|----------------|
| Communication | Clarity, structure, articulation |
| Technical Depth | Accuracy and depth of technical answers |
| Confidence | Filler words, hesitation patterns |
| Problem Solving | Approach and logical reasoning |
| Clarity | Conciseness, avoiding rambling |

---

## 🙋‍♀️ Author

**Sawera Sajid** — Freelance MERN Stack Developer  


---

> Built with curiosity and a lot of console.log() 🚀
