  # Ascend Flow

  A personal growth companion application built with Next.js, Supabase, and Framer Motion. Ascend Flow helps users track their learning progress, manage roadmaps, and generate AI-powered notes from video content.

  ## Features

  - **Authentication & User Management**
    - Email/password authentication
    - Google OAuth integration
    - Protected routes and user profiles
    - Session management

  - **Learning Management**
    - Interactive roadmaps for structured learning
    - Progress tracking with visual indicators
    - Video content integration
    - AI-powered note generation from video transcripts
    - Learning graph visualization

  - **Content Features**
    - YouTube video integration
    - Automatic transcript generation
    - AI-powered note summarization
    - PDF export functionality
    - Interactive chat interface

  - **Gamification & Leaderboard**
    - Real-time leaderboard showing user rankings
    - Coin-based reward system
    - Automatic rank calculation and updates
    - Visual indicators for rank changes
    - Special styling for top performers
    - MongoDB integration for persistent storage

  - **Peer Pod Social Platform**
    - Post and share achievements, batches, and perks
    - Like and comment on posts
    - User profiles with avatars
    - Infinite scrolling feed
    - Image upload for batch certificates
    - Real-time interaction with the community

  - **UI/UX**
    - Responsive design
    - Smooth animations with Framer Motion
    - Modern UI components
    - Dark mode support
    - Interactive heatmaps and progress charts

  ## Project Structure

  ```
  ascend/
  ├── app/                        # Next.js app directory
  │   ├── api/                   # API routes
  │   │   ├── auth/             # Auth-related API endpoints
  │   │   ├── generate-roadmap/ # Roadmap generation endpoints
  │   │   ├── peerpod/          # Peer Pod social features API
  │   │   │   ├── posts/        # Post creation and listing
  │   │   │   └── posts/[id]/   # Post interactions (likes, comments)
  │   │   ├── profile/          # User profile endpoints
  │   │   ├── roadmaps/         # Roadmap management endpoints
  │   │   └── ...
  │   ├── dashboard/            # Dashboard pages
  │   │   ├── about/           # About page
  │   │   ├── analytics/       # Analytics and insights
  │   │   ├── community/       # Community features
  │   │   ├── create/          # Roadmap creation
  │   │   ├── leaderboard/     # User rankings
  │   │   ├── learning/        # Learning progress
  │   │   ├── peerpod/         # Peer Pod social platform
  │   │   ├── roadmap/         # Individual roadmap view
  │   │   ├── settings/        # User settings
  │   │   ├── weeklyprogress/  # Weekly progress tracking
  │   │   └── page.tsx         # Main dashboard
  │   ├── auth/                # Authentication pages
  │   └── layout.tsx           # Root layout
  ├── backend/                  # Backend utilities
  │   └── pdf-syllabus.py      # PDF syllabus processing
  ├── components/               # React components
  │   ├── ui/                  # UI components (buttons, cards, etc.)
  │   ├── dashboard/           # Dashboard-specific components
  │   ├── auth/                # Authentication components
  │   ├── learning-timer.tsx   # Learning timer component
  │   ├── profile-menu.tsx     # User profile menu
  │   ├── theme-toggle.tsx     # Dark/light mode toggle
  │   └── ...
  ├── contexts/                 # React contexts
  │   ├── auth-context.tsx     # Authentication context
  │   └── ...
  ├── lib/                      # Utility functions
  │   ├── gemini.ts            # Gemini AI integration
  │   ├── mongodb.ts           # MongoDB connection utilities
  │   ├── supabase.ts          # Supabase client setup
  │   └── ...
  ├── models/                   # MongoDB schemas
  │   ├── Post.ts              # Peer Pod post schema
  │   ├── Roadmap.ts           # Roadmap schema
  │   ├── User.ts              # User schema
  │   └── ...
  ├── public/                   # Static assets
  └── styles/                  # Global styles
  ```

  ## Setup Instructions

  1. **Clone the repository**
    ```bash
    git clone <repository-url>
    cd ascend
    ```

  2. **Install dependencies**
    ```bash
    npm install
    ```

  3. **Set up environment variables**
    - Create a `.env.local` file in the root directory
    - Add the following environment variables:
      ```
      NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
      MONGODB_URI=your_mongodb_connection_string
      NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
      GEMINI_API_KEY=your_gemini_api_key
      ```

  4. **Set up the database schema**
    - Go to the SQL Editor in your Supabase dashboard
    - Create a new query
    - Copy the contents of `supabase-schema.sql` and paste them into the query editor
    - Run the query to create the necessary tables, functions, and triggers

  5. **Configure Google OAuth (optional)**
    - Go to the [Google Cloud Console](https://console.cloud.google.com/)
    - Create a new project and set up OAuth credentials
    - Configure the redirect URI as `https://your-project-ref.supabase.co/auth/v1/callback`
    - Add your Google client ID and secret to Supabase (Authentication > Providers > Google)

  6. **Set up Python environment for transcript generation**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    pip install youtube_transcript_api python-docx cohere
    ```

  7. **Run the development server**
    ```bash
    npm run dev
    ```

  8. **Access the application**
    - Open [http://localhost:3000](http://localhost:3000) in your browser

  ## Technologies Used

  - **Frontend**
    - Next.js 15
    - React
    - TypeScript
    - Tailwind CSS
    - Framer Motion
    - Shadcn UI
    - React Intersection Observer

  - **Backend**
    - Supabase (Authentication, Database)
    - MongoDB (Leaderboard, Roadmaps, Posts)
    - Python (Transcript generation, PDF processing)
    - YouTube Transcript API
    - Gemini AI API

  - **Development Tools**
    - ESLint
    - Prettier
    - TypeScript
    - Git

  ## Contributing

  1. Fork the repository
  2. Create your feature branch (`git checkout -b feature/amazing-feature`)
  3. Commit your changes (`git commit -m 'Add some amazing feature'`)
  4. Push to the branch (`git push origin feature/amazing-feature`)
  5. Open a Pull Request

  ## License

  This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

  ## Support

  For support, please open an issue in the GitHub repository or contact the maintainers.
