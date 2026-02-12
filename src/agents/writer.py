from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from langchain_core.messages import SystemMessage, HumanMessage

def writer_agent_node(state: NarrativeState) -> NarrativeState:
    
    previous_chapters_summary = state.get('previous_chapter_summary', [])
    prev_summary = previous_chapters_summary[-1] if previous_chapters_summary else 'This is the first chapter.'
    
    metadata = state.get('metadata', {})
    genre = metadata.get('genre', 'fantasy')
    revision_count = state.get("revision_count", 0)
    feedback = state.get("quality_feedback", [])
    draft_current = state.get("draft", "")
    feedback_text = "\n".join(f"- {item}" for item in feedback)
    temp = 0.7 if revision_count == 0 else 0.5

    # TODO: fix when user changes should revise to false
    
    
    
    if revision_count == 0:
    

   
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
        
        # Update state (these create the keys if missing)
        state["draft"] = response.content
        state["revision_count"] = 1
        
        return state
    
    else:
        system = """
        You are revising a chapter draft based on editorial feedback.

        Your task:
        - Improve the chapter using the feedback.
        - Fix weaknesses.
        - Preserve strengths.
        - Maintain story direction.
        - Do not introduce unrelated plot changes.
        - Output the full revised chapter.
          
          
          - Output ONLY the final chapter text.
            - Do NOT explain your changes.
            - Do NOT include notes.
            - Do NOT include bullet points.
            - Do NOT include commentary.
            - Do NOT include anything outside the story.
            
        

        """
        
        user = f"""
        
        EDITORIAL FEEDBACK:
        - {feedback_text}

        --- CURRENT DRAFT ---
        {draft_current}

        Revise the chapter accordingly.
        Return the full improved chapter.

            """

        
        llm = get_llm(select_model("creative_writing"), temp=temp, max_tokens=2000)
        
        messages = [SystemMessage(content=system), HumanMessage(content=user)]
        response = llm.invoke(messages)
        print("writer Node working")
        # Update state (these create the keys if missing)
        state["draft"] = response.content
        state["revision_count"] = revision_count + 1
        print("revision count" , revision_count)

        
        return state
    
            
        
    
