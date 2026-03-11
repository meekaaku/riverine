#!/bin/bash
set -e

BRANCH=$(git branch --show-current)
echo "Merging $BRANCH into master..."
git checkout master
git merge "$BRANCH"
git push origin master
echo "Done! Switching back to $BRANCH"
git checkout "$BRANCH"
