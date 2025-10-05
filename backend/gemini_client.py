import google.generativeai as genai
from typing import Optional
import json
import re
import math
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
        Generate AI tutor response with clear, organized bullet points
        """
        prompt = f"""
You are a knowledgeable, patient AI tutor. Your goal is to provide clear, organized explanations that help students understand concepts efficiently.

User Message: "{question}"

Please provide a well-structured response using proper markdown formatting with bullet points and clear organization.

Guidelines:
1. Always respond directly to what the user said
2. Use clear, accessible language
3. Use markdown formatting for structure:
   - Use `-` for bullet points
   - Use `**bold**` for emphasis on key terms
   - Use `*italic*` for important concepts
   - Use `##` for section headers when needed
4. Organize information into logical bullet points
5. Keep each bullet point concise but informative
6. Use sub-bullets (indented with spaces) when breaking down complex ideas
7. Include key examples and analogies where helpful
8. Be encouraging and supportive
9. If it's a greeting, be warm and ask what they'd like to learn about
10. If it's a question, provide a clear, organized explanation
11. Keep the overall response focused and digestible

IMPORTANT: Format your response using proper markdown syntax. Use `-` for bullet points, `**text**` for bold, and proper indentation for sub-bullets.
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
        Generate streaming tutor response with clear, organized bullet points
        """
        prompt = f"""
You are a knowledgeable, patient AI tutor. Your goal is to provide clear, organized explanations that help students understand concepts efficiently.

User Message: "{question}"

Please provide a well-structured response using proper markdown formatting with bullet points and clear organization.

Guidelines:
1. Always respond directly to what the user said
2. Use clear, accessible language
3. Use markdown formatting for structure:
   - Use `-` for bullet points
   - Use `**bold**` for emphasis on key terms
   - Use `*italic*` for important concepts
   - Use `##` for section headers when needed
4. Organize information into logical bullet points
5. Keep each bullet point concise but informative
6. Use sub-bullets (indented with spaces) when breaking down complex ideas
7. Include key examples and analogies where helpful
8. Be encouraging and supportive
9. If it's a greeting, be warm and ask what they'd like to learn about
10. If it's a question, provide a clear, organized explanation
11. Keep the overall response focused and digestible

IMPORTANT: Format your response using proper markdown syntax. Use `-` for bullet points, `**text**` for bold, and proper indentation for sub-bullets.
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
            # Add padding if needed
            missing_padding = len(image_data) % 4
            if missing_padding:
                image_data += '=' * (4 - missing_padding)
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
        """Generate Manim code and narration from an image"""
        import base64
        
        try:
            # Decode image
            image_bytes = base64.b64decode(image_data)
            
            # Simple prompt for reliable code generation
            prompt = f"""Create a ManimCE v0.18+ animation explaining this image.

RULES:
- Use Text() only, no Tex() or MathTex()
- Basic shapes only: Circle(), Square(), Line(), Dot(), Arrow()
- 5-12 seconds in total for all topics and animations 
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
[Minimum 20 words, max 50 words], Avoid meta phrases like "this educational animation demonstrates key concepts and principles shown in the image, providing a clear explanation that helps viewers understand the underlying ideas and their practical applications."""

            if question:
                prompt += f"\n\nUser request: {question}"

            # Generate content
            response = self.model.generate_content([prompt, {"mime_type": "image/png", "data": image_bytes}])
            text = response.text

            # Extract code block and narration
            if '```python' in text:
                start = text.find('```python') + 9
                end = text.find('```', start)
                if end != -1:
                    manim_code = text[start:end].strip()
                    
                    # Extract narration from response
                    narration = "This educational animation demonstrates key concepts and principles shown in the image, providing a clear explanation that helps viewers understand the underlying ideas and their practical applications."
                    if "NARRATION:" in text:
                        narration_part = text.split("NARRATION:")[1].strip()
                        if narration_part:
                            narration = narration_part.split('\n')[0].strip()
                    
                    print(f"Generated narration: '{narration}'")
                    return manim_code, narration
            
            raise Exception("No valid code block found")

        except Exception as e:
            raise Exception(f"Code generation failed: {e}")

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
                
                # Clean up the Manim code - extract only the code block
                if '```python' in manim_code:
                    start = manim_code.find('```python') + 9
                    end = manim_code.find('```', start)
                    if end != -1:
                        manim_code = manim_code[start:end].strip()
                elif '```' in manim_code:
                    start = manim_code.find('```') + 3
                    end = manim_code.find('```', start)
                    if end != -1:
                        manim_code = manim_code[start:end].strip()
                
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
You are an expert educational content creator who generates a main topic node with 2-3 related suggestion titles for a flowchart-style mind map.

Create a main topic node for: "{topic}" with 2-3 related suggestion titles.

Requirements:
1. Create ONE main topic node that provides a comprehensive introduction and explanation
2. Create 2-3 suggestion titles that are related subtopics or aspects of the main topic
3. The main topic content should be detailed, educational, and cover the key aspects
4. Keep the main topic summary concise - aim for 35 words maximum
5. Suggestions should be just titles (no content) that users can click to explore further

Return the response as a JSON array with exactly this structure:
[
  {{
    "id": "main_topic",
    "title": "{topic}",
    "content": "Concise introduction to {topic}. Explain what it is, why it's important, and its main characteristics or applications. Keep it educational but brief - maximum 35 words.",
    "level": 0,
    "parent_id": null,
    "children": [],
    "is_main_topic": true,
    "is_suggestion": false
  }},
  {{
    "id": "suggestion_1",
    "title": "Related Topic 1",
    "content": "",
    "level": 0,
    "parent_id": "main_topic",
    "children": [],
    "is_main_topic": false,
    "is_suggestion": true
  }},
  {{
    "id": "suggestion_2", 
    "title": "Related Topic 2",
    "content": "",
    "level": 0,
    "parent_id": "main_topic",
    "children": [],
    "is_main_topic": false,
    "is_suggestion": true
  }},
  {{
    "id": "suggestion_3",
    "title": "Related Topic 3", 
    "content": "",
    "level": 0,
    "parent_id": "main_topic",
    "children": [],
    "is_main_topic": false,
    "is_suggestion": true
  }}
]

IMPORTANT: Return exactly this structure with the main topic and 2-3 suggestions.
Suggestions should be just titles (empty content) that are related but distinct aspects of the main topic.
Only the main topic should have content - suggestions are just clickable titles.
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
            # Main topic goes in the center of the canvas
            return (400.0, 300.0)
        
        if is_suggestion:
            # Suggestions positioned around their parent node
            parent_id = node_data.get('parent_id')
            if parent_id:
                # Find parent node to position relative to it
                parent_node = None
                for n in all_nodes:
                    if n['id'] == parent_id:
                        parent_node = n
                        break
                
                if parent_node:
                    # Position suggestions in a small circle around the parent
                    parent_x, parent_y = 400.0, 300.0  # Default center, will be overridden by parent position
                    if parent_node.get('is_main_topic'):
                        parent_x, parent_y = 400.0, 300.0  # Main topic is at center
                    
                    # Get all suggestions for this parent
                    siblings = [n for n in all_nodes if n.get('parent_id') == parent_id and n.get('is_suggestion')]
                    suggestion_index = siblings.index(node_data)
                    
                    # Position in a small circle around parent (closer than before)
                    radius = 180  # Smaller radius for suggestion titles
                    angle_step = (2 * math.pi) / len(siblings)  # Distribute evenly
                    angle = suggestion_index * angle_step
                    
                    x = parent_x + radius * math.cos(angle)
                    y = parent_y + radius * math.sin(angle)
                    
                    return (x, y)
            
            # Fallback positioning
            return (200.0 + index * 150, 200.0 + index * 100)
        
        # Regular child nodes - position to the right of parent
        parent_id = node_data.get('parent_id')
        if parent_id:
            # Find parent and position relative to it
            parent_node = None
            for n in all_nodes:
                if n['id'] == parent_id:
                    parent_node = n
                    break
            
            if parent_node:
                # Position children to the right of parent in a vertical stack
                siblings = [n for n in all_nodes if n.get('parent_id') == parent_id]
                sibling_index = siblings.index(node_data)
                x = 400.0 + 320  # Fixed distance to the right (accounting for wider nodes)
                y = 300.0 + (sibling_index * 150) - (len(siblings) - 1) * 75  # Center vertically
                return (x, y)
        
        # Default position
        return (200.0 + index * 200, 200.0 + index * 150)

    def generate_subtopics(self, topic: str) -> list[str]:
        """
        Generate 3 directly related examples, processes, or specific concepts for a given topic
        """
        prompt = f"""You are an educational assistant helping to create a concept map for the topic "{topic}". 

TASK: Suggest exactly 3 directly related examples, processes, or specific concepts that illustrate or are part of "{topic}". Each suggestion must be a real example or clearly related idea, not a generic label. Keep each example under 5 words. 

Return ONLY a valid JSON array of strings.

Example: ["Glucose", "Chlorophyll", "Light Energy"]"""
        
        try:
            response = self.model.generate_content(prompt)
            # Parse JSON response
            import json
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]  # Remove ```json
            if response_text.startswith('```'):
                response_text = response_text[3:]   # Remove ```
            if response_text.endswith('```'):
                response_text = response_text[:-3]  # Remove trailing ```
            
            subtopics = json.loads(response_text.strip())
            return subtopics[:3]  # Ensure max 3 subtopics
        except Exception as e:
            # Fallback to basic subtopics
            return [f"{topic} Basics", f"{topic} Applications", f"{topic} Examples"]

    def generate_summary(self, title: str) -> str:
        """
        Generate a 2-3 sentence summary for a given title
        """
        prompt = f"""
You are an expert educational content creator. Generate a concise 2-3 sentence summary for the topic: "{title}"

Requirements:
1. Write exactly 2-3 sentences
2. Provide a clear, educational explanation
3. Include key concepts and importance
4. Use simple, accessible language
5. Make it informative but concise

Example for "Light Reactions":
"Light reactions are the first stage of photosynthesis that convert light energy into chemical energy. They occur in the thylakoid membranes of chloroplasts and produce ATP and NADPH. These energy carriers are essential for the subsequent Calvin cycle to fix carbon dioxide into glucose."
"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            # Fallback summary
            return f"{title} is an important concept that involves key principles and applications. Understanding {title} helps build foundational knowledge in this field."
