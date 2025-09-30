# CarConvo Frontend

Modern Next.js frontend with beautiful UI/UX for the CarConvo car recommendation system.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **Axios** - API communication

## Features

- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Mobile Responsive**: Works seamlessly on all devices
- **Interactive Personality Test**: Engaging questionnaire flow
- **Real-time Chat**: Natural conversation with AI assistant
- **Car Recommendations**: Visual car cards with detailed information
- **Profile Management**: Track and display user preferences

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running on `http://localhost:5000`

### Installation

1. **Install dependencies:**

```bash
cd frontend
npm install
```

2. **Configure environment variables:**

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` if your backend is running on a different port:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx                 # Home/Landing page
│   ├── personality-test/
│   │   └── page.tsx            # Personality test page
│   ├── chat/
│   │   └── page.tsx            # Chat interface page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── CarCard.tsx             # Car display component
│   └── ProfileSummary.tsx      # User profile widget
├── lib/
│   ├── api.ts                  # API service layer
│   └── store.ts                # Zustand state management
├── public/                     # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Key Components

### Home Page (`/`)
- Hero section with call-to-action
- Feature highlights
- Responsive design with animations

### Personality Test (`/personality-test`)
- 10-question interactive assessment
- Progress tracking
- Smooth transitions between questions
- Results analysis and session creation

### Chat Interface (`/chat`)
- Real-time messaging with AI
- Budget input functionality
- Car recommendations sidebar
- User profile summary
- Responsive chat bubbles

### CarCard Component
- Two display modes: compact and full
- Image with fallback
- Key specifications display
- Match score visualization
- Pros/cons listing

### ProfileSummary Component
- Top 3 lifestyle priorities
- Visual progress bars
- Collapsible dropdown

## Styling

The app uses Tailwind CSS with custom configurations:

- **Custom Colors**: Blue and purple gradient theme
- **Animations**: Fade-in, slide-up, slide-down
- **Responsive**: Mobile-first approach
- **Custom Classes**: `.btn-primary`, `.btn-secondary`, `.card-hover`, `.glass`

## State Management

Zustand store manages:
- Session ID and lifecycle
- Lifestyle profile data
- Budget preferences
- Conversation messages
- Car recommendations
- Selected cars for comparison
- Loading states

## API Integration

All API calls are centralized in `lib/api.ts`:
- Health check
- Personality questions
- Answer analysis
- Chat messages
- Car comparisons
- Cost estimates

## Customization

### Changing Theme Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom color palette
      }
    }
  }
}
```

### Adding New Pages

1. Create a new folder in `app/`
2. Add `page.tsx` for the route
3. Update navigation as needed

### Modifying API Endpoints

Edit `lib/api.ts` to add or modify API functions.

## Troubleshooting

**Backend Connection Issues:**
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is enabled in Flask

**Build Errors:**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Image Loading Issues:**
- Images from Unsplash require internet connection
- Fallback icons display if images fail

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Update environment variables in Vercel dashboard to point to your production backend.

## Best Practices

- TypeScript for type safety
- Component composition and reusability
- Centralized API calls
- Global state management
- Responsive design
- Accessibility considerations
- Error handling
- Loading states

## License

MIT License
