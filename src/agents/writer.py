from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from langchain_core.messages import SystemMessage, HumanMessage
from src.memory.lightrag import query_lore

# TODO: Add sytle prompt so that user can style prompt based on writing sytle

from langsmith import traceable



@traceable(name="writer")
async def writer_agent_node(state: NarrativeState) -> NarrativeState:
    
    previous_chapters_summary = state.get("previous_chapter_summary", [])
    
    prev_summary = "\n\n".join([
        f"Chapter {s['chapter_number']}: {s['summary']}"
        for s in previous_chapters_summary
    ]) if previous_chapters_summary else "This is the first chapter."
    
    metadata = state.get("metadata", {})
    genre = metadata.get("genre", "fantasy")
    revision_count = state.get("revision_count", 0)
    
    feedback = state.get("quality_feedback", [])
    draft_current = state.get("draft", "")
    
    
    should_revise = state.get("should_revise", False)

    temp = max(0.3, 0.7 - (revision_count * 0.2))
    continuity_issues = state.get("continuity_issues", [])

    feedback_text = "\n".join(feedback) if feedback else "No specific quality issues noted."
    
    
    continuity_text = "\n".join(
        [f"[{i.get('severity')}] {i.get('description')}" for i in continuity_issues]
    ) if continuity_issues else "No continuity issues detected."

    metrics = state.get("quality_metrics", {})
    metrics_text = "\n".join([f"- {k}: {v}/10" for k, v in metrics.items()])


  
    if revision_count == 0 or not should_revise:
        lore_context = await query_lore(
            f"""
            Provide all relevant established canonical facts involving:
            - Characters referenced in: {state.get('user_direction')}
            - Locations involved
            - Ongoing conflicts
            - Previously revealed objects or mechanisms
            - Related prior events

            Return factual lore only. No commentary.
            """,
            mode="hybrid"
        )
        state["lore_context"] = lore_context
    else:
        lore_context = state.get("lore_context", "")






    if revision_count == 0 or not should_revise:
        system = f"""
        You are a master {genre} fiction author with 20 years of experience crafting immersive, character-driven narratives.

        <established_lore>
        {lore_context}
        </established_lore>

        <writing_directives>
        - Length: 800-1200 words
        - POV: Third person limited, past tense
        - Ground every scene in specific sensory detail (what the POV character sees, hears, smells, feels)
        - Reveal character through action and dialogue, not exposition
        - Each paragraph should advance plot, deepen character, or build atmosphere — preferably all three
        - Vary sentence rhythm: mix short punchy sentences with longer flowing ones
        - End the chapter on a moment of tension, decision, or revelation
        </writing_directives>

        <hard_constraints>
        - You MUST NOT contradict any fact in <established_lore>
        - Output ONLY the chapter text — no title, no preamble, no commentary
        </hard_constraints>
            """

        user = f"""
            Previous Chapter Summary:
            {prev_summary}

            User Direction:
            {state['user_direction']}

            Write Chapter {state['chapter_number']} now. Begin directly with the narrative.
        """

        llm = get_llm(select_model("creative_writing"), temp=temp, max_tokens=2000)
        messages = [SystemMessage(content=system), HumanMessage(content=user)]
        response = llm.invoke(messages)

        state["draft"] = response.content
        state["revision_count"] = 1
        return state


    else:

        system = f"""
            You are a senior developmental editor rewriting a {genre} chapter that failed quality review.

            <established_lore>
            {lore_context}
            </established_lore>

            <continuity_errors_to_fix>
            {continuity_text}
            </continuity_errors_to_fix>

            <quality_scores>
            {metrics_text}
            </quality_scores>

            <revision_strategy>
            1. Identify the TWO lowest-scoring dimensions above
            2. For each: rewrite the specific scenes responsible for those low scores
            3. Do not just polish — REWRITE those scenes from scratch with a different approach
            4. Keep scenes scoring 7+ largely intact, tightening prose only
            </revision_strategy>

            <hard_constraints>
            - Preserve all core plot beats from the original draft
            - Fix every continuity error listed above
            - Output ONLY the revised chapter text
            </hard_constraints>
            """

        user = f"""
            Previous Chapter Summary:
            {prev_summary}
            
            Feedback Text
            {feedback_text}

            --- PREVIOUS DRAFT ---
            {draft_current}

            --- INSTRUCTIONS ---
            Rewrite this chapter entirely.
            Incorporate required improvements.
            Fix all continuity errors.
            Maintain the {metadata.get('style', 'literary')} style.

            Output ONLY the revised chapter text.
            """

        llm = get_llm(select_model("creative_writing"), temp=temp, max_tokens=2000)
        messages = [SystemMessage(content=system), HumanMessage(content=user)]
        response = llm.invoke(messages)

        state["draft"] = response.content
        state["revision_count"] = revision_count + 1
        return state