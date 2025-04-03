# Professional Network Search Frontend

A conversational frontend for searching through résumés and professional profiles. This application integrates with the Professional Network Search backend to provide a chat-based interface for exploring candidate profiles.

## Features

- 💬 **Conversational Search Interface**: Chat-like experience for natural language queries
- 🔄 **Iterative Refinement**: Ask follow-up questions to refine your search
- 📋 **Rich Résumé Display**: View candidate profiles with expandable sections
- 🎨 **Dark/Light Mode**: Theme support for different viewing preferences
- 🔍 **Highlighted Matches**: Visual emphasis on relevant search terms
- 👍 **Feedback System**: Rate search results to improve future searches

## Getting Started

### Prerequisites

- Node.js 18 or later
- Backend API running (Professional Network Search Backend)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd professional-network-frontend
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set environment variables
   Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   (Adjust the URL to match your backend API endpoint)

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Building for Production

```bash
npm run build
# or
yarn build
```

## Usage

1. Visit `http://localhost:3000` in your browser
2. Type a query in the search box (e.g., "Find software engineers with React experience")
3. Browse the matching profiles
4. Ask follow-up questions to refine your search

## API Integration

This frontend connects to the Professional Network Search backend API. Key endpoints:

- `/search`: Initial query for profiles
- `/refine`: Refine search based on previous results
- `/feedback`: Submit feedback on search results
- `/profiles/{id}`: Get detailed profile information
- `/profiles/upload`: Upload new résumés

## Project Structure

```
/professional-network-frontend
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   ├── ResumeCard.tsx      # Profile display card
│   ├── MessageBubble.tsx   # Chat message bubble
│   └── ...                 # Other components
├── hooks/                  # Custom React hooks
│   └── useSearchSession.ts # Conversation state management
├── lib/                    # Utilities and helpers
│   ├── api.ts              # API client functions
│   └── utils.ts            # Helper functions
├── types/                  # TypeScript type definitions
└── public/                 # Static files
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint# mvp-frontend
