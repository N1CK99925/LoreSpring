

def normalize_lore_entry(entry: dict) -> dict:
    """Force consistent types on all lore entries"""
    if "traits" in entry:
        if isinstance(entry["traits"], str):
            entry["traits"] = [t.strip() for t in entry["traits"].split(",")]
    
    if "known_relationships" in entry:
        if isinstance(entry["known_relationships"], str):
            entry["known_relationships"] = [entry["known_relationships"]]
    
    return entry

def merge_lore(existing: dict, new: dict) -> dict:
    for section in ["characters", "locations", "objects"]:
        existing.setdefault(section, {})
        for name, attrs in new.get(section, {}).items():
           
            attrs = normalize_lore_entry(attrs)
            if name not in existing[section]:
                existing[section][name] = attrs
            else:
                existing[section][name].update(attrs)
    return existing