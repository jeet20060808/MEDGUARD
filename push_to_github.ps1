# MedGuard GitHub Push Script
# This stages, commits, and pushes all updates to GitHub

Write-Host "--- MedGuard — Pushing Updates to GitHub ---" -ForegroundColor Cyan

# 1. Stage changes
Write-Host "1. Staging local changes..." -ForegroundColor Blue
git add .

# 2. Commit
Write-Host "2. Committing changes..." -ForegroundColor Blue
git commit -m "Updated App.jsx and index.css: Theme fixes, premium SVG icons, and refactoring."

# 3. Pull (Rebase)
Write-Host "3. Synchronizing with the latest GitHub updates..." -ForegroundColor Blue
# Using the specific remote URL provided
git pull https://github.com/jeet20060808/MEDGUARD.git main --rebase

# 4. Push finally
Write-Host "4. Pushing to GitHub..." -ForegroundColor Green
git push https://github.com/jeet20060808/MEDGUARD.git main

Write-Host "--- Done! Your updates are now live on GitHub. ---" -ForegroundColor Green
Read-Host -Prompt "Press Enter to exit"
