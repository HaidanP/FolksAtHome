#!/bin/bash
# Kill anything already on port 5001 or 3307
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:3307 | xargs kill -9 2>/dev/null

echo ""
echo "Step 1: Enter your lanner password to open the database tunnel."
echo "(It will go to background after you authenticate.)"
echo ""
ssh -f -N -L 3307:warren.sewanee.edu:3306 parajh0@lanner
if [ $? -ne 0 ]; then
  echo "SSH tunnel failed. Check your lanner password and try again."
  exit 1
fi

echo "Tunnel open. Starting Flask..."
cd "$(dirname "$0")/backend"
DB_HOST=localhost DB_PORT=3307 python3 app.py &
FLASK_PID=$!

echo "Starting frontend..."
cd "$(dirname "$0")"
npm run dev

kill $FLASK_PID 2>/dev/null
echo "Stopped."
