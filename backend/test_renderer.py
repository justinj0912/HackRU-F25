#!/usr/bin/env python3
"""
Test the Manim renderer directly
"""

from manim_renderer import ManimRenderer

# Simple Manim code
simple_code = """
from manim import *

class SimpleCircle(Scene):
    def construct(self):
        circle = Circle(radius=1, color=BLUE)
        self.play(Create(circle))
        self.wait(1)
        text = Text("Hello!", font_size=48)
        text.next_to(circle, DOWN)
        self.play(Write(text))
        self.wait(1)
"""

def test_renderer():
    renderer = ManimRenderer()
    
    try:
        print("Testing Manim renderer...")
        video_path, duration, file_size = renderer.render_animation(
            manim_code=simple_code,
            scene_name="SimpleCircle"
        )
        
        print(f"✅ Video rendered successfully!")
        print(f"📁 Path: {video_path}")
        print(f"⏱️  Duration: {duration} seconds")
        print(f"📊 File size: {file_size} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_renderer()

