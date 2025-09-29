# HyperLearner

A smart learning platform that connects teachers and students with AI-powered learning materials, progress tracking, and personalized assignments.

## 🚀 Quick Start for New Team Members

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hyper-learner
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the project root with these variables:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.oheabnzqngbcugvzkykd:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider (optional - app works without AI)
# AI_PROVIDER="openai"
# AI_API_KEY="your-ai-api-key"

# Google OAuth (optional)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**⚠️ Important**: Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

### 4. Set Up the Database
```bash
# Push schema to database (creates tables)
npx prisma db push --skip-generate

# Generate Prisma client (may take a moment with Supabase)
npx prisma generate

# Seed the database with demo data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Demo Accounts

After seeding, use these accounts to test the app:

- **Teacher**: `teacher@example.com` / `password123`
- **Student 1**: `student1@example.com` / `password123`  
- **Student 2**: `student2@example.com` / `password123`

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── teacher/           # Teacher dashboard and features
│   ├── student/           # Student dashboard and features
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── teacher/           # Teacher-specific components
│   ├── student/           # Student-specific components
│   └── providers/         # Context providers
├── lib/                   # Utility functions
│   ├── ai/                # AI provider and utilities
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   ├── grade.ts           # Grade level utilities
│   ├── reading.ts         # Reading time calculations
│   └── homework.ts        # Homework utilities
└── prisma/                # Database schema and migrations
```

## 🎨 Features

### For Teachers
- **Class Management**: Create classes and enroll students
- **Material Upload**: Upload PDF readings and homework assignments
- **AI-Powered Analysis**: Automatic content analysis and time estimation
- **Task Creation**: Create assignments with due dates and grade levels
- **Analytics**: Track student progress and completion rates

### For Students
- **Task Dashboard**: View assigned tasks with progress tracking
- **Smart Reading**: Chunked reading with progress bars and time estimates
- **Interactive Homework**: Question-by-question progress with hints
- **Accessibility**: Young Reader mode, dyslexia-friendly fonts, and high contrast options

### AI Features
- **Content Analysis**: Automatic text extraction and word counting
- **Time Estimation**: Grade-adjusted reading and homework time calculations
- **Smart Chunking**: Break reading materials into digestible chunks
- **Question Detection**: Automatically identify homework questions
- **Study Guides**: AI-generated summaries and vocabulary lists

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:seed          # Seed database with demo data
npm run db:reset         # Reset database and reseed
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create and apply migrations

# Code Quality
npm run lint             # Run ESLint
```

## 🐛 Troubleshooting

### Prisma Generate Hangs
If `npx prisma generate` hangs (common with Supabase):
```bash
# Try with timeout
timeout 30 npx prisma generate

# Or skip connection validation
npx prisma generate --no-engine
```

### Database Connection Issues
1. Check your `.env` file has the correct DATABASE_URL
2. Verify your Supabase password is correct
3. Ensure your IP is whitelisted in Supabase

### Missing Components
If you get "Module not found" errors:
```bash
# Add missing shadcn/ui components
npx shadcn@latest add [component-name]
```

## 🚀 Deployment

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="secure-random-string"
NEXTAUTH_URL="https://your-domain.com"
AI_API_KEY="your-ai-api-key"
```

### Database Setup
1. Create production database
2. Run migrations: `npx prisma migrate deploy`
3. Seed data: `npm run db:seed`

## 📚 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Authentication**: NextAuth.js with email/password and Google OAuth
- **Database**: Prisma ORM with PostgreSQL (Supabase)
- **Storage**: Supabase Storage for PDF files
- **AI**: Configurable AI provider (OpenAI, Anthropic, Azure)
- **PDF Processing**: pdf-parse for server-side text extraction

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

- **Issues**: Create an issue in the repository
- **Documentation**: Check this README and inline code comments
- **Team Chat**: Ask in your team's communication channel