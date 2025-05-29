from PIL import Image
import os

def create_favicon():
    # Open the original image
    img = Image.open('Updated RES Logos-06 copy.png')
    
    # Create a square image by cropping to the center
    width, height = img.size
    size = min(width, height)
    left = (width - size) // 2
    top = (height - size) // 2
    right = left + size
    bottom = top + size
    img = img.crop((left, top, right, bottom))
    
    # Resize to favicon sizes
    sizes = [16, 32, 48, 64, 128]
    favicon = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    
    # Resize and paste the image
    resized = img.resize((64, 64), Image.Resampling.LANCZOS)
    favicon.paste(resized, (0, 0))
    
    # Save as ICO file
    favicon.save('favicon.ico', format='ICO', sizes=[(size, size) for size in sizes])

if __name__ == '__main__':
    create_favicon() 