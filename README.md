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

- **UI/UX**
  - Responsive design
  - Smooth animations with Framer Motion
  - Modern UI components
  - Dark mode support
  - Interactive heatmaps and progress charts

## Project Structure

```
ascend/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── auth/              # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components
│   ├── dashboard/        # Dashboard components
│   └── auth/             # Authentication components
├── contexts/             # React contexts
├── lib/                  # Utility functions
├── public/               # Static assets
└── styles/              # Global styles
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

3. **Create a Supabase project**
   - Go to [Supabase](https://supabase.com) and create a new project
   - Get your project URL and anon key from the project settings (Settings > API)

4. **Set up environment variables**
   - Create a `.env.local` file in the root directory
   - Add the following environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. **Set up the database schema**
   - Go to the SQL Editor in your Supabase dashboard
   - Create a new query
   - Copy the contents of `supabase-schema.sql` and paste them into the query editor
   - Run the query to create the necessary tables, functions, and triggers

6. **Configure Google OAuth (optional)**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project and set up OAuth credentials
   - Configure the redirect URI as `https://your-project-ref.supabase.co/auth/v1/callback`
   - Add your Google client ID and secret to Supabase (Authentication > Providers > Google)

7. **Set up Python environment for transcript generation**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install youtube_transcript_api
   ```

8. **Run the development server**
   ```bash
   npm run dev
   ```

9. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- **Frontend**
  - Next.js 15
  - React
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - Shadcn UI

- **Backend**
  - Supabase (Authentication, Database)
  - Python (Transcript generation)
  - YouTube Transcript API

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
# DevClash-Ascend
