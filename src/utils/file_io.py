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


    