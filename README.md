# PositionIQ

> **Position smarter. Risk better.**

A professional trade risk analyzer, journal, analytics dashboard, and AI trading coach for Indian retail traders.

Built with the MERN stack (MongoDB, Express.js, React.js, Node.js) + Tailwind CSS.

---

## Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **MongoDB** running locally OR a MongoDB Atlas connection string
- (Optional) **Gemini API key** for the AI Coach feature

### 1. Install Dependencies

```bash
cd PositionIQ
npm run install-all
```

This installs root, client, and server dependencies.

### 2. Configure Environment

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/positioniq
GEMINI_API_KEY=your_gemini_api_key_here
```

**For MongoDB Atlas:**
Replace `MONGO_URI` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/positioniq
```

**For Gemini API key:**
1. Go to https://aistudio.google.com/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Paste the key in `.env`

### 3. Start the Application

```bash
npm run dev
```

This starts both the frontend (port 5173) and backend (port 5000) simultaneously.

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### 4. Seed Demo Data

Demo trades are automatically seeded when the database is empty on first server start. This provides 6 Indian market trades (Crude Oil, Nifty, Reliance, HDFC Bank, TCS, BTC) for testing analytics.

---

## Features

### 📊 Trade Analyzer
- 13-field trade input form
- Live risk dashboard: Capital at Risk, Reward, R:R Ratio, Risk %
- **Panic Meter** gauge (0-100 score)
- **Risk Radar** pentagon chart
- **Verdict** banner (Healthy/Moderate/Reckless)
- **Scenario Slider** — adjust stop loss and see live metric updates
- **Averaging Simulator** — add up to 3 levels
- **Position Size Suggestion** — auto-calculated 2% risk sizing
- **Break-even** with brokerage charges

### ◎ Averaging Simulator
- Dedicated page for averaging simulation
- Add up to 5 averaging levels
- Live comparison table: Original vs Averaged
- Capital trap warnings at 50%+ deployment

### ☰ Trade Journal
- Full trade table with filters (asset class, conviction, outcome)
- Update outcomes: Win/Loss/Breakeven
- Track emotions, stop moves, averaging decisions
- **Trade Comparator** — select 2-3 trades for side-by-side comparison

### 📈 Advanced Analytics (unlocks after 5 closed trades)
- Win Rate, Profit Factor, Expectancy
- Max Drawdown, Portfolio Heat, Kelly Criterion
- **Conviction Accuracy** — compare win rates by conviction level
- **Discipline Score** — composite of plan adherence
- **Equity Curve** chart with drawdown zones

### 🧠 AI Trade Coach (Gemini-powered)
- Sends trade history + computed metrics to Gemini API
- Returns: 3 Observations, 2 Warnings, 2 Improvements, 1 Coach's Note
- Personalized behavioral analysis

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| AI | Google Gemini API (gemini-2.0-flash) |
| Routing | React Router v6 |
| HTTP | Axios |

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/trades` | List all trades |
| POST | `/api/trades` | Create new trade |
| PUT | `/api/trades/:id` | Update trade outcome |
| DELETE | `/api/trades/:id` | Delete trade |
| GET | `/api/analytics` | Get all advanced metrics |
| POST | `/api/ai-coach` | Get AI coaching insights |

---

## Design

- **Theme:** Dark mode only (#0f1117 background)
- **Accent:** Teal (#00b4d8) with purple gradient accents
- **Font:** Inter via Google Fonts
- **Currency:** All values in INR (₹)
- **Market examples:** Indian equity, commodity, crypto

---

## Demo Script

1. Open Trade Analyzer → fill Crude Oil trade (Entry ₹6200, Stop ₹6100, Target ₹6400, ₹50,000 capital)
2. Panic meter shows green → "Safe Trade"
3. Add averaging levels → panic meter climbs → "This is becoming a trap"
4. Drag scenario slider → live panic score changes
5. Save trade → go to Journal → mark outcome as Win
6. Go to Advanced Analytics → see Profit Factor, Expectancy, Conviction Accuracy
7. Click "Analyse with AI Coach" → Gemini returns behavioral insights
8. **"Every broker shows you HOW to trade. Nobody shows you WHETHER you SHOULD trade. That is the gap PositionIQ fills."**

---
