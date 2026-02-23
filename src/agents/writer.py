from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from langchain_core.messages import SystemMessage, HumanMessage


# TODO : switch 2nd writer to qwen 30b
def writer_agent_node(state: NarrativeState) -> NarrativeState:
    
    previous_chapters_summary = state.get('previous_chapter_summary', [])
    
    prev_summary = "\n\n".join([
        f"Chapter {s['chapter_number']}: {s['summary']}" 
        for s in previous_chapters_summary
    ]) if previous_chapters_summary else 'This is the first chapter.'
    
    metadata = state.get('metadata', {})
    genre = metadata.get('genre', 'fantasy')
    revision_count = state.get("revision_count", 0)
    feedback = state.get("quality_feedback", [])
    draft_current = state.get("draft", "")
    
    temp = max(0.3, 0.7 - (revision_count * 0.2))
    continuity_issues = state.get("continuity_issues", [])
    
    
    feedback_text = "\n".join(feedback) if feedback else "No specific quality issues noted."
    continuity_text = "\n".join([f"[{i.get('severity')}] {i.get('description')}" for i in continuity_issues]) if continuity_issues else "No continuity issues detected."


    metrics = state.get("quality_metrics", {})
    metrics_text = "\n".join([f"- {k}: {v}/10" for k, v in metrics.items()])





    # TODO: fix when user changes should revise to false
    
    
    
    if revision_count == 0 or not state.get('should_revise',False):
    

   
        system = f"""You are an expert narrative writer specializing in {genre} fiction.

            Your task: Write Chapter {state['chapter_number']} of an ongoing narrative.

            LORE CONTEXT (if available):
            Characters: {state.get('lore_context', {}).get('characters', 'None provided')}
            Recent Events: {state.get('lore_context', {}).get('events', 'None provided')}

            STYLE GUIDELINES:
            - Length: 800-1200 words (test version)
            - Third person limited, past tense
            - Show don't tell, use sensory details

            CRITICAL: Maintain consistency with any provided context.
            
            
            
            - Output ONLY the final chapter text.
            - Do NOT explain your changes.
            - Do NOT include notes.
            - Do NOT include bullet points.
            - Do NOT include commentary.
            - Do NOT include anything outside the story.
            
            You must preserve established facts from previous chapters.
            You must not contradict:
            - character traits
            - discovered objects
            - revealed mechanisms


            """

        user = f"""Previous Chapter Summary:
            {prev_summary}

            User Direction: {state['user_direction']}

            Write Chapter {state['chapter_number']} now. Begin directly with the narrative."""
            
   
        llm = get_llm(select_model("creative_writing"), temp=temp, max_tokens=2000)
        print("writer Node working x2")
        messages = [SystemMessage(content=system), HumanMessage(content=user)]
        response = llm.invoke(messages)
        
        
        state["draft"] = response.content
        state["revision_count"] = 1
        
        return state
    
    else:
        system = f"""
            You are a Senior Editor and Lead Writer. The previous draft was REJECTED for quality issues.
            
            Your Goal: Rewrite the chapter to address every piece of feedback below while maintaining the core plot.
            
            STORY MEMORY/CONTINUITY RULES:
            {continuity_text}
            
            REQUIRED QUALITY IMPROVEMENTS:
            {feedback_text}
            
            QUALITY SCORES FROM PREVIOUS DRAFT:
            {metrics_text}
            Focus improvements on the lowest-scoring dimensions first.
            
          
            Output ONLY the final chapter text.
            - Do NOT explain your changes.
            - Do NOT include notes.
            - Do NOT include bullet points.
            - Do NOT include commentary.
            - Do NOT include anything outside the story.
            
          
        

        """
        
        user = f"""
        Previous Chapter summary
        {prev_summary}
        
        
        --- PREVIOUS DRAFT TO BE REPLACED ---
        {draft_current}

        --- INSTRUCTIONS ---
        Rewrite this chapter entirely. Incorporate the required improvements and fix all continuity errors. 
        Maintain the {metadata.get('style', 'literary')} style.
        Output ONLY the text of the revised chapter
        
        Do not just tweak sentences. If the feedback says 'Show, Don't Tell', rewrite those specific scenes with sensory action. 
        For example, instead of saying 'she masked the mana', describe the specific magical threads she is pulling and the tension of the inspector's scanner passing over them.

            """

        
        llm = get_llm(select_model("creative_writing"), temp=temp, max_tokens=2000)
        
        messages = [SystemMessage(content=system), HumanMessage(content=user)]
        response = llm.invoke(messages)
        print("writer Node working")
        
        state["draft"] = response.content
        state["revision_count"] = revision_count + 1
        print("revision count" , revision_count)

        
        return state
    
            
        
    
