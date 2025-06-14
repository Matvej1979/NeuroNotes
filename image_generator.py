# image_generator.py
import openai
import requests
from typing import Optional

openai.api_key = os.getenv("OPENAI_API_KEY")

class ImageGenerator:
    @staticmethod
    def generate_image(prompt: str) -> Optional[str]:
        try:
            response = openai.Image.create(
                prompt=prompt,
                n=1,
                size="512x512"
            )
            return response['data'][0]['url']
        except Exception as e:
            print(f"Error generating image: {e}")
            return None

    @staticmethod
    def download_image(url: str, save_path: str) -> bool:
        try:
            response = requests.get(url)
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
        except Exception as e:
            print(f"Download failed: {e}")
            return False
