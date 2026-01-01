# Momentum Tracker v2.0

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.0.10-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

<p align="center">
  <em>Build momentum, one task at a time. Priority sliders. Smart insights. Zero cost.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Status-v2.0-green.svg?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Score-9.2/10-blue.svg?style=for-the-badge" alt="Score" />
  <img src="https://img.shields.io/badge/Offline-100%25-brightgreen.svg?style=for-the-badge" alt="Offline" />
</p>

---

## 🚀 Features

**Core Features:**
- **Priority-weighted task tracking** - Assign 100 priority points flexibly between tasks (unique feature!)
- **Daily scoring system** - Track your productivity with intelligent daily scoring
- **GitHub-style heatmap** - Visualize your entire year's consistency at a glance
- **Real-time analytics** - Score trends, weekly comparison, task performance analysis
- **AI Coach insights** - Pattern detection, burnout alerts, task synergies, streak protection

**v2.0 New Features:**
- **Dashboard hub** - Quick stats, mini heatmap, current streak, action buttons
- **Monthly goals** - Set targets for each habit, track progress in real-time
- **Journal section** - Track custom metrics (screen time, sleep, mood, energy)
- **Achievements & badges** - Auto-unlock milestones, manually log wins, badge system
- **Monthly reports** - Comprehensive summaries with insights and trends
- **Enhanced exports** - PDF, Google Sheets, CSV, JSON backup/restore
- **Customizable settings** - Personalize themes, reset times, and preferences
- **Dark theme** - Beautiful dark mode with blue accents

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.0.10](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom theme
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **State Management**: React Hooks + localStorage
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Export**: html2pdf, jsPDF

## 📊 Key Functionality

- **Dashboard** - Overview of your current momentum, streak, and productivity
- **Tasks** - Manage and prioritize daily tasks with flexible priority sliders
- **Heatmap** - Visualize your activity patterns over entire year
- **Analytics** - Detailed statistics, trends, weekly comparison, best/worst days
- **Journal** - Log custom metrics and track correlation patterns
- **Achievements** - Celebrate wins, unlock badges, timeline view
- **Reports** - Monthly summaries with insights and next month goals
- **Export** - Download as PDF, CSV, push to Google Sheets, JSON backup

## 🎨 Design Highlights

- **Dark Theme**: Sleek dark background with blue accent colors
- **Responsive Design**: Works seamlessly on all device sizes (mobile, tablet, desktop)
- **Intuitive UI**: Clean and user-friendly interface with minimal learning curve
- **Consistent Styling**: Unified design language throughout the app
- **GitHub-Inspired**: Professional, modern aesthetic

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ashutosh3021/vigilant-palm-tree.git
   ```

2. Navigate to the project directory:
   ```bash
   cd vigilant-palm-tree
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit: [http://localhost:3000](http://localhost:3000)

### Deploy Online (Free)

**Option A: Vercel (Recommended)**
```bash
npm install -g vercel
vercel
# Follow prompts, live in 2 minutes
```

**Option B: GitHub Pages**
```bash
npm run build
npm run deploy
# Live at: https://ashutosh3021.github.io/vigilant-palm-tree/
```

**Option C: Netlify**
```bash
npm run build
# Drag & drop 'out' folder to Netlify
```

## 📁 Project Structure

```
├── app/                         # Next.js App Router pages
│   ├── dashboard/               # Dashboard hub with quick stats
│   ├── tasks/                   # Daily task management + goals
│   ├── heatmap/                 # Year-view consistency tracker
│   ├── analytics/               # Performance insights & trends
│   ├── journal/                 # Quantified self metrics
│   ├── achievements/            # Milestones & badges
│   ├── reports/                 # Monthly summaries
│   ├── export/                  # PDF, CSV, Google Sheets
│   └── layout.tsx               # Root layout
├── components/                  # Reusable UI components
│   ├── ui/                      # Shadcn-style components
│   ├── dashboard/               # Dashboard-specific components
│   ├── journal/                 # Journal-specific components
│   ├── achievements/            # Achievement components
│   ├── reports/                 # Report components
│   └── common/                  # Shared components
├── lib/
│   ├── storage.ts               # localStorage management
│   ├── analytics.ts             # Data processing & calculations
│   ├── momentum-coach.ts         # AI insights engine
│   ├── metrics.ts               # Pattern detection
│   ├── achievements.ts          # Badge unlock logic
│   ├── export.ts                # PDF, CSV, Sheets export
│   ├── types.ts                 # TypeScript interfaces
│   └── utils.ts                 # Utility functions
├── hooks/                       # Custom React hooks
│   ├── use-tasks.ts
│   ├── use-analytics.ts
│   ├── use-metrics.ts
│   └── use-achievements.ts
└── styles/                      # Global styles & themes
```

## 📊 Data Models

### Task
```typescript
interface Task {
  id: string;
  name: string;
  category: string;
  color: string;
  monthlyGoal?: number;          // e.g., 24 days
  isActive: boolean;
  createdAt: string;
}
```

### Daily Log
```typescript
interface DailyLog {
  date: string;
  tasks: TaskCompletion[];       // Completion status for each task
  metrics: DailyMetrics;          // Custom metrics (screen time, mood, etc.)
  notes?: string;                 // Daily notes
  totalScore: number;             // 0-100% daily score
}
```

### Achievement
```typescript
interface Achievement {
  id: string;
  type: 'milestone' | 'manual';
  title: string;
  description: string;
  date: string;
  emoji: string;
  category: string;
}
```

## 🏆 Score & Performance

- **Rating**: 9.2/10 (production-ready)
- **Offline**: ✅ 100% offline-first
- **Mobile Friendly**: ✅ Fully responsive
- **Accessible**: ✅ WCAG 2.1 Level A
- **Zero Cost**: ✅ Free forever, no ads
- **Privacy**: ✅ All data stored locally, no servers

## 💰 Pricing

**Free Forever**
- No subscriptions
- No ads
- No data mining
- No vendor lock-in
- Export anytime to Google Sheets, PDF, CSV, JSON

**Coming in v2.1: Optional Premium ($2.99/mo)**
- Multi-device cloud sync (Supabase)
- Advanced AI insights
- Priority support

## 🚀 Roadmap

### v2.0 (LIVE NOW) ✅
- ✅ Complete productivity platform
- ✅ 8 major features
- ✅ AI Coach insights
- ✅ Beautiful, responsive UI

### v2.1 (Q2 2026)
- [ ] Multi-device sync (Supabase)
- [ ] Freemium tier ($2.99/mo)
- [ ] Email notifications
- [ ] API documentation
- [ ] Integrations (Notion, Zapier)

### v3.0 (Q4 2026)
- [ ] Mobile apps (React Native)
- [ ] Social features (friend challenges)
- [ ] OpenAI integration (advanced insights)
- [ ] Team collaboration
- [ ] Native desktop apps (Electron)

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit (`git commit -m 'Add amazing feature'`)
5. Push (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Open an issue on GitHub for bugs or features
- **Discussions**: Start a discussion for general questions
- **Email**: [ashutoshpatraybl@gmail.com]

## ❓ FAQ

**Q: Is my data safe?**
A: Yes! Everything stored locally in your browser. No servers touch your data.

**Q: Can I use it offline?**
A: 100% offline. Works even on airplane mode.

**Q: How much does it cost?**
A: Free forever! Premium sync feature optional at $2.99/mo (coming Q2 2026).

**Q: Can I export my data?**
A: Yes! Export to Google Sheets, PDF, CSV, or JSON anytime.

**Q: What makes it different from Notion/Habitica/Todoist?**
A: Priority-weighted task tracking, smart AI insights without API costs, zero infrastructure, offline-first, $0 forever.

---

<p align="center">
  Made with ❤️ for students, athletes, creators, and anyone building consistent habits
</p>

<p align="center">
  <strong>Build momentum. Track progress. Transform yourself. 🚀</strong>
</p>
