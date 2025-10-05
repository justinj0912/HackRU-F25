#!/usr/bin/env python3
"""
Windows Setup and Test Script for Manim
This script helps verify that all dependencies are properly installed on Windows.
"""

import os
import sys
import subprocess
import platform

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    print("✅ Python version is compatible")
    return True

def check_ffmpeg():
    """Check if FFmpeg is installed and accessible"""
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"], 
            capture_output=True, 
            text=True, 
            timeout=10
        )
        if result.returncode == 0:
            print("✅ FFmpeg is installed and accessible")
            return True
        else:
            print("❌ FFmpeg command failed")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.CalledProcessError):
        print("❌ FFmpeg not found in PATH")
        print("   Install FFmpeg:")
        print("   1. Download from https://ffmpeg.org/download.html")
        print("   2. Add FFmpeg to your PATH environment variable")
        print("   3. Or use Chocolatey: choco install ffmpeg")
        return False

def check_manim():
    """Check if Manim is installed"""
    try:
        result = subprocess.run(
            ["manim", "--version"], 
            capture_output=True, 
            text=True, 
            timeout=10
        )
        if result.returncode == 0:
            print("✅ Manim is installed")
            print(f"   Version: {result.stdout.strip()}")
            return True
        else:
            print("❌ Manim command failed")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.CalledProcessError):
        print("❌ Manim not found")
        print("   Install Manim: pip install manim")
        return False

def check_latex():
    """Check if LaTeX is available (optional but recommended)"""
    try:
        # Try to find common LaTeX installations on Windows
        latex_commands = ["pdflatex", "xelatex", "lualatex"]
        for cmd in latex_commands:
            try:
                result = subprocess.run(
                    [cmd, "--version"], 
                    capture_output=True, 
                    text=True, 
                    timeout=10
                )
                if result.returncode == 0:
                    print(f"✅ LaTeX found: {cmd}")
                    return True
            except:
                continue
        
        print("⚠️  LaTeX not found (optional but recommended)")
        print("   Install MiKTeX: https://miktex.org/download")
        return False
    except:
        print("⚠️  Could not check LaTeX installation")
        return False

def test_manim_render():
    """Test actual Manim rendering"""
    try:
        from manim_renderer import ManimRenderer
        renderer = ManimRenderer()
        
        test_code = '''
from manim import *

class TestScene(Scene):
    def construct(self):
        text = Text("Windows Test")
        self.play(Write(text))
        self.wait(1)
'''
        
        print("🧪 Testing Manim rendering...")
        result = renderer.render_animation(test_code, 'TestScene')
        print(f"✅ Manim rendering successful: {result}")
        return True
        
    except Exception as e:
        print(f"❌ Manim rendering failed: {e}")
        return False

def main():
    """Main setup check function"""
    print("🔍 Windows Setup Check for Cognify Manim Support")
    print("=" * 50)
    
    # Check system
    print(f"Platform: {platform.system()} {platform.release()}")
    print(f"Architecture: {platform.architecture()[0]}")
    print()
    
    # Run all checks
    checks = [
        ("Python Version", check_python_version),
        ("FFmpeg", check_ffmpeg),
        ("Manim", check_manim),
        ("LaTeX", check_latex),
        ("Manim Render Test", test_manim_render),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"Checking {name}...")
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ Error checking {name}: {e}")
            results.append((name, False))
        print()
    
    # Summary
    print("📋 Setup Summary:")
    print("=" * 30)
    passed = 0
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name}: {status}")
        if result:
            passed += 1
    
    print()
    if passed == len(results):
        print("🎉 All checks passed! Manim should work on Windows.")
    else:
        print(f"⚠️  {len(results) - passed} checks failed. Please address the issues above.")
        print("\nCommon Windows solutions:")
        print("1. Install FFmpeg and add to PATH")
        print("2. Install LaTeX (MiKTeX recommended)")
        print("3. Run as administrator if permission issues")
        print("4. Check antivirus settings")
        print("5. Ensure Python 3.8+ is installed")

if __name__ == "__main__":
    main()
