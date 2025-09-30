"""
Ollama Service - Interface for Llama3 model
Handles all AI inference and conversation generation
"""

import requests
import json


class OllamaService:
    """Service class for interacting with Ollama AI models"""
    
    def __init__(self, model="llama3", base_url="http://localhost:11434"):
        """
        Initialize Ollama service
        
        Args:
            model (str): Name of the Ollama model to use
            base_url (str): Base URL for Ollama API
        """
        self.model = model
        self.base_url = base_url
        self.api_url = f"{base_url}/api/generate"
        self.chat_url = f"{base_url}/api/chat"
    
    def check_connection(self):
        """
        Check if Ollama service is running and accessible
        
        Returns:
            bool: True if connected, False otherwise
        """
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception as e:
            print(f"Ollama connection error: {e}")
            return False
    
    def generate_response(self, prompt, conversation_history=None, temperature=0.6, max_tokens=200):
        """
        Generate AI response using Ollama
        
        Args:
            prompt (str): The prompt/context for generation
            conversation_history (list): Previous messages in conversation
            temperature (float): Creativity level (0.0-1.0)
            max_tokens (int): Maximum response length
            
        Returns:
            str: Generated response from AI (cleaned of reasoning tags)
        """
        try:
            # Use chat endpoint for conversational context
            if conversation_history:
                messages = [
                    {"role": "system", "content": prompt}
                ]
                
                # Add relevant conversation history
                for msg in conversation_history[-4:]:  # Last 4 messages for context
                    messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
                
                payload = {
                    "model": self.model,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens,
                        "top_p": 0.9,  # More focused responses
                        "repeat_penalty": 1.1  # Reduce repetition
                    }
                }
                
                print(f"🔄 Calling Ollama chat API with model: {self.model}")
                response = requests.post(
                    self.chat_url,
                    json=payload,
                    timeout=60  # Increased timeout for Llama3
                )
                print(f"✓ Ollama responded with status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    raw_content = result.get("message", {}).get("content", "I apologize, I couldn't generate a response.")
                    # Clean reasoning tags (if present from any model)
                    return self._clean_reasoning_tags(raw_content)
            
            # Fallback to generate endpoint
            else:
                payload = {
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens,
                        "top_p": 0.9,
                        "repeat_penalty": 1.1
                    }
                }
                
                response = requests.post(
                    self.api_url,
                    json=payload,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    raw_response = result.get("response", "I apologize, I couldn't generate a response.")
                    # Clean reasoning tags (if present from any model)
                    return self._clean_reasoning_tags(raw_response)
            
            # Error handling
            print(f"Ollama API error: {response.status_code}")
            return "I'm having trouble connecting to my AI service. Please try again."
            
        except requests.exceptions.Timeout:
            print("❌ Ollama timeout - model took too long to respond")
            return "The AI is taking too long to respond. This might mean Ollama is busy or the model is not responding. Please check if Ollama is running properly."
        
        except requests.exceptions.ConnectionError as e:
            print(f"❌ Ollama connection error: {e}")
            return "Cannot connect to Ollama. Please make sure Ollama is running: 'ollama serve'"
        
        except Exception as e:
            print(f"❌ Error generating response: {e}")
            import traceback
            traceback.print_exc()
            return f"I apologize, but I encountered an error: {str(e)}. Please check if Ollama is running and llama3 model is available."
    
    def _clean_reasoning_tags(self, text: str) -> str:
        """
        Remove reasoning/thinking tags from model output (if present)
        Some models like deepseek-r1 output internal reasoning in tags.
        Llama3 doesn't use these, but this function provides compatibility.
        
        Args:
            text (str): Raw model output
            
        Returns:
            str: Cleaned text without reasoning tags
        """
        import re
        
        # Remove <think>...</think> blocks (case insensitive, multiline)
        text = re.sub(r'<think>.*?</think>', '', text, flags=re.IGNORECASE | re.DOTALL)
        
        # Remove <thinking>...</thinking> blocks
        text = re.sub(r'<thinking>.*?</thinking>', '', text, flags=re.IGNORECASE | re.DOTALL)
        
        # Remove any other reasoning markers
        text = re.sub(r'\[REASONING\].*?\[/REASONING\]', '', text, flags=re.IGNORECASE | re.DOTALL)
        text = re.sub(r'\[THINK\].*?\[/THINK\]', '', text, flags=re.IGNORECASE | re.DOTALL)
        
        # Clean up extra whitespace
        text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)  # Multiple newlines to double
        text = text.strip()
        
        return text
    
    def generate_car_summary(self, car_data, lifestyle_profile):
        """
        Generate a personalized summary of why a car matches the user
        
        Args:
            car_data (dict): Car specifications and details
            lifestyle_profile (dict): User's lifestyle preferences
            
        Returns:
            str: Personalized car summary
        """
        prompt = f"""Generate a brief, friendly summary (2-3 sentences) explaining why the {car_data['basic_info']['make']} {car_data['basic_info']['model']} is a great match for someone with this lifestyle profile:

{json.dumps(lifestyle_profile, indent=2)}

Car Details:
- Price: ${car_data['basic_info']['msrp']:,}
- Type: {car_data['basic_info']['body_type']}
- MPG: {car_data['specifications']['mpg_combined']}
- Key Features: {', '.join(car_data['features']['safety'][:3])}

Focus on lifestyle alignment, not technical specs. Be enthusiastic but honest."""

        return self.generate_response(prompt, temperature=0.8, max_tokens=150)
