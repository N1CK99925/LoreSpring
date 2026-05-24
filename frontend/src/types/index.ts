export interface Project { id: string; title: string; created_at: string , genre: string, tone: string , style: string}
export interface Chapter { chapter_number: number; final_chapter: string; quality_score: number; revision_count: number }
export interface Token { access_token: string; token_type: string }
export interface QualityMetrics { pacing: number; character_depth: number; prose_clarity: number; tension: number; prompt_adherence: number }