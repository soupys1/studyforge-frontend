# Study RAG — Frontend

Next.js frontend for the Study RAG system. Users upload a document, then generate study notes, flashcards, and quiz questions from it by entering a topic.

## Tech stack

| Layer | Library |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| API client | Native `fetch` (no SDK) |

## Folder structure

```
study-rag-frontend/
├── app/
│   ├── page.tsx             # Home: file upload + all three generators
│   ├── layout.tsx           # Root layout
│   ├── notes/page.tsx       # Placeholder
│   ├── flashcards/page.tsx  # Placeholder
│   └── quiz/page.tsx        # Placeholder
├── components/
│   ├── FileUpload.tsx        # File picker, upload, cold-start hint
│   ├── NoteCard.tsx          # Topic input → study note display
│   ├── FlashCard.tsx         # Topic input → flashcard set display
│   └── QuizCard.tsx          # Topic input → quiz display
└── lib/
    └── api.ts               # All fetch calls to the backend
```

## How it works

1. User picks a file in `FileUpload`. Accepted formats: `.pdf`, `.docx`, `.txt`.
2. On upload, `FileUpload` calls `POST /upload` and receives a `document_id`.
3. `document_id` is lifted to the home page state and passed as a prop to `NoteCard`, `FlashCard`, and `QuizCard`.
4. Each card has a topic input. On submit it calls the relevant backend endpoint and renders the result.

All three generators are shown on the same page simultaneously once a document is uploaded.

## API layer (`lib/api.ts`)

Four functions, each wrapping a single backend call:

| Function | Endpoint | Method |
|---|---|---|
| `uploadFile(file)` | `/upload` | POST multipart |
| `generateNotes(documentId, topic)` | `/notes` | GET |
| `generateFlashcards(documentId, topic)` | `/flashcards` | GET |
| `generateQuiz(documentId, topic)` | `/quiz` | GET |

Every function checks `response.ok` and throws an `Error` with the HTTP status if the request fails. This means any network error, cold-start timeout, or server 5xx will propagate to the component as a catchable error rather than silently returning an error body.

## Error handling

Every component follows the same pattern:

- `error` state initialized to `null`, cleared at the start of each request
- API call wrapped in `try/catch/finally`
- On catch: `err instanceof Error ? err.message : "Something went wrong"` displayed in red
- `finally` always clears the loading state

`FileUpload` additionally:
- Validates file type on selection before hitting the backend (`.pdf`, `.docx`, `.txt` only)
- Shows a "Server is waking up..." hint after 5 seconds if the upload is still pending (handles Render free-tier cold start)

## Environment variables

Create a `.env.local` in the project root:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Change this to your deployed backend URL in production (e.g. `https://your-app.onrender.com`).

## Running locally

```bash
npm install
npm run dev
```

App available at `http://localhost:3000`. Requires the backend to be running at the URL set in `NEXT_PUBLIC_API_URL`.

## Component reference

### `FileUpload`
Props: `onUploadComplete(documentId: string) => void`

Handles file selection (with type validation), upload, the Render cold-start UX, and error display. Calls `onUploadComplete` with the `document_id` on success.

### `NoteCard`
Props: `documentId: string`

Renders a topic input and "Generate Notes" button. On success displays the note title and content.

### `FlashCard`
Props: `documentId: string`

Renders a topic input and "Generate Flashcards" button. On success displays all cards as Q/A pairs.

### `QuizCard`
Props: `documentId: string`

Renders a topic input and "Generate Questions" button. On success displays each question with its options, correct answer, and explanation.
