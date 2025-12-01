import logging
from pathlib import Path

LOG_DIR = Path("data/output/logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "run.log"

logger = logging.getLogger("LoreSpring")
logger.setLevel(logging.INFO)


file_handler = logging.FileHandler(LOG_FILE)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(logging.Formatter(
    "[{asctime}] {levelname} - {message}",
    style="{",
    datefmt="%Y-%m-%d %H:%M:%S"
))


console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(logging.Formatter(
    "[{asctime}] {levelname} - {message}",
    style="{",
    datefmt="%H:%M:%S"
))

logger.addHandler(file_handler)
logger.addHandler(console_handler)