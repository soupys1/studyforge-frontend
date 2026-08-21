
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function generateNotes(document_id: string, topic: string) {
  const params = new URLSearchParams({ document_id, topic });

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes?${params}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Notes generation failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function generateFlashcards(document_id: string, topic: string) {
  const params = new URLSearchParams({ document_id, topic });

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flashcards?${params}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Flashcard generation failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function generateQuiz(document_id: string, topic: string) {
  const params = new URLSearchParams({ document_id, topic });

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz?${params}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Quiz generation failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
