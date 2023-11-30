from flask_caching import Cache
import os

CACHE_DIR = "./.cache"
os.mkdir(CACHE_DIR) if not os.path.exists(CACHE_DIR) else None

config = {
    "DEBUG": True,
    "CACHE_TYPE": "FileSystemCache",
    "CACHE_DEFAULT_TIMEOUT": 300,
    "CACHE_DIR": CACHE_DIR,
}

cache = Cache(config=config)
