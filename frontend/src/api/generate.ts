/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch, BASE_URL, getToken } from "./client"
import type { PipelineEvent } from "../types"

export const generateChapter = (
  project_id: string, 
  chapter_number: number, 
  user_direction: string, 
  metadata: { genre: string; tone: string; style: string; description?: string },
  quality_threshold: number = 7.0,
  max_revisions: number = 2
) => {
  return apiFetch("/generate", { 
    method: "POST", 
    body: JSON.stringify({ 
      project_id, 
      chapter_number, 
      user_direction, 
      metadata,             
      quality_threshold,    
      max_revisions         
    }) 
  })
}

export const streamGenerateChapter = async function* (
  project_id: string,
  chapter_number: number,
  user_direction: string,
  metadata: { genre: string; tone: string; style: string; description?: string },
  quality_threshold: number = 7.0,
  max_revisions: number = 2
): AsyncGenerator<PipelineEvent> {
  const token = getToken()
  const headers: any = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const response = await fetch(
    `${BASE_URL}/projects/${project_id}/chapters/${chapter_number}/generate/stream`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        project_id,
        chapter_number,
        user_direction,
        metadata,
        quality_threshold,
        max_revisions,
      }),
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.clear()
      window.location.href = "/login"
      throw new Error("Unauthorized")
    }
    let detail = `HTTP ${response.status}`
    try {
      const err = await response.json()
      detail = err.detail || detail
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(detail)
  }

  if (!response.body) throw new Error("Streaming not supported")

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  const flush = (chunk: string) => {
    const events: PipelineEvent[] = []
    for (const part of chunk.split("\n\n")) {
      const line = part.trim()
      if (!line.startsWith("data:")) continue
      const payload = line.replace(/^data:\s*/, "")
      try {
        events.push(JSON.parse(payload))
      } catch {
        /* skip malformed frames */
      }
    }
    return events
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split("\n\n")
    buffer = parts.pop() || ""
    for (const event of flush(parts.join("\n\n"))) {
      yield event
    }
  }

  if (buffer.trim()) {
    for (const event of flush(buffer)) {
      yield event
    }
  }
}
