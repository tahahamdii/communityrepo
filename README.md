# FanZone Frontend

A modern React/Next.js frontend for the FanZone sports fan community platform.

## Features

- **User Authentication** - Login and registration with JWT tokens
- **News Feed** - Personalized feed based on favorite teams
- **Fan Groups** - Join and create groups for teams and sports
- **Live Polls** - Create and vote on polls with real-time results
- **Rankings** - Global and group-based user rankings
- **Real-time Chat** - Live chat in group discussions
- **Search** - Search for users, groups, and posts
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Real-time**: Socket.IO client
- **Authentication**: JWT tokens with localStorage
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- FanZone backend running (see backend README)

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd fanzone-frontend
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
Create a `.env.local` file:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── chat/             # Chat components
│   ├── groups/           # Group-related components
│   ├── layout/           # Layout components
│   ├── polls/            # Poll components
│   ├── posts/            # Post components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
│   ├── auth-provider.tsx # Authentication context
│   └── socket.ts         # Socket.IO client
└── hooks/                # Custom React hooks
\`\`\`

## Key Features

### Authentication
- JWT-based authentication
- Persistent login with localStorage
- Protected routes with middleware

### Real-time Features
- Live chat in groups using Socket.IO
- Real-time poll updates
- Typing indicators in chat

### Responsive Design
- Mobile-first approach
- Adaptive navigation
- Touch-friendly interfaces

### Performance
- Next.js App Router for optimal performance
- Image optimization
- Code splitting and lazy loading

## API Integration

The frontend integrates with the FanZone backend API:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Posts**: `/api/posts/*`
- **Groups**: `/api/groups/*`
- **Polls**: `/api/polls/*`
- **Rankings**: `/api/rankings/*`
- **Search**: `/api/search/*`
- **Moderation**: `/api/moderation/*`

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (required)

## Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
\`\`\`

This completes the full FanZone frontend project! The application includes:

## ✅ **Complete Features:**

1. **Authentication System** - Login/register with JWT
2. **News Feed** - Personalized posts from favorite teams
3. **Fan Groups** - Create, join, and manage groups
4. **Live Polls** - Create and vote with real-time results
5. **Rankings** - Global leaderboards and user stats
6. **Real-time Chat** - Socket.IO powered group chat
7. **Search** - Find users, groups, and posts
8. **User Profiles** - View and edit profiles
9. **Responsive Design** - Works on all devices
10. **Settings** - Manage account preferences

## 🚀 **Ready to Deploy:**

The frontend is production-ready and can be deployed to Vercel, Netlify, or any hosting platform that supports Next.js. Just make sure to:

1. Set the `NEXT_PUBLIC_API_URL` environment variable to your backend URL
2. Run `npm run build` to create the production build
3. Deploy the built application

The frontend will automatically connect to your backend API and provide a complete sports fan community experience!
