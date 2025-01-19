import base64
import json
from io import BytesIO
from PIL import Image
from colorthief import ColorThief

def normalize_palette(palette, method="gamma", gamma=0.8, new_min=50, new_max=255, brightness_threshold=80):
    def calculate_brightness(color):
        return 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]

    def boost_brightness(color, target_brightness):
        brightness = calculate_brightness(color)
        if brightness >= target_brightness:
            return color
        factor = target_brightness / brightness
        return [
            min(255, int(channel * factor)) for channel in color
        ]

    normalized_palette = []
    if method == "gamma":
        for color in palette:
            adjusted_color = [
                int(255 * (channel / 255) ** gamma) for channel in color
            ]
            adjusted_color = boost_brightness(adjusted_color, brightness_threshold)
            normalized_palette.append(adjusted_color)
    elif method == "contrast":
        min_val = min(min(color) for color in palette)
        max_val = max(max(color) for color in palette)
        for color in palette:
            adjusted_color = [
                int((channel - min_val) / (max_val - min_val) * (new_max - new_min) + new_min)
                for channel in color
            ]
            adjusted_color = boost_brightness(adjusted_color, brightness_threshold)
            normalized_palette.append(adjusted_color)
    return normalized_palette

def extract_color_palette(base64_image, normalization_method="gamma"):
    try:
        image_data = base64.b64decode(base64_image.split(",")[1])
        with BytesIO(image_data) as image_file:
            with Image.open(image_file) as image:
                if image.size[0] == 0 or image.size[1] == 0:
                    return json.dumps({"error": "Invalid image size"})
                
                image = image.convert("RGB")
                image.thumbnail((200, 200))
                
                with BytesIO() as resized_image_file:
                    image.save(resized_image_file, format="JPEG")
                    resized_image_file.seek(0)
                    color_thief = ColorThief(resized_image_file)
                    palette = color_thief.get_palette(color_count=6)
        
        normalized_palette = normalize_palette(palette, method=normalization_method)
        return json.dumps(normalized_palette)
    except Exception as e:
        return json.dumps({"error": str(e)})


if __name__ == "__main__":
    import sys
    base64_image = sys.stdin.read()
    result = extract_color_palette(base64_image, normalization_method="gamma")
    print(result)
