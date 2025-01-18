import base64
import json
from io import BytesIO
from PIL import Image
from colorthief import ColorThief

def normalize_palette(palette, method="gamma", gamma=0.8, new_min=50, new_max=255):
    """
    Normalize the brightness of the palette using Gamma Correction or Contrast Stretching.
    """
    normalized_palette = []
    if method == "gamma":
        for color in palette:
            normalized_color = [
                int(255 * (channel / 255) ** gamma) for channel in color
            ]
            normalized_palette.append(normalized_color)
    elif method == "contrast":
        min_val = min(min(color) for color in palette)
        max_val = max(max(color) for color in palette)
        for color in palette:
            normalized_color = [
                int((channel - min_val) / (max_val - min_val) * (new_max - new_min) + new_min)
                for channel in color
            ]
            normalized_palette.append(normalized_color)
    return normalized_palette

def extract_color_palette(base64_image, normalization_method="gamma"):
    try:
        # Decode the base64 image
        image_data = base64.b64decode(base64_image.split(",")[1])  # Split off the data type prefix
        with BytesIO(image_data) as image_file:
            # Open the image and resize for efficient processing
            with Image.open(image_file) as image:
                image = image.convert("RGB")  # Ensure the image is in RGB mode
                image.thumbnail((200, 200))  # Resize to reduce memory usage

                # Save the resized image to an in-memory file-like object
                with BytesIO() as resized_image_file:
                    image.save(resized_image_file, format="JPEG")
                    resized_image_file.seek(0)  # Reset file pointer for ColorThief

                    # Extract color palette
                    color_thief = ColorThief(resized_image_file)
                    palette = color_thief.get_palette(color_count=6)  # Extract top 6 colors

        # Normalize the palette
        normalized_palette = normalize_palette(palette, method=normalization_method)

        # Return normalized palette as JSON
        return json.dumps(normalized_palette)

    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    import sys
    # Read base64 image from stdin
    base64_image = sys.stdin.read()
    # Normalize the palette using gamma correction (default method)
    result = extract_color_palette(base64_image, normalization_method="gamma")
    print(result)  # Send result back to node_helper
