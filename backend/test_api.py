#!/usr/bin/env python3
"""
Test script for the AI Tutor Backend API
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_generate_code():
    """Test code generation endpoint"""
    print("Testing code generation...")
    payload = {
        "question": "Explain the Pythagorean theorem",
        "subject": "mathematics",
        "difficulty": "beginner"
    }
    
    response = requests.post(f"{BASE_URL}/generate-code", json=payload)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Generated code length: {len(data['code'])} characters")
        print(f"Narration: {data['narration'][:100]}...")
        print(f"Estimated duration: {data['estimated_duration']} seconds")
    else:
        print(f"Error: {response.text}")
    print()

def test_render_video():
    """Test video rendering endpoint"""
    print("Testing video rendering...")
    payload = {
        "question": "Explain what a derivative is in calculus",
        "subject": "mathematics"
    }
    
    print("Sending request...")
    start_time = time.time()
    
    response = requests.post(f"{BASE_URL}/render-video", json=payload)
    
    end_time = time.time()
    print(f"Request completed in {end_time - start_time:.2f} seconds")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Video URL: {data['video_url']}")
        print(f"Duration: {data['duration']} seconds")
        print(f"File size: {data['file_size']} bytes")
        print(f"Created at: {data['created_at']}")
        
        # Test video access
        video_response = requests.get(f"{BASE_URL}{data['video_url']}")
        print(f"Video access status: {video_response.status_code}")
        
    else:
        print(f"Error: {response.text}")
    print()

def test_validate_code():
    """Test code validation endpoint"""
    print("Testing code validation...")
    
    # Valid code
    valid_code = """
from manim import *

class TestScene(Scene):
    def construct(self):
        text = Text("Hello World")
        self.play(Write(text))
        self.wait()
"""
    
    response = requests.post(f"{BASE_URL}/validate-code", json={"code": valid_code})
    print(f"Valid code test - Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Invalid code
    invalid_code = """
from manim import *

class TestScene(Scene):
    def construct(self):
        text = Text("Hello World"
        self.play(Write(text))
        self.wait()
"""
    
    response = requests.post(f"{BASE_URL}/validate-code", json={"code": invalid_code})
    print(f"Invalid code test - Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

if __name__ == "__main__":
    print("AI Tutor Backend API Test Suite")
    print("=" * 40)
    
    try:
        test_health()
        test_generate_code()
        test_validate_code()
        test_render_video()
        
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API server.")
        print("Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"Error during testing: {e}")
