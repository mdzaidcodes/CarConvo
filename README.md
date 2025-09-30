# CarConvo - AI-Powered Car Recommendation System

An intelligent, conversational car recommendation platform that uses natural language processing to understand your lifestyle and match you with your perfect vehicle.

![CarConvo](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

### Core Functionality
- **Personality Assessment**: Interactive questionnaire to understand your driving lifestyle
- **Natural Language Chat**: Conversational AI powered by Ollama (Llama3)
- **Smart Matching**: Intelligent algorithm matching cars to your lifestyle profile (100+ diverse vehicles)
- **Match Scoring**: Advanced multi-criteria scoring system


## Architecture

```
CarConvo/
├── frontend/          # Next.js + TypeScript + Tailwind CSS
│   ├── app/          # Pages (home, personality test, chat)
│   ├── components/   # Reusable UI components
│   └── lib/          # API client & state management
│
├── backend/          # Flask + Python + Ollama
│   ├── services/     # Business logic (AI, matching, analysis)
│   ├── data/         # JSON databases (cars, questions)
│   └── app.py        # Main API server
│
└── README.md         # This file
```

## Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Python 3.9+** installed
- **Node.js 18+** and npm installed
- **Ollama** installed ([Download here](https://ollama.ai))
- **Llama3** model pulled in Ollama

### Step 1: Setup Ollama & AI Model

```bash
# Install Ollama (if not already installed)
# Visit https://ollama.ai for installation instructions

# Pull the Llama3 model
ollama pull llama3

# Start Ollama (if not already running)
ollama serve
```

### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

Backend will be available at `http://localhost:5000`

### Step 3: Setup Frontend

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Step 4: Start Using CarConvo!

1. Open your browser to `http://localhost:3000`
2. Click "Start Your Journey"
3. Complete the personality test (10 questions)
4. Chat with the AI assistant
5. Receive personalized car recommendations!

## Project Structure

### Backend (`/backend`)

```
backend/
├── app.py                          # Flask application & API endpoints
├── services/
│   ├── ollama_service.py          # AI inference via Ollama
│   ├── car_matcher.py             # Matching algorithm
│   └── personality_analyzer.py    # Personality test logic
├── data/
│   ├── cars.json                  # Car database (10 vehicles)
│   └── personality_questions.json # Test questions
├── requirements.txt               # Python dependencies
└── README.md                      # Backend documentation
```

### Frontend (`/frontend`)

```
frontend/
├── app/
│   ├── page.tsx                   # Landing page
│   ├── personality-test/page.tsx  # Interactive test
│   ├── chat/page.tsx              # Conversational interface
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── components/
│   ├── CarCard.tsx                # Car display component
│   └── ProfileSummary.tsx         # User profile widget
├── lib/
│   ├── api.ts                     # API service layer
│   └── store.ts                   # Zustand state management
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md                      # Frontend documentation
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Framework**: Flask
- **Language**: Python 3.9+
- **AI**: Ollama (deepseek-r1:8b)
- **CORS**: Flask-CORS
- **Data**: JSON file storage

## Car Data Structure

Cars are stored in `backend/data/cars.json` with the following structure:

```json
{
  "id": "unique_id",
  "basic_info": {
    "make": "Toyota",
    "model": "RAV4",
    "msrp": 35000,
    "body_type": "SUV"
  },
  "specifications": {
    "horsepower": 203,
    "mpg_combined": 40,
    "seating_capacity": 5
  },
  "lifestyle_scores": {
    "family_friendly": 9,
    "adventure": 7,
    "eco_conscious": 9,
    "luxury": 6,
    "performance": 5,
    "budget_conscious": 8,
    "city_driving": 8,
    "commuter": 9,
    "tech_enthusiast": 7,
    "safety_focused": 9
  },
  "features": {
    "safety": [...],
    "technology": [...],
    "comfort": [...],
    "entertainment": [...]
  },
  "costs": {
    "insurance_annual_estimate": 1650,
    "maintenance_annual_estimate": 450
  },
  "pros": [...],
  "cons": [...]
}
```

### Adding More Cars

1. Follow the structure above
2. Add to `backend/data/cars.json`
3. Assign lifestyle scores (1-10) for each dimension
4. Include comprehensive features, pros, and cons

## Lifestyle Dimensions

The personality test evaluates users across 10 dimensions:

| Dimension | Description |
|-----------|-------------|
| **Family Friendly** | Safety, space, practicality |
| **Adventure** | Off-road capability, AWD, durability |
| **Eco Conscious** | Fuel efficiency, hybrid/electric |
| **Luxury** | Premium features, comfort, brand |
| **Performance** | Horsepower, handling, acceleration |
| **Budget Conscious** | Price, maintenance costs, reliability |
| **City Driving** | Size, maneuverability, parking ease |
| **Commuter** | Fuel efficiency, comfort, tech features |
| **Tech Enthusiast** | Advanced tech, connectivity |
| **Safety Focused** | Safety ratings, driver assistance |

## API Endpoints

### Health Check
```
GET /api/health
```

### Personality Test
```
GET  /api/personality/questions
POST /api/personality/analyze
```

### Conversational Chat
```
POST /api/chat
```

### Car Operations
```
POST /api/cars/compare
POST /api/cars/<car_id>/estimate
```

See individual README files in `frontend/` and `backend/` for detailed API documentation.

## UI/UX Features

- **Gradient Themes**: Modern blue-purple color scheme
- **Smooth Animations**: Framer Motion transitions
- **Responsive Design**: Mobile-first approach
- **Glass Morphism**: Modern UI effects
- **Interactive Cards**: Hover and click animations
- **Progress Indicators**: Visual feedback
- **Loading States**: Skeleton screens and spinners

## Configuration

### Backend Configuration

Edit `backend/app.py` to customize:
- Ollama model
- API port
- CORS settings

### Frontend Configuration

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Edit `frontend/tailwind.config.js` for theme customization.

## Troubleshooting

### Backend Issues

**Ollama connection errors:**
```bash
# Check if Ollama is running
ollama list

# Restart Ollama
ollama serve

# Verify model is available
ollama pull llama3
```

**Port already in use:**
```bash
# Change port in app.py
app.run(port=5001)
```

### Frontend Issues

**Cannot connect to backend:**
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is enabled in Flask

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
```

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and saved profiles
- [ ] Dealership integration with live inventory
- [ ] Test drive scheduling
- [ ] Trade-in value calculator
- [ ] Advanced filtering and search
- [ ] Car comparison page (full view)
- [ ] Mobile app (React Native)
- [ ] Social sharing features
- [ ] Favorites and watchlist

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Development Notes

### Code Quality
- Comprehensive comments throughout codebase
- Type safety with TypeScript
- PEP 8 compliance for Python
- ESLint for JavaScript/TypeScript
- Modular architecture
- Error handling and validation

### Best Practices
- Component-based architecture
- Separation of concerns
- API service layer
- Centralized state management
- Responsive design patterns
- Accessibility considerations

## Support

For issues, questions, or contributions:
- Contact me at zaid.codes@outlook.com

---

**Built using Next.js, Flask, and Ollama AI**