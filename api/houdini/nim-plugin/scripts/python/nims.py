import base64
import requests
from io import BytesIO
from PIL import Image

def sd3(
        endpoint_url, 
        auth_token,
        prompt,
        neg_prompt,
        seed,
        steps,
        cfg_scale,
        aspect_ratio,
    ):


    if prompt != "":
       
        header_token = f"Bearer {auth_token}"
        
        headers = {
            "Authorization": header_token,
            "Accept": "application/json",
        }
        
        payload = {
            "prompt": prompt,
            "cfg_scale": cfg_scale,
            "aspect_ratio": aspect_ratio,
            "seed": seed,
            "steps": steps,
            "negative_prompt": neg_prompt
        }
        
        response = requests.post(endpoint_url, headers=headers, json=payload)
        response.raise_for_status()
        response_body = response.json()
                   
        #Process the raw generated image to a PNG
        image_data = base64.b64decode(response_body["image"])
        image = Image.open(BytesIO(image_data))
        image = image.convert('RGBA') 

        return image 
    else:
        raise("prompt is required")