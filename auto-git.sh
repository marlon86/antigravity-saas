#!/bin/bash

while true
do
  git add .
  git diff --cached --quiet || git commit -m "auto update $(date '+%Y-%m-%d %H:%M:%S')"
  git push origin main
  sleep 20
done