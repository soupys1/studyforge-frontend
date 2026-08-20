

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

export async function generateNotes(document_id : string , topic : string) {
    const params = new URLSearchParams({ document_id, topic });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes?${params}`, {
    method: "POST",
    
    });

    

    return response.json();
}

export async function generateFlashcards(document_id : string , topic : string) {
    const params = new URLSearchParams({ document_id, topic });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flashcards?${params}`, {
    method: "POST",
    
    });

    

    return response.json();
}

export async function generateQuiz(document_id : string , topic : string) {
    const params = new URLSearchParams({ document_id, topic });
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz?${params}`, {
    method: "POST",
    
    });

    

    return response.json();}
