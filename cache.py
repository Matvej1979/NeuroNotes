from typing import Optional
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_note(note_id: str, data: dict):
    redis_client.set(note_id, json.dumps(data), ex=3600)  # TTL 1 час

def get_cached_note(note_id: str) -> Optional[dict]:
    data = redis_client.get(note_id)
    return json.loads(data) if data else None