# EggNet Monitor

Monitoring of the Chest Mimic familiar's DNA Lab contents in the online RPG, Kingdom of Loathing.

## Setup

### Prerequisites

- Node.js 18+
- MySQL database
- Kingdom of Loathing account

### Installation

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and configure:

```bash
cp env.template .env
```

3. Edit `.env` file with your credentials:
   - `KOL_USERNAME` and `KOL_PASSWORD`: Your Kingdom of Loathing login credentials
   - Database settings: `DB_HOST`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
   - Optional: `PORT` (defaults to 3000)

### Running

#### Development

```bash
npm run dev
```

#### Production

```bash
npm run build
npm start
```

### Updating Data

To fetch the latest egg donation data from Kingdom of Loathing:

```bash
npm run update
```

This can be scheduled to run periodically using cron or similar.

### API Endpoints

- `GET /` - Main monitor page
- `GET /status` - JSON API returning egg status data
- `GET /health` - Health check endpoint

## Migration from PHP

This TypeScript version replaces the original PHP server while maintaining compatibility with the existing frontend JavaScript. The database schema and API endpoints remain the same.
