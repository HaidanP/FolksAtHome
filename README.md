# Folks at Home

A volunteer coordination web app for the Folks at Home nonprofit in Sewanee, Tennessee. Community members post requests for rides, errands, and friendly visits. Volunteers browse open tasks, express interest, and members approve who shows up.

Built as a CS284 final project by Haidan Parajuli.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite + TailwindCSS |
| Backend | Flask (Python) |
| Database | MariaDB / MySQL |
| Auth | bcrypt password hashing |


---

## Project Status

The app is fully functional. The database is currently being migrated from the university's on-campus server (which required an SSH tunnel to access) to a cloud-hosted MySQL service so the backend can run persistently without needing a local machine to maintain the tunnel.

Until the migration is complete, running this project locally requires setting up the SSH tunnel and running the Flask server yourself (see Local Dev below).

---

## Local Dev Setup

### 1. Install dependencies

```bash
# Frontend
npm install

# Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp backend/.env.template backend/.env
# Edit backend/.env with your database credentials
```

If you are connecting to the university database via SSH tunnel, set:
```
DB_HOST=localhost
DB_PORT=3307
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

### 3. Set up the database (first time only)

```bash
cd backend
python3 setup_db.py
python3 seed.py
python3 seed_tasks.py
```

### 4. Run the app

```bash
./start.sh
```

This starts the Flask API on `http://localhost:5001` and the Vite dev server on `http://localhost:5173`. The Vite proxy forwards all `/api` requests to Flask.

---

## Deployment (Planned)

| Service | Purpose |
|---|---|
| Railway | Hosted MySQL database + Flask backend |
| Vercel | React frontend |

Once the database is migrated to Railway, no local setup will be needed. The backend will run 24/7 and the frontend will be accessible at the deployed Vercel URL.

---

## Project Structure

```
├── backend/
│   ├── app.py           # Flask API (all routes)
│   ├── db.py            # Database connection pool
│   ├── schema.sql       # Table definitions
│   ├── seed.py          # Inserts user accounts
│   ├── seed_tasks.py    # Inserts tasks and request history
│   ├── setup_db.py      # Creates tables from schema.sql
│   ├── requirements.txt
│   └── .env.template    # Copy to .env and fill in credentials
├── src/
│   ├── api/             # API client functions + TypeScript types
│   ├── components/      # React components (dashboards, landing sections)
│   ├── context/         # Auth context
│   ├── hooks/           # usePoll (polling hook), useInView
│   └── utils/           # HEIC image conversion utility
├── start.sh             # Starts Flask + Vite together
└── vite.config.ts       # Proxies /api to localhost:5001
```

---

## Database Schema

Four tables:

- **members** — community members who post tasks
- **volunteers** — volunteers who fulfill tasks
- **fah_tasks** — service requests with status (`open` / `completed`)
- **fah_task_requests** — junction table linking tasks to volunteers, with a four-state status: `Pending`, `Confirmed`, `Declined`, `Completed`

The `fah_task_requests.status` column acts as a state machine that drives all dashboard interactions.
