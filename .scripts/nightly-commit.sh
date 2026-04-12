#!/bin/bash
# Nightly auto-commit + push for SHCC.
# Scheduled to run at 9pm local time by com.steady.shcc-nightly-commit.plist.
#
# Behavior:
#   1. cd to the repo
#   2. git status --porcelain — if empty, exit silently (nothing to commit)
#   3. Refuse to commit if any .env* files are staged (belt-and-suspenders
#      even though they're in .gitignore)
#   4. Build a commit message from the changed file list
#   5. git add -A, git commit, git push
#   6. Log everything to ./.scripts/nightly.log

set -uo pipefail

REPO="/Users/momma/Desktop/Side Hustle Command Centre"
LOG="$REPO/.scripts/nightly.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() {
  echo "[$TIMESTAMP] $*" >> "$LOG"
}

cd "$REPO" || { log "ERROR: cannot cd to $REPO"; exit 1; }

# Ensure git is available (launchd runs with a minimal PATH)
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# Bail early if there's nothing to commit
if [ -z "$(git status --porcelain)" ]; then
  log "No changes to commit. Exiting."
  exit 0
fi

# Safety: refuse to commit if anything that looks like a secrets file is modified
if git status --porcelain | grep -qE '(^| )\.env'; then
  log "ERROR: .env file changes detected — refusing to auto-commit. Commit manually after review."
  exit 1
fi

# Build a commit message from the changed file list
CHANGED=$(git status --porcelain | awk '{print $NF}' | head -10)
CHANGED_COUNT=$(git status --porcelain | wc -l | xargs)
DATE=$(date '+%Y-%m-%d')

MSG="Nightly auto-commit: $DATE

$CHANGED_COUNT file(s) touched. Top-level changes:

$(echo "$CHANGED" | sed 's/^/- /')

[auto-committed at $TIMESTAMP by nightly-commit.sh]"

log "Changes detected. Committing $CHANGED_COUNT files."

# Stage, commit, push
git add -A 2>> "$LOG"
git commit -m "$MSG" 2>> "$LOG"

if git push origin HEAD 2>> "$LOG"; then
  log "Successfully pushed to origin"
else
  log "ERROR: git push failed"
  exit 1
fi

log "Nightly commit complete."
