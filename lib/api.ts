import { supabase } from "./supabase";
import type { SavedDocument } from "@/types";

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
    method: "POST",
    headers: await authHeaders(),
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
    headers: await authHeaders(),
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
    headers: await authHeaders(),
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
    headers: await authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Quiz generation failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function listMyDocuments(): Promise<SavedDocument[]> {
  const headers = await authHeaders();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-documents`, {
    headers,
  });
  if (!response.ok) throw new Error("Failed to load documents");
  return response.json();
}
