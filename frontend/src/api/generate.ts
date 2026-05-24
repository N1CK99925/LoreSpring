import { apiFetch } from "./client"

export const generateChapter = (
  project_id: string, 
  chapter_number: number, 
  user_direction: string, 
  metadata: { genre: string; tone: string; style: string },
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