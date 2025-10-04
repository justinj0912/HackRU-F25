#!/usr/bin/env python3
"""
Simple test to verify Manim is working correctly
"""

from manim import *

class SimpleTest(Scene):
    def construct(self):
        # Create a simple circle
        circle = Circle(radius=1, color=BLUE)
        
        # Show the circle
        self.play(Create(circle))
        self.wait(1)
        
        # Add some text
        text = Text("Hello Manim!", font_size=48)
        text.next_to(circle, DOWN)
        self.play(Write(text))
        self.wait(2)

if __name__ == "__main__":
    # Test if we can import and create the scene
    try:
        scene = SimpleTest()
        print("✅ Manim scene created successfully")
        print("✅ All imports working")
    except Exception as e:
        print(f"❌ Error creating scene: {e}")

