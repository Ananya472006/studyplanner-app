"""Generate a 256x256 PNG icon for the StudyQuest desktop app."""
from PIL import Image, ImageDraw
import math

size = 256
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Background circle with dark gradient
cx, cy = size // 2, size // 2
r = 120

# Draw outer glow
for i in range(15, 0, -1):
    alpha = int(20 * (15 - i) / 15)
    draw.ellipse(
        [cx - r - i, cy - r - i, cx + r + i, cy + r + i],
        fill=(100, 50, 200, alpha)
    )

# Background circle
draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(15, 12, 27, 255))
draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(80, 50, 160, 200), width=3)

# Shield shape
shield_points = [
    (cx, cy - 80),
    (cx + 65, cy - 50),
    (cx + 65, cy + 15),
    (cx, cy + 70),
    (cx - 65, cy + 15),
    (cx - 65, cy - 50),
]
draw.polygon(shield_points, outline=(192, 132, 252, 230), width=0)
# Fill shield with transparent purple
for i in range(3):
    inner = [(int(cx + (x - cx) * (0.95 - i * 0.02)), int(cy + (y - cy) * (0.95 - i * 0.02))) for x, y in shield_points]
    draw.polygon(inner, fill=(90, 40, 160, 40 + i * 10))

# Lightning bolt
bolt = [
    (cx + 10, cy - 60),
    (cx - 35, cy + 5),
    (cx - 2, cy + 5),
    (cx - 15, cy + 55),
    (cx + 40, cy - 15),
    (cx + 5, cy - 15),
]
draw.polygon(bolt, fill=(251, 191, 36, 255))

# Brighter inner bolt
bolt_inner = [(int(cx + (x - cx) * 0.7), int(cy + (y - cy) * 0.7)) for x, y in bolt]
draw.polygon(bolt_inner, fill=(253, 224, 71, 255))

img.save(r'C:\Users\Dell\.gemini\antigravity\scratch\StudyPlanner\frontend\public\icon.png')
print('Icon saved successfully!')
