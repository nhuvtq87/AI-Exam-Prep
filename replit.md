# SJSU Spartan Exam Prep AI

A React + TypeScript web application that helps SJSU students study smarter using Google's Gemini AI. Students can upload course materials (PDFs, PPTs, web links) and the app generates flashcards, quizzes, study plans, and simplified explanations.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Package Manager:** npm
- **AI:** Google Gemini (via `@google/genai`)
- **File Processing:** `pdfjs-dist`, `mammoth`, `jszip`
- **Styling:** Tailwind CSS (CDN)

## Project Structure

```
/
├── App.tsx               # Root component
├── index.tsx             # Entry point
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration (port 5000, host 0.0.0.0)
├── types.ts              # Shared TypeScript interfaces
├── components/           # UI components (Dashboard, FlashcardView, QuizView, etc.)
└── services/
    └── geminiService.ts  # Gemini AI integration and prompt engineering
```

## Environment Variables

- `GEMINI_API_KEY` (secret) — Required. Google Gemini API key for AI features.

## Development

```bash
npm install
npm run dev   # Starts Vite dev server on port 5000
```

## Deployment

Configured as a **static** site deployment:
- Build command: `npm run build`
- Public directory: `dist`
