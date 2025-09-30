# CarConvo Backend

Flask-based backend API with AI-powered car recommendations using Ollama (Llama3).

## Features

- **AI Conversations**: Natural language interaction using Ollama Llama3
- **Personality Test**: Lifestyle assessment to understand user preferences
- **Smart Matching**: Intelligent car recommendation algorithm
- **Cost Estimation**: Financing, insurance, and maintenance calculations
- **Comparison**: Side-by-side vehicle comparisons

## Prerequisites

- Python 3.9 or higher
- [Ollama](https://ollama.ai) installed and running
- Llama3 model pulled in Ollama

## Setup Instructions

### 1. Install Ollama

Download and install Ollama from [https://ollama.ai](https://ollama.ai)

### 2. Pull the Llama3 Model

```bash
ollama pull llama3
```

### 3. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Alternatively, use a virtual environment (recommended):

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Run the Flask Server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and Ollama connection status.

### Personality Test
```
GET /api/personality/questions
```
Get all personality test questions.

```
POST /api/personality/analyze
Body: { "answers": { "q1": "option_a", "q2": "option_b", ... } }
```
Analyze answers and create a session with lifestyle profile.

### Conversational Chat
```
POST /api/chat
Body: { "session_id": "...", "message": "...", "budget": 35000 }
```
Chat with AI assistant and get car recommendations.

### Car Comparison
```
POST /api/cars/compare
Body: { "car_ids": ["toyota_rav4_2024", "mazda_cx5_2024"] }
```
Compare multiple cars side by side.

### Cost Estimation
```
POST /api/cars/<car_id>/estimate
Body: { "trade_in_value": 5000, "down_payment": 3000, "loan_term": 60 }
```
Get detailed cost breakdown including financing.

## Project Structure

```
backend/
├── app.py                          # Main Flask application
├── services/
│   ├── __init__.py
│   ├── ollama_service.py          # Ollama AI integration
│   ├── car_matcher.py             # Car matching algorithm
│   └── personality_analyzer.py    # Personality test logic
├── data/
│   ├── cars.json                  # Car database
│   └── personality_questions.json # Personality test questions
├── requirements.txt               # Python dependencies
└── README.md                      # This file
```

## Configuration

### Ollama Configuration

By default, the service connects to Ollama at `http://localhost:11434`. To change this:

```python
# In app.py
ollama_service = OllamaService(
    model="llama3",
    base_url="http://your-ollama-host:11434"
)
```

### Car Data

The car database is located in `data/cars.json` with 100+ vehicles pre-loaded.

## Development

### Code Style

This project follows PEP 8 guidelines. Format code with:

```bash
black .
flake8 .
```

### Testing

```bash
pytest
```

## Troubleshooting

**Ollama connection errors:**
- Ensure Ollama is running: `ollama serve`
- Verify model is available: `ollama list`
- Check model is pulled: `ollama pull llama3`

**CORS errors:**
- Flask-CORS is enabled for all origins in development
- In production, configure specific origins

## License

MIT License
