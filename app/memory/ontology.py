import yaml

from pathlib import Path


ONTOLOGY_PATH = Path(__file__).with_name("entity_types.yaml")


def load_entity_ontology() -> dict:
    with ONTOLOGY_PATH.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def render_entity_guidance(ontology: dict) -> str:
    lines = [
        "Classify each entity using EXACTLY one type below.",
        "If none fits, prefer to SKIP rather than use Other.",
        "",
    ]

    for entity_type, config in ontology["entity_types"].items():
        lines.append(f"- {entity_type}: {config['description'].strip()}")

        if config.get("examples"):
            examples = ", ".join(config["examples"])
            lines.append(f"  Examples: {examples}")

        if config.get("exclusions"):
            exclusions = ", ".join(config["exclusions"])
            lines.append(f"  Do NOT use this type for: {exclusions}")

        lines.append("")

    lines.extend(
        [
            "STRICT EXCLUSIONS — Do NOT extract:",
            "",
        ]
    )

    for category, values in ontology["exclusions"].items():
        lines.append(f"- {category}: {', '.join(values)}")

    lines.extend(
        [
            "",
            "PRIORITIZATION when crowded:",
            " > ".join(ontology["prioritization"]),
            "",
            "Do not duplicate the same concept under different casing or pluralization.",
            "Prefer skipping an uncertain entity over creating a low-quality entity.",
        ]
    )

    return "\n".join(lines)
