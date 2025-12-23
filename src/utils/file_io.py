import yaml

from pathlib import Path
from typing import Any, Dict

def load_yaml_config(file_name: str) -> Dict[str, Any]:
    """
    Load YAML configuration files from the config directory
    
    Args:
        file_name: Name of the YAML file in config directory
        
    Returns:
        Dictionary containing the configuration
    """
  
    current_dir = Path(__file__).parent
    
   
    # utils -> src -> main folder -> config
    config_path = current_dir.parent.parent / 'config' / file_name
    
    try:
        with open(config_path, 'r', encoding='utf-8') as file:
            return yaml.safe_load(file)
    except FileNotFoundError:
        print(f"Config file not found: {config_path}")
        return {}
    except yaml.YAMLError as e:
        print(f"Error parsing YAML file {file_name}: {e}")
        return {}


def load_prompt_file(file_name: str) -> Dict[str,Any]:
    current_dir = Path(__file__).parent
    
    
    prompt_path = current_dir.parent /'models'/ 'prompt_library' / f"{file_name}_prompt.txt"
        
    try:
        with open(prompt_path,'r',encoding='utf-8') as file:
            content = file.read()
            return content
    except IOError as e:
        print(f"Error reading prompt file {file_name}: {e}")
        return ""
            
            
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
CONFIG_DIR = PROJECT_ROOT / "config"
MEMORY_DIR = DATA_DIR / "memory"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MEMORY_DIR.mkdir(parents=True, exist_ok=True)

def get_data_path(filename: str) -> Path:
    """Get path to file in data directory"""
    return DATA_DIR / filename

def get_config_path(filename: str) -> Path:
    """Get path to file in config directory"""
    return CONFIG_DIR / filename

def get_memory_path(filename: str) -> Path:
    """Get path to file in memory directory"""
    return MEMORY_DIR / filename