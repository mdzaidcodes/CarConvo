"""
CarConvo Backend - Flask API with Ollama Integration
Main application file handling all API endpoints
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import traceback

# Import custom modules
from services.ollama_service import OllamaService
from services.car_matcher import CarMatcher
from services.personality_analyzer import PersonalityAnalyzer

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for Next.js frontend

# Initialize services
print("Initializing services...")
try:
    ollama_service = OllamaService(model="llama3:8b")
    print("✓ Ollama service initialized")
except Exception as e:
    print(f"✗ Ollama service initialization error: {e}")
    ollama_service = None

try:
    car_matcher = CarMatcher()
    print(f"✓ Car matcher initialized with {len(car_matcher.cars)} cars")
except Exception as e:
    print(f"✗ Car matcher initialization error: {e}")
    car_matcher = None

try:
    personality_analyzer = PersonalityAnalyzer()
    print(f"✓ Personality analyzer initialized with {len(personality_analyzer.questions)} questions")
except Exception as e:
    print(f"✗ Personality analyzer initialization error: {e}")
    personality_analyzer = None

# Store conversation history in memory (use Redis/DB in production)
conversation_sessions = {}

print("\n" + "="*50)
print("CarConvo Backend Started Successfully!")
print("="*50 + "\n")


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API is running"""
    ollama_connected = False
    ollama_error = None
    
    try:
        if ollama_service:
            ollama_connected = ollama_service.check_connection()
            if not ollama_connected:
                ollama_error = "Ollama service not responding. Is it running?"
        else:
            ollama_error = "Ollama service not initialized"
    except Exception as e:
        ollama_error = str(e)
    
    return jsonify({
        "status": "healthy" if ollama_connected else "degraded",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "flask": "running",
            "ollama": "connected" if ollama_connected else "disconnected",
            "car_matcher": "loaded" if car_matcher else "error",
            "personality_analyzer": "loaded" if personality_analyzer else "error"
        },
        "ollama_status": ollama_connected,
        "ollama_error": ollama_error,
        "instructions": "Run 'ollama serve' if Ollama is not connected" if not ollama_connected else None
    })


@app.route('/api/personality/questions', methods=['GET'])
def get_personality_questions():
    """Get personality test questions for lifestyle assessment"""
    try:
        questions = personality_analyzer.get_questions()
        return jsonify({
            "success": True,
            "questions": questions
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/personality/analyze', methods=['POST'])
def analyze_personality():
    """
    Analyze personality test responses and generate lifestyle profile
    Expected payload: { "answers": { "q1": "answer", "q2": "answer", ... } }
    """
    print("\n" + "="*60)
    print("🎯 Personality test analysis request received")
    try:
        data = request.get_json()
        answers = data.get('answers', {})
        print(f"📝 Analyzing {len(answers)} answers...")
        
        # Generate lifestyle profile from answers
        lifestyle_profile = personality_analyzer.analyze(answers)
        print("✓ Lifestyle profile generated")
        
        # Create new session
        session_id = f"session_{datetime.now().timestamp()}"
        conversation_sessions[session_id] = {
            "lifestyle_profile": lifestyle_profile,
            "conversation_history": [],
            "recommended_cars": []
        }
        print(f"✓ Session created: {session_id}")
        print("✓ Response ready")
        print("="*60 + "\n")
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "lifestyle_profile": lifestyle_profile
        })
    except Exception as e:
        print(f"❌ Error in personality analysis: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Handle conversational interaction with AI agent
    Expected payload: { "session_id": "...", "message": "...", "budget": 30000 }
    """
    print("\n" + "="*60)
    print("📩 New chat request received")
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        user_message = data.get('message')
        budget = data.get('budget', None)
        
        if not session_id or session_id not in conversation_sessions:
            return jsonify({
                "success": False,
                "error": "Invalid session"
            }), 400
        
        session = conversation_sessions[session_id]
        lifestyle_profile = session['lifestyle_profile']
        
        print(f"👤 User message: {user_message[:50]}...")
        print(f"💰 Budget: ${budget}" if budget else "💰 Budget: Not set")
        
        # Add user message to history
        session['conversation_history'].append({
            "role": "user",
            "content": user_message
        })
        
        # Get matched cars based on lifestyle and budget (Top 4 using industry algorithm)
        print("🔍 Finding matching cars...")
        matched_cars = car_matcher.find_matches(
            lifestyle_profile=lifestyle_profile,
            budget=budget,
            conversation_context=session['conversation_history'],
            top_n=4  # Always return exactly 4 recommendations
        )
        print(f"✓ Found {len(matched_cars)} matches")
        
        # Build context for AI with enhanced scoring information
        cars_summary = []
        for idx, car in enumerate(matched_cars, 1):
            cars_summary.append({
                "rank": idx,
                "make": car['basic_info']['make'],
                "model": car['basic_info']['model'],
                "year": car['basic_info']['year'],
                "body_type": car['basic_info']['body_type'],
                "price": car['basic_info']['msrp'],
                "mpg": car['specifications']['mpg_combined'],
                "horsepower": car['specifications']['horsepower'],
                "seating": car['specifications']['seating_capacity'],
                "engine": car['specifications']['engine'],
                "match_score": car['match_score'],
                "match_reasons": car.get('match_reasons', []),
                "score_breakdown": car.get('score_breakdown', {}),
                "pros": car.get('pros', [])[:3],  # Top 3 pros
                "cons": car.get('cons', [])[:2]   # Top 2 cons
            })
        
        # Check if this is the first message (initial recommendations)
        is_first_message = len(session['conversation_history']) <= 1
        
        if is_first_message:
            # First message: More welcoming and detailed (2 paragraphs)
            context = f"""You are a friendly car recommendation expert. This is the user's first interaction.

USER PROFILE:
{json.dumps(lifestyle_profile, indent=2)}

RECOMMENDED CARS (Ranked 1-4):
{json.dumps(cars_summary, indent=2)}

USER MESSAGE: {user_message}

RESPONSE FORMAT (First Message):
Write exactly 2 small-medium paragraphs:

Paragraph 1: Warm welcome + explain WHY these cars match their lifestyle
- Reference their top 2-3 lifestyle traits (e.g., "family_friendly: 8/10, eco_conscious: 7/10")
- Explain how the recommendations align with these traits
- Keep it personal and friendly (4-5 sentences)

Paragraph 2: Introduce the top recommendations briefly
- Mention top 2-3 cars with key specs (price, MPG, seating)
- Highlight what makes each unique
- NO percentages or match scores in text
- Invite them to ask questions (3-4 sentences)

RULES:
- DO reference their lifestyle scores: "your strong family_friendly (8/10)"
- DON'T mention match percentages or scores: "94% match" ❌
- DO use specific numbers: price, MPG, HP, seating ✅
- DON'T be overly formal: "I'd be delighted to assist" ❌
- DO be warm but natural: "Based on your profile..." ✅

EXAMPLE:
"Welcome! I've analyzed your profile and found some excellent matches for you. With your strong family_friendly (8/10) and eco_conscious (7/10) priorities, I focused on vehicles that balance practicality, efficiency, and reliability. These cars offer the space and safety features families need while keeping fuel costs low.

Your top recommendations are the Toyota RAV4 Hybrid ($35k, 40 MPG, 5 seats) which combines Toyota's legendary reliability with excellent fuel economy, the Honda CR-V ($33k, 30 MPG, 5 seats) offering more cargo space for growing families, and the Mazda CX-5 ($32k, 28 MPG, 5 seats) if you want a sportier driving experience. Feel free to ask about any specific features or cars you're curious about!"
"""
        else:
            # Follow-up messages: Concise and direct (2-3 sentences)
            context = f"""You are a car recommendation expert. Give brief, helpful responses.

USER PROFILE:
{json.dumps(lifestyle_profile, indent=2)}

RECOMMENDED CARS (Ranked 1-4):
{json.dumps(cars_summary, indent=2)}

RECENT CONVERSATION:
{json.dumps(session['conversation_history'][-3:], indent=2)}

USER MESSAGE: {user_message}

RESPONSE RULES:
1. BREVITY: 2-3 sentences only
2. SPECIFICS: Use numbers (MPG, price, HP, seating)
3. PERSONALIZATION: Reference their lifestyle scores when relevant
4. NO PERCENTAGES: Never mention match scores or percentages
5. FORMAT:
   - General question → Quick overview + top pick
   - Specific car → Why it fits THEM + key specs + 1 pro/con
   - Comparison → Key differences with numbers
6. TONE: Friendly but direct

EXAMPLES:

"The RAV4 Hybrid is perfect for your family_friendly (8/10) needs with 5 seats, 40 MPG, and $35k. It offers Toyota's reliability plus excellent fuel economy for daily driving and weekend trips."

"All four recommendations include advanced safety features. The RAV4 leads with Toyota Safety Sense 2.5+ standard, while the CR-V offers Honda Sensing at a lower $33k price point."

"The BMW X3 matches your luxury (9/10) preference with premium materials and tech. 300 HP, 25 MPG, $45k. Pro: Sporty handling. Con: Higher maintenance than Japanese brands."
"""
        
        # Get AI response from Ollama
        print("🤖 Calling Ollama for AI response...")
        
        # First message gets more tokens for detailed response
        max_tokens = 400 if is_first_message else 150
        
        ai_response = ollama_service.generate_response(
            prompt=context,
            conversation_history=session['conversation_history'][-3:],
            max_tokens=max_tokens
        )
        
        # Safety filter: Remove any match percentages/scores that AI might generate
        import re
        # Remove patterns like "94% match", "#1 match", "57.14% match", etc.
        ai_response = re.sub(r'\(#\d+,?\s*\d+\.?\d*%\s*match\)', '', ai_response)
        ai_response = re.sub(r'#\d+,?\s*\d+\.?\d*%\s*match', '', ai_response)
        ai_response = re.sub(r'\d+\.?\d*%\s*match', '', ai_response)
        ai_response = re.sub(r'#\d+\s*match', '', ai_response)
        # Clean up extra spaces
        ai_response = re.sub(r'\s+', ' ', ai_response).strip()
        
        print(f"✓ AI responded: {ai_response[:50]}...")
        
        # Add AI response to history
        session['conversation_history'].append({
            "role": "assistant",
            "content": ai_response
        })
        
        # Update recommended cars for this session
        session['recommended_cars'] = matched_cars
        
        print("✓ Response ready, sending to frontend")
        print("="*60 + "\n")
        
        return jsonify({
            "success": True,
            "response": ai_response,
            "recommended_cars": matched_cars  # Return all 4 recommendations with scores
        })
        
    except Exception as e:
        print(f"❌ Error in chat endpoint: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Backend error. Check if Ollama is running: 'ollama serve'"
        }), 500


@app.route('/api/cars/compare', methods=['POST'])
def compare_cars():
    """
    Compare multiple cars side by side
    Expected payload: { "car_ids": ["car1", "car2", "car3"] }
    """
    try:
        data = request.get_json()
        car_ids = data.get('car_ids', [])
        
        comparison = car_matcher.compare_cars(car_ids)
        
        return jsonify({
            "success": True,
            "comparison": comparison
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/cars/<car_id>/estimate', methods=['POST'])
def get_cost_estimate(car_id):
    """
    Get detailed cost estimates for a specific car
    Expected payload: { "trade_in_value": 5000, "down_payment": 3000, "loan_term": 60 }
    """
    try:
        data = request.get_json()
        trade_in = data.get('trade_in_value', 0)
        down_payment = data.get('down_payment', 0)
        loan_term = data.get('loan_term', 60)
        
        car = car_matcher.get_car_by_id(car_id)
        if not car:
            return jsonify({
                "success": False,
                "error": "Car not found"
            }), 404
        
        # Calculate financing
        price = car['basic_info']['msrp']
        loan_amount = price - trade_in - down_payment
        interest_rate = 0.065  # 6.5% average APR
        
        monthly_payment = (loan_amount * (interest_rate / 12) * 
                          (1 + interest_rate / 12) ** loan_term) / \
                         ((1 + interest_rate / 12) ** loan_term - 1)
        
        total_cost = monthly_payment * loan_term + down_payment
        total_interest = total_cost - price + trade_in
        
        estimate = {
            "car": {
                "make": car['basic_info']['make'],
                "model": car['basic_info']['model'],
                "msrp": price
            },
            "financing": {
                "down_payment": down_payment,
                "trade_in_value": trade_in,
                "loan_amount": round(loan_amount, 2),
                "interest_rate": interest_rate,
                "loan_term_months": loan_term,
                "monthly_payment": round(monthly_payment, 2),
                "total_interest": round(total_interest, 2),
                "total_cost": round(total_cost, 2)
            },
            "annual_costs": {
                "insurance": car['costs']['insurance_annual_estimate'],
                "maintenance": car['costs']['maintenance_annual_estimate'],
                "fuel_estimate": round(15000 / car['specifications']['mpg_combined'] * 3.50, 2)
            }
        }
        
        return jsonify({
            "success": True,
            "estimate": estimate
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    # Run Flask development server
    app.run(debug=True, host='0.0.0.0', port=5000)
