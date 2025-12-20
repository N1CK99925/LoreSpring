import json
from pathlib import Path
from typing import Dict, Any
from datetime import datetime
from utils.logger import logger
from typing import List

class StoryState:
    """
    Dumb Memory to store current story state
    
    
    """
    def __init__(self, state_file: str = "../data/memory/story_state.json"):
        self.state_file = Path(state_file)
        self.state = self.load()
    
    def load(self) -> Dict[str, Any]:
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                return json.load(f)
        return self._create_empty_state()
    
    def _create_empty_state(self) -> Dict[str, Any]:
        return {
            "current_chapter": 0,
            "total_chapters_written": 0,
            "active_plot_threads": [],
            "character_states": {},
            "world_state": {},
            "recent_events": [],
            "flags": {},
            "created_at": datetime.now().isoformat()
        }
    
    def save(self):
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
        logger.info(f"Saved story state: chapter {self.state['current_chapter']}")
    
    def get_current_chapter(self) -> int:
        return self.state["current_chapter"]
    
    def get_next_chapter(self) -> int:
        return self.state["current_chapter"] + 1
    
    def mark_chapter_complete(self, chapter_num: int, word_count: int = 0):
        self.state["current_chapter"] = chapter_num
        self.state["total_chapters_written"] += 1
        self.save()
        
    def update_plot_threads(self, threads: List[str]):
        """Update active plot threads from chapter plan"""
        self.state["active_plot_threads"] = threads
        self.save()

    def update_character_state(self, character: str, state_updates: Dict):
        """Update a character's state"""
        if character not in self.state["character_states"]:
            self.state["character_states"][character] = {}
        self.state["character_states"][character].update(state_updates)
        self.save()

    def add_recent_event(self, event: str, chapter: int):
        """Track recent story events"""
        self.state["recent_events"].append({
            "event": event,
            "chapter": chapter,
            "timestamp": datetime.now().isoformat()
        })
        # Keep only last 50 events
        self.state["recent_events"] = self.state["recent_events"][-50:]
        self.save()