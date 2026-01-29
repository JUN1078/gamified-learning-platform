# LearnHub - Advanced Gamification Platform 🎮

A next-generation learning platform with comprehensive gamification features including character development, peer assessment, expedition maps, and trading card collection systems.

## Features ✨

### Phase 1 (Implemented)
- **12-Attribute Radar Chart**: Multi-dimensional character stat system
- **Expedition Map System**: 5 mountains representing core values (A.R.I.S.E.)
- **Trading Card Collection**: Digital collectible cards with rarity tiers
- **Advanced Badge System**: Bronze, Silver, Gold tiers with progression

### Phase 2 (Coming Soon)
- Peer Assessment & Review Dashboard
- Drag-and-Drop Card Assignment
- Mountain Checkpoint System
- Bite-sized Learning Modules

### Phase 3 (Planned)
- 3D Map Animations
- Trading Card Marketplace
- Team-based Expeditions
- AI-Powered Recommendations

## Tech Stack 🛠️

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Recharts (radar charts)
- React DnD (drag and drop)
- Zustand (state management)
- React Router (navigation)

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- RESTful API

## Getting Started 🚀

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or cloud)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd gamification
```

2. Install all dependencies
```bash
npm run install:all
```

3. Set up environment variables
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

4. Start MongoDB (if running locally)
```bash
mongod
```

5. Run the development servers
```bash
# From root directory
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure 📁

```
gamification/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── character/   # Character & radar chart
│   │   │   ├── expedition/  # Mountain map
│   │   │   ├── cards/       # Trading cards
│   │   │   ├── badges/      # Badge system
│   │   │   ├── shared/      # Shared components
│   │   │   └── layout/      # Layout components
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Zustand state stores
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # Global styles
│   └── public/              # Static assets
│
├── backend/                 # Express + TypeScript backend
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Entry point
│   └── dist/                # Compiled JavaScript
│
└── package.json             # Root workspace config
```

## API Endpoints 🔌

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Character
- `GET /api/character/attributes` - Get character attributes
- `PUT /api/character/attributes` - Update attributes
- `GET /api/character/avatar` - Get avatar customization
- `PUT /api/character/avatar` - Update avatar

### Mountains/Expedition
- `GET /api/mountains/progress` - Get mountain progress
- `POST /api/mountains/checkpoint` - Complete checkpoint
- `GET /api/mountains/:id` - Get specific mountain

### Cards
- `GET /api/cards/collection` - Get user's card collection
- `POST /api/cards/assign` - Assign card to peer
- `GET /api/cards/available` - Get available cards

### Badges & Achievements
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/timeline` - Get achievement history
- `GET /api/badges` - Get user badges

### Peer Review (Phase 2)
- `POST /api/peer-review/submit` - Submit peer review
- `GET /api/peer-review/pending` - Get pending reviews

## Character Attributes 🎯

The 12-point radar chart tracks:

1. **Leadership** - Ability to guide and inspire
2. **Creativity** - Innovative thinking
3. **Communication** - Clear expression
4. **Teamwork** - Collaboration skills
5. **Problem-Solving** - Analytical thinking
6. **Innovation** - Forward-thinking ideas
7. **Adaptability** - Flexibility in change
8. **Technical Skills** - Domain expertise
9. **Critical Thinking** - Logical reasoning
10. **Empathy** - Understanding others
11. **Resilience** - Perseverance
12. **Strategic Thinking** - Long-term planning

## ARISE Mountains 🏔️

The expedition map features 5 mountains:

1. **Aggressive** - The Driving Force
2. **Respect** - The Heart of the Team
3. **Innovative** - The Visionary
4. **Swift** - The Quick Adaptor
5. **Empowered** - The Independent Spirit

## Card Rarity Tiers 💎

- **Common** (Gray) - Basic attribute cards
- **Rare** (Blue) - Advanced skill cards
- **Epic** (Purple) - Mastery achievement cards
- **Legendary** (Gold) - Ultimate "Master of..." cards

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License.

## Support 💬

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ for next-generation learning experiences
