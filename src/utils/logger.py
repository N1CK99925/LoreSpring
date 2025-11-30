import logging
from pathlib import Path


LOG_DIR = Path("data/output/logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "run.log"

logging.basicConfig(
    level=logging.INFO,                     
    filename=str(LOG_FILE),                
    filemode="a",                          
    format="[{asctime}] {levelname} - {message}",
    style="{",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Create logger object
logger = logging.getLogger("StorySystem")
