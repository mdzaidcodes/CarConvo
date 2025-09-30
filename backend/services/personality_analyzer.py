"""
Personality Analyzer Service - Converts user responses to lifestyle profile
Analyzes personality test answers to determine car preferences
"""

import json
import os
from typing import Dict, List


class PersonalityAnalyzer:
    """Service for analyzing personality test responses"""
    
    def __init__(self):
        """Initialize personality analyzer with questions database"""
        self.questions = self._load_questions()
    
    def _load_questions(self) -> List[Dict]:
        """
        Load personality questions from JSON file
        
        Returns:
            list: List of question dictionaries
        """
        try:
            data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'personality_questions.json')
            with open(data_path, 'r') as f:
                data = json.load(f)
                return data.get('questions', [])
        except Exception as e:
            print(f"Error loading questions: {e}")
            return []
    
    def get_questions(self) -> List[Dict]:
        """
        Get all personality test questions
        
        Returns:
            list: List of questions with options
        """
        return self.questions
    
    def analyze(self, answers: Dict) -> Dict:
        """
        Analyze user's answers and generate lifestyle profile
        Supports both single and multiple answer selection
        
        Args:
            answers (dict): Dictionary of question IDs to selected answer(s)
                           Format: {"q1": ["option_a", "option_b"], "q2": ["option_c"], ...}
                           Or legacy: {"q1": "option_a", "q2": "option_c", ...}
        
        Returns:
            dict: Lifestyle profile with scores (1-10) for each dimension
        """
        # Initialize lifestyle scores
        lifestyle_scores = {
            "family_friendly": 0,
            "adventure": 0,
            "eco_conscious": 0,
            "luxury": 0,
            "performance": 0,
            "budget_conscious": 0,
            "city_driving": 0,
            "commuter": 0,
            "tech_enthusiast": 0,
            "safety_focused": 0
        }
        
        # Count contributions to each dimension
        dimension_counts = {key: 0 for key in lifestyle_scores.keys()}
        
        # Process each answer
        for question in self.questions:
            question_id = question['id']
            user_answers = answers.get(question_id)
            
            if not user_answers:
                continue
            
            # Handle both single string and array format
            if isinstance(user_answers, str):
                user_answers = [user_answers]
            elif not isinstance(user_answers, list):
                continue
            
            # Process each selected option for this question
            for user_answer in user_answers:
                # Find the selected option
                selected_option = None
                for option in question['options']:
                    if option['value'] == user_answer:
                        selected_option = option
                        break
                
                if not selected_option:
                    continue
                
                # Add points to relevant lifestyle dimensions
                # When multiple answers are selected, average their contributions
                weight = 1.0 / len(user_answers) if len(user_answers) > 0 else 1.0
                
                for dimension, points in selected_option['scores'].items():
                    if dimension in lifestyle_scores:
                        lifestyle_scores[dimension] += (points * weight)
                        dimension_counts[dimension] += weight
        
        # Normalize scores to 1-10 scale
        # Divide by number of questions that contributed to each dimension
        for dimension in lifestyle_scores:
            if dimension_counts[dimension] > 0:
                # Average the accumulated points
                avg_score = lifestyle_scores[dimension] / dimension_counts[dimension]
                # Ensure score is within 1-10 range
                lifestyle_scores[dimension] = max(1, min(10, round(avg_score)))
            else:
                # Default to 5 if no questions contributed
                lifestyle_scores[dimension] = 5
        
        return lifestyle_scores
    
    def get_profile_description(self, lifestyle_scores: Dict) -> str:
        """
        Generate human-readable description of lifestyle profile
        
        Args:
            lifestyle_scores (dict): Calculated lifestyle scores
            
        Returns:
            str: Descriptive text about the user's car preferences
        """
        # Find top 3 priorities
        sorted_scores = sorted(lifestyle_scores.items(), key=lambda x: x[1], reverse=True)
        top_priorities = sorted_scores[:3]
        
        descriptions = {
            "family_friendly": "family-oriented with focus on safety and space",
            "adventure": "adventurous and outdoor-focused",
            "eco_conscious": "environmentally conscious",
            "luxury": "appreciative of premium features and comfort",
            "performance": "performance-driven and dynamic",
            "budget_conscious": "value-focused and practical",
            "city_driving": "urban lifestyle with compact needs",
            "commuter": "commuter prioritizing efficiency",
            "tech_enthusiast": "technology-forward",
            "safety_focused": "safety-conscious"
        }
        
        profile_parts = []
        for dimension, score in top_priorities:
            if score >= 7:
                profile_parts.append(descriptions.get(dimension, dimension))
        
        if profile_parts:
            return f"You appear to be {', '.join(profile_parts)}."
        else:
            return "You have balanced priorities across different vehicle aspects."
