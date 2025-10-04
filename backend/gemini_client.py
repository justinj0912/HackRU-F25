import google.generativeai as genai
from typing import Optional
import json
import re
from config import GEMINI_API_KEY
from models import ManimCodeResponse, MindMapNode

class GeminiClient:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
    def generate_manim_code(self, question: str, subject: Optional[str] = None) -> ManimCodeResponse:
        """
        Generate Manim code and narration from a user question using Gemini API
        """
        prompt = self._build_prompt(question, subject)
        
        try:
            response = self.model.generate_content(prompt)
            return self._parse_response(response.text)
        except Exception as e:
            raise Exception(f"Failed to generate Manim code: {str(e)}")
    
    def _build_prompt(self, question: str, subject: Optional[str] = None) -> str:
        subject_context = f" in the subject of {subject}" if subject else ""
        
        return f"""
You are an expert educational content creator who generates Manim animations for mathematical and scientific concepts.

User Question: "{question}"

Please create a Manim animation that explains this concept{subject_context}. 

        Requirements:
        1. Generate clean, well-commented Manim code using ManimCE v0.18+ syntax
        2. Use appropriate colors, animations, and visual elements
        3. Break complex concepts into clear, step-by-step animations
        4. Provide narration text that explains what's happening
        5. Use simple animations - avoid complex mathematical notation unless necessary
        6. ALWAYS use Text() instead of Tex() for ALL text to avoid LaTeX dependencies
        7. Keep animations short (under 30 seconds)
        8. Avoid axis labels and mathematical notation that requires LaTeX
        9. Use simple shapes, colors, and basic animations only
        10. For complex topics, focus on the main concept and use simple visual metaphors
        11. Keep text short and simple - avoid long explanations in the animation

Output format (JSON):
{{
    "code": "```python\\nfrom manim import *\\n\\nclass Explanation(Scene):\\n    def construct(self):\\n        # Your Manim code here\\n```",
    "narration": "Clear explanation text that will be converted to speech",
    "estimated_duration": 30,
    "scenes": [
        {{
            "scene_id": "intro",
            "start_time": 0,
            "end_time": 5,
            "description": "Introduction to the concept",
            "manim_scene_name": "Introduction"
        }}
    ]
}}

        Important guidelines:
        - Use ManimCE v0.18+ syntax (not the old Manim syntax)
        - ALWAYS use Text() for ALL text, NEVER use Tex() or MathTex()
        - Keep animations smooth and educational
        - Use ONLY these basic shapes: Circle(), Square(), Line(), Dot(), Arrow()
        - NEVER use Polygon(), RegularPolygon(), or any complex shapes
        - Include clear visual hierarchy
        - Make sure the code is syntactically correct
        - Keep narration concise but comprehensive
        - Estimate duration realistically (typically 10-30 seconds)
        - Avoid complex mathematical notation, axis labels, or LaTeX
        - Focus on visual concepts using circles, squares, lines, and basic shapes
        - Use simple animations like Create(), Write(), Transform(), FadeOut()
        - DO NOT use ParametricFunction, Axes, Polygon, RegularPolygon, or complex mathematical objects
        - Keep it simple and visual - explain concepts with basic shapes
        - For complex topics, break them into simple visual steps
        - Use short, simple text labels (max 3-4 words)
        - Focus on one main concept per animation
        - Use colors to distinguish different elements
        - Avoid complex transformations and multiple simultaneous animations
        - Keep each animation step simple and clear
        - Use basic positioning with shift() and move_to()
        - Test your code mentally before generating it
"""

    def _parse_response(self, response_text: str) -> ManimCodeResponse:
        """Parse Gemini response and extract Manim code and narration"""
        try:
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                data = json.loads(json_str)
                
                # Extract code from markdown code block
                code = data.get('code', '')
                if '```python' in code:
                    code = code.split('```python')[1].split('```')[0].strip()
                elif '```' in code:
                    code = code.split('```')[1].split('```')[0].strip()
                
                return ManimCodeResponse(
                    code=code,
                    narration=data.get('narration', ''),
                    estimated_duration=data.get('estimated_duration', 30)
                )
            else:
                # Fallback: treat entire response as code
                return ManimCodeResponse(
                    code=response_text,
                    narration="Generated explanation",
                    estimated_duration=30
                )
                
        except (json.JSONDecodeError, KeyError) as e:
            # Fallback parsing
            return ManimCodeResponse(
                code=response_text,
                narration="Generated explanation",
                estimated_duration=30
            )

    def generate_tutor_response(self, question: str, subject: Optional[str] = None) -> dict:
        """
        Generate AI tutor response with friendly, simple explanations
        """
        prompt = f"""
You are a friendly, patient AI tutor. Your goal is to make complex concepts simple and easy to understand.

User Message: "{question}"

Please respond to what the user is saying. If they're greeting you, greet them back warmly. If they're asking a question, explain it simply. If they're making a statement, acknowledge it and ask a follow-up question.

Guidelines:
1. Always respond directly to what the user said
2. Use simple language and short sentences
3. Use analogies and real-world examples when explaining concepts
4. Break down complex ideas into smaller, digestible parts
5. Be encouraging and supportive
6. Ask follow-up questions to check understanding
7. Keep explanations concise but comprehensive
8. If it's a greeting, be warm and ask what they'd like to learn about
9. If it's a question, provide a clear, simple explanation

Format your response as a friendly, conversational reply that directly addresses what the user said.
"""
        
        try:
            response = self.model.generate_content(prompt)
            return {
                "explanation": response.text,
                "subject": subject
            }
        except Exception as e:
            raise Exception(f"Failed to generate tutor response: {e}")

    def generate_tutor_response_stream(self, question: str, subject: str = None):
        """
        Generate streaming tutor response
        """
        prompt = f"""
You are a friendly, patient AI tutor. Your goal is to make complex concepts simple and easy to understand.

User Message: "{question}"

Please respond to what the user is saying. If they're greeting you, greet them back warmly. If they're asking a question, explain it simply. If they're making a statement, acknowledge it and ask a follow-up question.

Guidelines:
1. Always respond directly to what the user said
2. Use simple language and short sentences
3. Use analogies and real-world examples when explaining concepts
4. Break down complex ideas into smaller, digestible parts
5. Be encouraging and supportive
6. Ask follow-up questions to check understanding
7. Keep explanations concise but comprehensive
8. If it's a greeting, be warm and ask what they'd like to learn about
9. If it's a question, provide a clear, simple explanation

Format your response as a friendly, conversational reply that directly addresses what the user said.
"""
        
        try:
            response = self.model.generate_content(prompt, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            yield f"Error: {str(e)}"

    def analyze_image(self, image_data: str, question: str = None) -> dict:
        """
        Analyze an image (equation, diagram, etc.) and provide explanation
        """
        try:
            # Remove data URL prefix if present
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            import base64
            image_bytes = base64.b64decode(image_data)
            
            # Create the prompt for image analysis
            prompt = f"""
            You are an expert tutor. Analyze this image and provide a helpful explanation.
            
            If this is a mathematical equation or other scientific problem:
            1. Identify the equation or problem
            2. Explain what it represents
            3. If it's solvable, provide the solution step by step
            4. Explain the concepts involved
            
            If this is a diagram or graph:
            1. Describe what the diagram shows
            2. Explain the key elements and relationships
            3. Provide educational context
            
            Be clear, educational, and helpful. Use simple language when possible.
            """
            
            if question:
                prompt += f"\n\nUser's specific question: {question}"
            
            # Generate content with image
            response = self.model.generate_content([
                prompt,
                {
                    "mime_type": "image/png",
                    "data": image_bytes
                }
            ])
            
            return {
                "analysis": response.text,
                "equation": None,  # Could be extracted if needed
                "solution": None,  # Could be extracted if needed
                "explanation": response.text
            }
            
        except Exception as e:
            raise Exception(f"Failed to analyze image: {e}")

    def generate_manim_code_from_image(self, image_data: str, question: str = None) -> str:
        """
        Generate Manim code based on an image (equation, diagram, etc.)
        """
        try:
            # Remove data URL prefix if present
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]

            import base64
            image_bytes = base64.b64decode(image_data)

            # Create the prompt for Manim code generation from image
            prompt = f"""
            You are an expert at creating educational animations with ManimCE v0.18+. 
            Analyze this image and create a Manim animation that explains the concept visually.

            IMPORTANT MANIM RULES:
            1. ALWAYS use ManimCE v0.18+ syntax
            2. ALWAYS use Text() instead of Tex() or MathTex() to avoid LaTeX dependencies
            3. NEVER use ParametricFunction, Axes, Polygon, RegularPolygon, or complex mathematical objects
            4. Use only basic shapes: Circle(), Square(), Line(), Dot(), Arrow()
            5. Keep animations simple and educational
            6. Use short text labels (max 3-4 words)
            7. Focus on ONE main concept per animation
            8. Make animations 3-5 seconds long
            9. Use simple colors and clear movements

            Based on the image, create a Manim animation that:
            1. Explains the concept step by step
            2. Uses simple visual elements
            3. Is educational and easy to understand
            4. Breaks down complex ideas into simple visual steps

            CRITICAL: Return ONLY the raw Python code without any markdown formatting, code blocks, or explanations. 
            Start with "from manim import *" and end with the scene class definition.
            Do not include ```python or ``` markers.
            """

            if question:
                prompt += f"\n\nUser's specific request: {question}"

            # Generate content with image
            response = self.model.generate_content([
                prompt,
                {
                    "mime_type": "image/png",
                    "data": image_bytes
                }
            ])

            # Clean up the response to remove any markdown formatting
            code = response.text.strip()
            
            # Remove markdown code blocks if present
            if code.startswith('```python'):
                code = code[9:]  # Remove ```python
            elif code.startswith('```'):
                code = code[3:]   # Remove ```
            
            if code.endswith('```'):
                code = code[:-3]  # Remove trailing ```
            
            return code.strip()

        except Exception as e:
            raise Exception(f"Failed to generate Manim code from image: {e}")

    def generate_manim_code_with_narration_from_image(self, image_data: str, question: str = None) -> tuple[str, str]:
        """
        Generate Manim code and narration script from an image
        """
        try:
            # Remove data URL prefix if present
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            import base64
            image_bytes = base64.b64decode(image_data)
            
            prompt = f"""
            Create a ManimCE v0.18+ animation explaining the concept shown in this image.

            RULES:
            - Use Text() only, no Tex() or MathTex()
            - Basic shapes only: Circle(), Square(), Line(), Dot(), Arrow()
            - 5-8 seconds duration for complex equations, 3-5 seconds for simple topics
            - Simple, educational
            - For equations: Show complete step-by-step solution
            - CRITICAL: Always wrap objects in animations like Create(), Write(), or DrawBorderThenFill()
            - NEVER put raw objects like Arrow() directly in AnimationGroup()
            - Use self.play(Create(arrow)) not self.play(arrow)
            - Use only standard Manim colors: RED, GREEN, BLUE, YELLOW, WHITE, BLACK, GRAY, ORANGE, PURPLE, PINK
            - NEVER use undefined colors like DARK_GREEN, LIGHT_BLUE, etc.

            Return format:
            MANIM_CODE:
            [Python code]

            NARRATION:
            [Short script, max 50 words]
            """

            if question:
                prompt += f"\n\nUser's specific request: {question}"

            # Generate content with image
            response = self.model.generate_content([
                prompt,
                {
                    "mime_type": "image/png",
                    "data": image_bytes
                }
            ])

            text = response.text

            # Parse the response
            if "MANIM_CODE:" in text and "NARRATION:" in text:
                parts = text.split("NARRATION:")
                manim_code = parts[0].replace("MANIM_CODE:", "").strip()
                narration = parts[1].strip()
                
                # Clean up the Manim code
                if manim_code.startswith('```python'):
                    manim_code = manim_code[9:]
                elif manim_code.startswith('```'):
                    manim_code = manim_code[3:]
                
                if manim_code.endswith('```'):
                    manim_code = manim_code[:-3]
                
                return manim_code.strip(), narration.strip()
            else:
                raise Exception("Invalid response format from Gemini")

        except Exception as e:
            raise Exception(f"Failed to generate Manim code with narration from image: {e}")

    def generate_manim_code_with_narration(self, topic: str) -> tuple[str, str]:
        """
        Generate Manim code and narration script for a topic
        """
        try:
            prompt = f"""
            Create a ManimCE v0.18+ animation explaining "{topic}".

            RULES:
            - Use Text() only, no Tex() or MathTex()
            - Basic shapes only: Circle(), Square(), Line(), Dot(), Arrow()
            - 5-8 seconds duration for complex equations, 3-5 seconds for simple topics
            - Simple, educational
            - For equations: Show complete step-by-step solution
            - CRITICAL: Always wrap objects in animations like Create(), Write(), or DrawBorderThenFill()
            - NEVER put raw objects like Arrow() directly in AnimationGroup()
            - Use self.play(Create(arrow)) not self.play(arrow)
            - Use only standard Manim colors: RED, GREEN, BLUE, YELLOW, WHITE, BLACK, GRAY, ORANGE, PURPLE, PINK
            - NEVER use undefined colors like DARK_GREEN, LIGHT_BLUE, etc.

            Return format:
            MANIM_CODE:
            [Python code]

            NARRATION:
            [Short script, max 50 words]
            """

            response = self.model.generate_content(prompt)
            text = response.text

            # Parse the response
            if "MANIM_CODE:" in text and "NARRATION:" in text:
                parts = text.split("NARRATION:")
                manim_code = parts[0].replace("MANIM_CODE:", "").strip()
                narration = parts[1].strip()
                
                # Clean up the Manim code
                if manim_code.startswith('```python'):
                    manim_code = manim_code[9:]
                elif manim_code.startswith('```'):
                    manim_code = manim_code[3:]
                
                if manim_code.endswith('```'):
                    manim_code = manim_code[:-3]
                
                return manim_code.strip(), narration.strip()
            else:
                raise Exception("Invalid response format from Gemini")

        except Exception as e:
            raise Exception(f"Failed to generate Manim code with narration: {e}")

    def generate_mind_map(self, topic: str, depth: int = 3, max_branches: int = 5) -> list[MindMapNode]:
        """
        Generate a mind map structure for a given topic using Gemini API
        """
        prompt = self._build_mind_map_prompt(topic, depth, max_branches)
        
        try:
            response = self.model.generate_content(prompt)
            return self._parse_mind_map_response(response.text, topic)
        except Exception as e:
            raise Exception(f"Failed to generate mind map: {str(e)}")

    def _build_mind_map_prompt(self, topic: str, depth: int, max_branches: int) -> str:
        return f"""
You are an expert educational content creator who generates mind maps with a main topic and floating suggestions.

Create a mind map for the topic: "{topic}"

Requirements:
1. Create ONE main topic node that introduces and explains the core concept
2. Create 4-6 floating suggestion nodes that suggest how to expand the topic
3. Each node should have a clear, concise title and detailed explanation
4. Focus on educational value and logical connections
5. Suggestions should be specific, actionable ways to explore the topic further

Return the response as a JSON array with the following structure:
[
  {{
    "id": "main_topic",
    "title": "{topic}",
    "content": "Comprehensive introduction and explanation of {topic}. This should be detailed and educational, covering the key aspects, importance, and basic understanding of the concept.",
    "level": 0,
    "parent_id": null,
    "children": [],
    "is_main_topic": true,
    "is_suggestion": false
  }},
  {{
    "id": "suggestion_1",
    "title": "Suggestion Title",
    "content": "Detailed suggestion for how to expand or explore this aspect of {topic}. This should be specific and actionable.",
    "level": 0,
    "parent_id": null,
    "children": [],
    "is_main_topic": false,
    "is_suggestion": true
  }},
  {{
    "id": "suggestion_2",
    "title": "Another Suggestion",
    "content": "Another detailed suggestion for exploring {topic}.",
    "level": 0,
    "parent_id": null,
    "children": [],
    "is_main_topic": false,
    "is_suggestion": true
  }},
  {{
    "id": "suggestion_3",
    "title": "Third Suggestion",
    "content": "A third suggestion for expanding knowledge of {topic}.",
    "level": 0,
    "parent_id": null,
    "children": [],
    "is_main_topic": false,
    "is_suggestion": true
  }},
  {{
    "id": "suggestion_4",
    "title": "Fourth Suggestion",
    "content": "A fourth suggestion for exploring {topic}.",
    "level": 0,
    "parent_id": null,
    "children": [],
    "is_main_topic": false,
    "is_suggestion": true
  }}
]

IMPORTANT: Return exactly this structure with the main topic and 4 suggestions. Do not create additional nodes or change the structure.
The main topic should be comprehensive and educational.
Suggestions should be floating nodes that users can accept or reject.
Focus on creating a learning structure that helps users explore "{topic}" systematically.
"""

    def _parse_mind_map_response(self, response_text: str, topic: str) -> list[MindMapNode]:
        try:
            # Clean the response text
            cleaned_text = response_text.strip()
            
            # Remove markdown code blocks if present
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            
            # Parse JSON
            nodes_data = json.loads(cleaned_text)
            
            # Convert to MindMapNode objects and add positioning
            nodes = []
            for i, node_data in enumerate(nodes_data):
                # Calculate position based on level and index
                x, y = self._calculate_node_position(node_data, i, nodes_data)
                
                node = MindMapNode(
                    id=node_data['id'],
                    title=node_data['title'],
                    content=node_data['content'],
                    x=x,
                    y=y,
                    level=node_data['level'],
                    parent_id=node_data.get('parent_id'),
                    children=node_data.get('children', [])
                )
                nodes.append(node)
            
            return nodes
            
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse mind map JSON: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to process mind map response: {str(e)}")

    def _calculate_node_position(self, node_data: dict, index: int, all_nodes: list) -> tuple[float, float]:
        """Calculate x, y position for a node based on its type and relationships"""
        is_main_topic = node_data.get('is_main_topic', False)
        is_suggestion = node_data.get('is_suggestion', False)
        
        if is_main_topic:
            # Main topic goes in the center
            return (400.0, 300.0)
        
        if is_suggestion:
            # Suggestions positioned in a clean grid around the main topic
            center_x, center_y = 400.0, 300.0
            suggestion_index = index - 1  # Subtract 1 because main topic is index 0
            
            # Position suggestions in a 2x2 grid around the main topic
            if suggestion_index == 0:
                x, y = center_x - 300, center_y - 150  # Top left
            elif suggestion_index == 1:
                x, y = center_x + 50, center_y - 150   # Top right
            elif suggestion_index == 2:
                x, y = center_x - 300, center_y + 50   # Bottom left
            else:
                x, y = center_x + 50, center_y + 50    # Bottom right
            
            return (x, y)
        
        # Regular child nodes
        parent_id = node_data.get('parent_id')
        if parent_id:
            # Find parent and position relative to it
            parent_node = None
            for n in all_nodes:
                if n['id'] == parent_id:
                    parent_node = n
                    break
            
            if parent_node:
                # Position children to the right of parent
                siblings = [n for n in all_nodes if n.get('parent_id') == parent_id]
                sibling_index = siblings.index(node_data)
                x = 400.0 + 300 + (sibling_index * 50)
                y = 300.0 + (sibling_index * 100) - 100
                return (x, y)
        
        # Default position
        return (200.0 + index * 200, 200.0 + index * 150)
