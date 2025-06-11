# EggNet Monitor

Monitoring of the Chest Mimic familiar's DNA Lab contents in the MMORPG, Kingdom of Loathing.

## Setup

### Prerequisites

- Node.js 22+
- Postgres database
- Kingdom of Loathing account with a Chest Mimic

### Installation

1. Install dependencies:

```bash
yarn
```

2. Copy the environment template and configure:

```bash
cp env.template .env
```

3. Edit `.env` file with your credentials:
   - `KOL_USERNAME` and `KOL_PASSWORD` to login to the Kingdom of Loathing
   - `DATABASE_URL` pointing to your Postgres database
   - `PORT` (optional, defaults to 3000)

### Running

#### Development

```bash
yarn run dev
```

#### Production

```bash
yarn start
```

### Updating Data

To fetch the latest egg donation data from Kingdom of Loathing:

```bash
yarn run update
```

This can be scheduled to run periodically using cron or similar.

### API Endpoints

- `GET /` - Main monitor page
- `GET /status` - JSON API returning egg status data
- `GET /health` - Health check endpoint
