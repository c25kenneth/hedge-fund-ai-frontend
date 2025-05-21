# Hedge Fund AI Chat — Frontend (React)

This is the frontend for the Hedge Fund AI Chat application. It provides a real-time chat interface powered by an AI assistant. The app uses Supabase for authentication and connects to a Python backend for streaming AI responses. Link to backend code [here](https://github.com/c25kenneth/hedge-fund-ai-backend)

---

## Features

- User authentication with Supabase OAuth2 (Google auth)
- Viewable chat history
- Real-time AI responses via streaming
- Clean, responsive UI with Tailwind CSS
- Refresh and scroll-to-bottom chat behavior

---

## Tech Stack

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase Auth](https://supabase.com/)
- [Flask Python backend](https://flask.palletsprojects.com/)
- [Azure OpenAI, OpenAI Search, SQL Databases](https://azure.microsoft.com/en-us/)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/c25kenneth/hedge-fund-ai-frontend
cd hedge-fund-ai-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure env variables
Create a .env file using the provided example:
```bash
cp .env.example .env
```

Then update the values in .env:

```bash
VITE_SUPABASE_URL=https://yoursupabaseproject.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 4. Run the app locally

```bash
npm run dev
```

The app will run on http://localhost:5173
