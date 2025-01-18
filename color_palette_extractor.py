import base64
import json
from io import BytesIO
from PIL import Image
from colorthief import ColorThief

def extract_color_palette(base64_image):
    try:
        # Decode the base64 image
        image_data = base64.b64decode(base64_image.split(",")[1])  # Split off the data type prefix
        image_file = BytesIO(image_data)
        
        # Open the image and resize for efficient processing
        with Image.open(image_file) as image:
            image = image.convert("RGB")  # Ensure the image is in RGB mode
            image.thumbnail((200, 200))  # Resize to reduce memory usage

            # Save the resized image to an in-memory file-like object
            resized_image_file = BytesIO()
            image.save(resized_image_file, format="JPEG")
            resized_image_file.seek(0)  # Reset file pointer for ColorThief

        # Extract color palette
        color_thief = ColorThief(resized_image_file)
        palette = color_thief.get_palette(color_count=6)  # Extract top 6 colors

        # Return palette as JSON
        return json.dumps(palette)

    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    import sys
    # Read base64 image from stdin
    base64_image = sys.stdin.read()
    result = extract_color_palette(base64_image)
    print(result)  # Send result back to node_helper
