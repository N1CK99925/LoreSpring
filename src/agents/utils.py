import re


def build_revision_plan(
    revision_result: dict,
    
    revision_preferences: dict = None
) -> dict:
    metrics = revision_result.get("quality_metrics", {})
    feedback = revision_result.get("quality_feedback", [])

    if not metrics or not feedback:
        return {
            "priority_dimensions": [],
            "banned_phrases": [],
            "dimension_instructions": {},
            "raw_feedback": feedback
        }

    
    sorted_dims = sorted(metrics.items(), key=lambda x: x[1])
    priority_dimensions = [k for k, v in sorted_dims[:2]]

   
    all_text = " ".join(feedback)
    matches = re.findall(
        r"['\u2018\u2019\"\u201c\u201d]([^''\u2018\u2019\"\u201c\u201d]{10,})['\u2018\u2019\"\u201c\u201d]",
        all_text
    )
    banned_phrases = list(set(matches))

    print("ran build_revision_plan with metrics:", metrics)
   
    dimension_instructions = {
        "pacing": "Cut the slowest scene by a third. Every paragraph must advance plot, shift power, or deepen character — not all three, but at least one.",
        "character_depth": "At least one character must reveal something through action or subtext that wasn't stated explicitly. No introspective exposition.",
        "prose_clarity": "Replace every simile with a concrete physical detail. Remove any sentence that restates what the previous sentence already established.",
        "tension": "Each scene beat must end with the POV character in a worse or more uncertain position than it started. No relief until the chapter's final line.",
        "prompt_adherence": "Re-read the user direction. List the specific beats it requires. Verify each is present in the draft before finishing."
    }

    # User-provided preferences override defaults per dimension
    # V2: revision_preferences populated from API request payload
    # V2: system can suggest custom instructions based on specific feedback
    revision_preferences = revision_preferences or {}
    targeted_instructions = {
        dim: revision_preferences.get(dim) or dimension_instructions.get(dim, "Rewrite this dimension from scratch.")
        for dim in priority_dimensions
    }

    return {
        "priority_dimensions": priority_dimensions,
        "banned_phrases": banned_phrases,
        "dimension_instructions": targeted_instructions,
        "raw_feedback": feedback
    }