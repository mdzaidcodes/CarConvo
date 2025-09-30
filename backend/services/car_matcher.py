"""
Car Matcher Service - Industry-Standard Recommendation Engine
Uses advanced algorithms: Cosine Similarity, Weighted Feature Scoring, and MCDA
Matches cars to users based on lifestyle profiles, budget, and preferences
"""

import json
import os
import math
from typing import List, Dict, Tuple


class CarMatcher:
    """
    Advanced car recommendation service using industry-standard algorithms
    
    Techniques used:
    1. Cosine Similarity - For lifestyle profile matching
    2. Weighted Feature Scoring - For multi-criteria evaluation  
    3. Budget Affinity - Penalty-based price optimization
    4. Composite Scoring - Combines multiple factors
    """
    
    def __init__(self):
        """Initialize car matcher with car database"""
        self.cars = self._load_cars()
        
        # Define dimension importance weights based on automotive industry research
        self.dimension_importance = {
            'safety_focused': 1.2,      # Safety is critical
            'budget_conscious': 1.15,   # Budget drives decisions
            'eco_conscious': 1.1,       # Environmental concerns growing
            'family_friendly': 1.1,     # Family needs are high priority
            'commuter': 1.0,            # Standard importance
            'performance': 0.95,        # Nice to have
            'tech_enthusiast': 0.9,     # Bonus feature
            'luxury': 0.85,             # Lower priority for most
            'city_driving': 1.0,        # Context-dependent
            'adventure': 0.9,           # Niche preference
        }
    
    def _load_cars(self) -> List[Dict]:
        """
        Load car data from JSON file
        
        Returns:
            list: List of car dictionaries
        """
        try:
            data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'cars.json')
            with open(data_path, 'r') as f:
                data = json.load(f)
                return data.get('cars', [])
        except Exception as e:
            print(f"Error loading cars: {e}")
            return []
    
    def find_matches(self, lifestyle_profile: Dict, budget: int = None, 
                     conversation_context: List = None, top_n: int = 4) -> List[Dict]:
        """
        Find top N cars that match user's profile using industry-standard algorithms
        
        ALGORITHM OVERVIEW:
        1. Parse conversation for new preferences
        2. Adjust lifestyle profile based on conversation
        3. Calculate Cosine Similarity (lifestyle matching)
        4. Apply Budget Affinity Score (price optimization)
        5. Calculate Feature Score (specifications match)
        6. Compute Composite Score (weighted combination)
        7. Return top N matches sorted by score
        
        Args:
            lifestyle_profile (dict): User's lifestyle scores (1-10)
            budget (int): Target budget in dollars (used for affinity, not hard filter)
            conversation_context (list): Previous conversation for context
            top_n (int): Number of recommendations (default: 4)
            
        Returns:
            list: Top N cars sorted by match score (highest first)
        """
        # Parse conversation to extract preferences and filters
        conversation_preferences = self._parse_conversation_preferences(conversation_context)
        
        # Create adjusted lifestyle profile based on conversation
        adjusted_profile = lifestyle_profile.copy()
        for dimension, boost in conversation_preferences['lifestyle_boosts'].items():
            if dimension in adjusted_profile:
                # Apply conversation boosts (max 10)
                adjusted_profile[dimension] = min(10, adjusted_profile[dimension] + boost)
        
        print(f"🔄 Conversation adjustments: {conversation_preferences['lifestyle_boosts']}")
        print(f"🎯 Filters: {conversation_preferences['filters']}")
        
        matches = []
        
        # Calculate scores for all cars
        for car in self.cars:
            # Apply conversation filters (hard filters)
            if not self._meets_conversation_filters(car, conversation_preferences['filters']):
                continue  # Skip cars that don't meet explicit requirements
            
            # 1. Cosine Similarity Score (40% weight) - Lifestyle matching
            # Use ADJUSTED profile with conversation boosts
            cosine_score = self._calculate_cosine_similarity(
                car['lifestyle_scores'], 
                adjusted_profile
            )
            
            # 2. Budget Affinity Score (30% weight) - Price optimization
            budget_score = self._calculate_budget_affinity(
                car['basic_info']['msrp'],
                budget
            ) if budget else 0.85  # Default to 85% if no budget
            
            # 3. Feature Score (20% weight) - Specifications quality
            feature_score = self._calculate_feature_score(
                car,
                adjusted_profile  # Use adjusted profile
            )
            
            # 4. Value Score (10% weight) - Price-to-quality ratio
            value_score = self._calculate_value_score(car)
            
            # 5. Composite Score - Weighted combination
            composite_score = (
                cosine_score * 0.40 +      # Lifestyle match (most important)
                budget_score * 0.30 +      # Budget fit
                feature_score * 0.20 +     # Feature quality
                value_score * 0.10         # Value for money
            )
            
            # Create enriched car object with scoring details
            car_with_score = car.copy()
            car_with_score['match_score'] = round(composite_score, 2)
            car_with_score['score_breakdown'] = {
                'lifestyle_match': round(cosine_score, 2),
                'budget_fit': round(budget_score, 2),
                'feature_quality': round(feature_score, 2),
                'value_score': round(value_score, 2)
            }
            car_with_score['match_reasons'] = self._generate_match_reasons(
                car, adjusted_profile, composite_score
            )
            
            matches.append(car_with_score)
        
        # Sort by composite score (highest first)
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Return top N matches (default: 4)
        return matches[:top_n]
    
    def _calculate_cosine_similarity(self, car_scores: Dict, user_profile: Dict) -> float:
        """
        Calculate Cosine Similarity between car and user lifestyle vectors
        
        Industry-standard technique used in recommendation systems.
        Measures angle between two vectors in n-dimensional space.
        
        Formula: cos(θ) = (A · B) / (||A|| × ||B||)
        
        Args:
            car_scores (dict): Car's lifestyle scores
            user_profile (dict): User's lifestyle preferences
            
        Returns:
            float: Similarity score (0-100)
        """
        dot_product = 0
        car_magnitude = 0
        user_magnitude = 0
        
        # Calculate dot product and magnitudes with importance weighting
        for dimension in user_profile.keys():
            if dimension in car_scores:
                # Apply dimension importance weights
                importance = self.dimension_importance.get(dimension, 1.0)
                
                car_val = car_scores[dimension] * importance
                user_val = user_profile[dimension] * importance
                
                dot_product += car_val * user_val
                car_magnitude += car_val ** 2
                user_magnitude += user_val ** 2
        
        # Calculate cosine similarity
        if car_magnitude > 0 and user_magnitude > 0:
            cosine_sim = dot_product / (math.sqrt(car_magnitude) * math.sqrt(user_magnitude))
            # Convert to 0-100 scale
            return cosine_sim * 100
        
        return 0
    
    def _calculate_budget_affinity(self, car_price: int, user_budget: int) -> float:
        """
        Calculate budget affinity score with soft penalty approach
        
        Instead of hard filtering, applies graduated penalty for price deviation.
        Used by automotive recommendation systems to balance budget with value.
        
        Scoring:
        - Within budget: 100%
        - 0-10% over: 85-100% (minor penalty)
        - 10-20% over: 60-85% (moderate penalty)
        - 20-30% over: 30-60% (significant penalty)
        - 30%+ over: 0-30% (major penalty)
        - Under budget: Bonus based on savings
        
        Args:
            car_price (int): MSRP of the car
            user_budget (int): User's target budget
            
        Returns:
            float: Budget affinity score (0-100)
        """
        if not user_budget or user_budget <= 0:
            return 85  # Default score if no budget specified
        
        price_ratio = car_price / user_budget
        
        if price_ratio <= 1.0:
            # Car is within or under budget - bonus for savings
            savings_ratio = 1.0 - price_ratio
            return 100 - (savings_ratio * 5)  # Slight penalty for too cheap (95-100)
        
        elif price_ratio <= 1.10:
            # 0-10% over budget - minor penalty
            penalty = (price_ratio - 1.0) * 150  # 0-15% penalty
            return 100 - penalty
        
        elif price_ratio <= 1.20:
            # 10-20% over budget - moderate penalty
            penalty = 15 + ((price_ratio - 1.10) * 250)  # 15-40% penalty
            return 100 - penalty
        
        elif price_ratio <= 1.30:
            # 20-30% over budget - significant penalty
            penalty = 40 + ((price_ratio - 1.20) * 300)  # 40-70% penalty
            return 100 - penalty
        
        else:
            # 30%+ over budget - major penalty
            return max(0, 30 - ((price_ratio - 1.30) * 50))
    
    def _calculate_feature_score(self, car: Dict, user_profile: Dict) -> float:
        """
        Calculate feature quality score based on specifications
        
        Evaluates car's objective features against user priorities.
        Industry approach: normalize specs and weight by user preferences.
        
        Args:
            car (dict): Car data
            user_profile (dict): User lifestyle profile
            
        Returns:
            float: Feature quality score (0-100)
        """
        specs = car['specifications']
        score = 0
        weight_sum = 0
        
        # Fuel efficiency (eco-conscious, budget-conscious, commuter)
        eco_weight = user_profile.get('eco_conscious', 5) / 10
        budget_weight = user_profile.get('budget_conscious', 5) / 10
        commuter_weight = user_profile.get('commuter', 5) / 10
        mpg_weight = (eco_weight + budget_weight + commuter_weight) / 3
        
        mpg = specs.get('mpg_combined', 25)
        mpg_score = min(100, (mpg / 50) * 100)  # Normalize (50 MPG = 100%)
        score += mpg_score * mpg_weight
        weight_sum += mpg_weight
        
        # Performance (horsepower)
        perf_weight = user_profile.get('performance', 5) / 10
        hp = specs.get('horsepower', 150)
        hp_score = min(100, (hp / 400) * 100)  # Normalize (400 HP = 100%)
        score += hp_score * perf_weight
        weight_sum += perf_weight
        
        # Space (seating + cargo)
        family_weight = user_profile.get('family_friendly', 5) / 10
        seating = specs.get('seating_capacity', 5)
        cargo = specs.get('cargo_space', 15)
        space_score = min(100, ((seating * 10) + (cargo * 2)))
        score += space_score * family_weight
        weight_sum += family_weight
        
        # Safety features count
        safety_weight = user_profile.get('safety_focused', 5) / 10
        safety_features = len(car['features'].get('safety', []))
        safety_score = min(100, (safety_features / 10) * 100)
        score += safety_score * safety_weight
        weight_sum += safety_weight
        
        # Technology features count
        tech_weight = user_profile.get('tech_enthusiast', 5) / 10
        tech_features = len(car['features'].get('technology', []))
        tech_score = min(100, (tech_features / 8) * 100)
        score += tech_score * tech_weight
        weight_sum += tech_weight
        
        return (score / weight_sum) if weight_sum > 0 else 50
    
    def _calculate_value_score(self, car: Dict) -> float:
        """
        Calculate value-for-money score
        
        Automotive industry metric combining price, features, and ownership costs.
        
        Args:
            car (dict): Car data
            
        Returns:
            float: Value score (0-100)
        """
        price = car['basic_info']['msrp']
        specs = car['specifications']
        costs = car['costs']
        
        # Feature density (features per $10k)
        total_features = (
            len(car['features'].get('safety', [])) +
            len(car['features'].get('technology', [])) +
            len(car['features'].get('comfort', [])) +
            len(car['features'].get('entertainment', []))
        )
        feature_density = (total_features / (price / 10000))
        feature_score = min(100, feature_density * 15)
        
        # Operating cost efficiency (lower is better)
        annual_cost = (
            costs.get('insurance_annual_estimate', 1500) +
            costs.get('maintenance_annual_estimate', 500) +
            ((15000 / specs.get('mpg_combined', 25)) * 3.50)  # Fuel cost
        )
        # Normalize: $2000/year = 100%, $5000/year = 50%
        cost_efficiency = max(0, 100 - ((annual_cost - 2000) / 50))
        
        # MPG to price ratio
        mpg_value = (specs.get('mpg_combined', 25) / (price / 10000))
        mpg_score = min(100, mpg_value * 20)
        
        # Composite value score
        value_score = (feature_score * 0.4 + cost_efficiency * 0.3 + mpg_score * 0.3)
        
        return value_score
    
    def _generate_match_reasons(self, car: Dict, user_profile: Dict, score: float) -> List[str]:
        """
        Generate human-readable reasons for the match
        
        Args:
            car (dict): Car data
            user_profile (dict): User profile
            score (float): Match score
            
        Returns:
            list: List of match reason strings
        """
        reasons = []
        
        # Find top 3 user priorities
        top_priorities = sorted(
            user_profile.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:3]
        
        # Match reasons based on priorities
        for dimension, user_score in top_priorities:
            if user_score >= 7:  # High priority
                car_score = car['lifestyle_scores'].get(dimension, 5)
                if car_score >= 7:
                    dimension_name = dimension.replace('_', ' ').title()
                    reasons.append(f"Strong {dimension_name} match")
        
        # Add price-based reason
        price = car['basic_info']['msrp']
        if price < 30000:
            reasons.append("Great value")
        elif price > 50000:
            reasons.append("Premium features")
        
        # Add unique selling points
        if car['specifications']['mpg_combined'] > 35:
            reasons.append("Excellent fuel economy")
        if car['specifications']['horsepower'] > 300:
            reasons.append("High performance")
        if len(car['features']['safety']) > 5:
            reasons.append("Advanced safety tech")
        
        return reasons[:4]  # Return top 4 reasons
    
    def compare_cars(self, car_ids: List[str]) -> Dict:
        """
        Generate detailed comparison between multiple cars
        
        Args:
            car_ids (list): List of car IDs to compare
            
        Returns:
            dict: Comparison data with pros/cons and specs
        """
        comparison = {
            "cars": [],
            "categories": {
                "price": [],
                "fuel_efficiency": [],
                "performance": [],
                "safety": [],
                "space": []
            }
        }
        
        for car_id in car_ids:
            car = self.get_car_by_id(car_id)
            if car:
                comparison["cars"].append({
                    "id": car_id,
                    "name": f"{car['basic_info']['make']} {car['basic_info']['model']}",
                    "price": car['basic_info']['msrp'],
                    "image": car['basic_info']['image_url'],
                    "specs": car['specifications'],
                    "pros": car['pros'],
                    "cons": car['cons'],
                    "features": car['features']
                })
                
                # Add to category comparisons
                comparison["categories"]["price"].append({
                    "car": f"{car['basic_info']['make']} {car['basic_info']['model']}",
                    "value": car['basic_info']['msrp']
                })
                comparison["categories"]["fuel_efficiency"].append({
                    "car": f"{car['basic_info']['make']} {car['basic_info']['model']}",
                    "value": car['specifications']['mpg_combined']
                })
                comparison["categories"]["performance"].append({
                    "car": f"{car['basic_info']['make']} {car['basic_info']['model']}",
                    "value": car['specifications']['horsepower']
                })
        
        return comparison
    
    def get_car_by_id(self, car_id: str) -> Dict:
        """
        Get car details by ID
        
        Args:
            car_id (str): Unique car identifier
            
        Returns:
            dict: Car data or None if not found
        """
        for car in self.cars:
            if car['id'] == car_id:
                return car
        return None
    
    def filter_by_criteria(self, body_type: str = None, min_mpg: int = None, 
                          max_price: int = None, min_seating: int = None) -> List[Dict]:
        """
        Filter cars by specific criteria
        
        Args:
            body_type (str): SUV, Sedan, Truck, etc.
            min_mpg (int): Minimum fuel efficiency
            max_price (int): Maximum price
            min_seating (int): Minimum seating capacity
            
        Returns:
            list: Filtered list of cars
        """
        filtered = self.cars
        
        if body_type:
            filtered = [c for c in filtered if c['basic_info']['body_type'].lower() == body_type.lower()]
        
        if min_mpg:
            filtered = [c for c in filtered if c['specifications']['mpg_combined'] >= min_mpg]
        
        if max_price:
            filtered = [c for c in filtered if c['basic_info']['msrp'] <= max_price]
        
        if min_seating:
            filtered = [c for c in filtered if c['specifications']['seating_capacity'] >= min_seating]
        
        return filtered
    
    def _parse_conversation_preferences(self, conversation_context: List) -> Dict:
        """
        Parse conversation to extract preferences and filters
        
        Analyzes recent user messages for keywords indicating:
        - Body type preferences (SUV, sedan, truck, etc.)
        - Feature preferences (hybrid, electric, performance, etc.)
        - Lifestyle adjustments (family, sporty, eco-friendly, etc.)
        
        Args:
            conversation_context (list): Recent conversation messages
            
        Returns:
            dict: {
                'filters': {...},  # Hard filters to apply
                'lifestyle_boosts': {...}  # Adjustments to lifestyle profile
            }
        """
        filters = {}
        lifestyle_boosts = {}
        
        if not conversation_context:
            return {'filters': filters, 'lifestyle_boosts': lifestyle_boosts}
        
        # Combine all user messages
        user_messages = []
        try:
            for msg in conversation_context:
                if isinstance(msg, dict) and msg.get('role') == 'user':
                    content = msg.get('content', '')
                    if content:
                        user_messages.append(content.lower())
        except Exception as e:
            print(f"⚠️ Error parsing conversation context: {e}")
            return {'filters': filters, 'lifestyle_boosts': lifestyle_boosts}
        
        conversation_text = ' '.join(user_messages)
        
        # If no user messages found, return empty preferences
        if not conversation_text or not conversation_text.strip():
            return {'filters': filters, 'lifestyle_boosts': lifestyle_boosts}
        
        print(f"📝 Analyzing conversation text: '{conversation_text[:100]}...'")
        
        # Body type keywords
        body_type_keywords = {
            'suv': ['suv', 'crossover', 'suvs'],
            'sedan': ['sedan', 'sedans'],
            'truck': ['truck', 'pickup', 'trucks'],
            'hatchback': ['hatchback', 'hatch'],
            'wagon': ['wagon', 'estate'],
            'minivan': ['minivan', 'van'],
            'coupe': ['coupe', 'sports car', 'sports-car', 'sportscar', '2-door', 'two door'],
            'convertible': ['convertible', 'roadster', 'cabriolet']
        }
        
        for body_type, keywords in body_type_keywords.items():
            if any(keyword in conversation_text for keyword in keywords):
                filters['body_type'] = body_type.upper()
                print(f"  → Detected body type preference: {body_type}")
                break
        
        # Fuel type / eco preferences
        if any(word in conversation_text for word in ['hybrid', 'plug-in', 'phev']):
            lifestyle_boosts['eco_conscious'] = 3
            filters['fuel_preference'] = 'hybrid'
            print("  → Detected: Hybrid preference")
        
        if any(word in conversation_text for word in ['electric', 'ev', 'battery']):
            lifestyle_boosts['eco_conscious'] = 4
            lifestyle_boosts['tech_enthusiast'] = 2
            filters['fuel_preference'] = 'electric'
            print("  → Detected: Electric preference")
        
        if any(word in conversation_text for word in ['fuel efficient', 'gas mileage', 'mpg', 'economical']):
            lifestyle_boosts['eco_conscious'] = 2
            lifestyle_boosts['budget_conscious'] = 1
            filters['min_mpg'] = 30
            print("  → Detected: Fuel efficiency priority")
        
        # Family / cargo needs
        if any(word in conversation_text for word in ['family', 'kids', 'children', 'baby']):
            lifestyle_boosts['family_friendly'] = 3
            lifestyle_boosts['safety_focused'] = 2
            filters['min_seating'] = 5
            print("  → Detected: Family needs")
        
        if any(word in conversation_text for word in ['cargo', 'space', 'room', 'spacious']):
            lifestyle_boosts['family_friendly'] = 2
            print("  → Detected: Space requirements")
        
        # Performance / sporty / sports car
        performance_keywords = ['fast', 'sporty', 'performance', 'quick', 'speed', 'hp', 'horsepower', 'sports car', 'sport car']
        if any(word in conversation_text for word in performance_keywords):
            lifestyle_boosts['performance'] = 4
            filters['min_horsepower'] = 200  # Lower threshold for sports cars
            print("  → Detected: Performance/sports car preference")
        
        # Luxury
        if any(word in conversation_text for word in ['luxury', 'premium', 'high-end', 'upscale']):
            lifestyle_boosts['luxury'] = 3
            lifestyle_boosts['tech_enthusiast'] = 1
            print("  → Detected: Luxury preference")
        
        # Off-road / adventure
        if any(word in conversation_text for word in ['off-road', 'offroad', 'adventure', 'trail', '4x4', 'awd', 'all-wheel']):
            lifestyle_boosts['adventure'] = 3
            filters['drivetrain'] = 'AWD'
            print("  → Detected: Adventure/off-road preference")
        
        # Safety focus
        if any(word in conversation_text for word in ['safe', 'safety', 'secure', 'protection']):
            lifestyle_boosts['safety_focused'] = 2
            print("  → Detected: Safety priority")
        
        # Tech features
        if any(word in conversation_text for word in ['tech', 'technology', 'infotainment', 'screen', 'connectivity']):
            lifestyle_boosts['tech_enthusiast'] = 2
            print("  → Detected: Technology interest")
        
        # Commuter / city
        if any(word in conversation_text for word in ['commute', 'commuting', 'city', 'urban', 'parking']):
            lifestyle_boosts['commuter'] = 2
            lifestyle_boosts['city_driving'] = 2
            print("  → Detected: City/commuter focus")
        
        # Budget / price constraints
        import re
        # Look for price mentions: "under $40k", "$30000", "below 50k", etc.
        price_patterns = [
            r'under\s*\$?(\d+)k?',
            r'below\s*\$?(\d+)k?',
            r'less than\s*\$?(\d+)k?',
            r'\$(\d+)k?\s*or less',
            r'\$(\d+)k?\s*max',
            r'budget\s*\$?(\d+)k?',
            r'\$(\d+),?(\d{3})'
        ]
        
        for pattern in price_patterns:
            match = re.search(pattern, conversation_text)
            if match:
                try:
                    if ',' in pattern:  # Handle "$40,000" format
                        price = int(match.group(1) + match.group(2))
                    else:
                        price = int(match.group(1))
                        # If format is "40k" multiply by 1000
                        if 'k' in conversation_text[match.start():match.end()].lower():
                            price = price * 1000
                    
                    filters['max_price'] = price
                    print(f"  → Detected: Budget constraint ${price:,}")
                    break
                except (ValueError, IndexError):
                    pass
        
        return {
            'filters': filters,
            'lifestyle_boosts': lifestyle_boosts
        }
    
    def _meets_conversation_filters(self, car: Dict, filters: Dict) -> bool:
        """
        Check if car meets conversation-derived filters
        
        Args:
            car (dict): Car data
            filters (dict): Filters from conversation parsing
            
        Returns:
            bool: True if car meets all filters
        """
        if not filters:
            return True
        
        # Body type filter
        if 'body_type' in filters:
            if car['basic_info']['body_type'].upper() != filters['body_type'].upper():
                return False
        
        # MPG filter
        if 'min_mpg' in filters:
            if car['specifications']['mpg_combined'] < filters['min_mpg']:
                return False
        
        # Horsepower filter
        if 'min_horsepower' in filters:
            if car['specifications']['horsepower'] < filters['min_horsepower']:
                return False
        
        # Seating filter
        if 'min_seating' in filters:
            if car['specifications']['seating_capacity'] < filters['min_seating']:
                return False
        
        # Fuel preference (hybrid/electric)
        if 'fuel_preference' in filters:
            fuel_pref = filters['fuel_preference'].lower()
            engine = car['specifications']['engine'].lower()
            
            if fuel_pref == 'hybrid' and 'hybrid' not in engine:
                return False
            if fuel_pref == 'electric' and ('electric' not in engine and 'ev' not in engine):
                return False
        
        # Drivetrain filter
        if 'drivetrain' in filters:
            if filters['drivetrain'].upper() not in car['specifications']['drivetrain'].upper():
                return False
        
        # Max price filter (hard constraint)
        if 'max_price' in filters:
            if car['basic_info']['msrp'] > filters['max_price']:
                return False
        
        return True
