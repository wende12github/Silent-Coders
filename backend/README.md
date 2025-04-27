# 🛠️ TimeBank Backend – Django + DRF

# 🚀 Git Branching Instructions for Backend Team
## 📚 Branching Strategy Overview
We will have one main branch for deployment: main

We will have one working branch: development

All new features and bug fixes must be developed in feature branches created from development

Never commit directly to main or development without a Pull Request (PR).

## 🛠 How to Work on a Feature

** Pull the latest development branch before starting anything: **
```bash
git checkout development
git pull origin development
```

** Create a new branch for your task: **
```bash
git checkout -b feature/<your-feature-name>
```
  - Example: feature/authentication-api
  - Example: feature/wallet-transactions

** Work on your task inside your feature branch. ** 

Commit your work properly with clear messages:
```bash
git add .
git commit -m "Create registration and login APIs"
```

Push your feature branch:
```bash
git push origin feature/<your-feature-name>
```

**Open a Pull Request (PR) from your feature branch → development branch.**

**Ask for review from at least one team member (or the lead) before merging.**

# 🧹 When You Finish a Feature
After your PR is approved and merged into development, you can delete your feature branch.

# Starting a new feature? Always pull development again first before starting.

## 💥 Important Rules
✅ Always branch off of development, NOT main.

✅ One feature per branch. Don’t mix multiple tasks.

✅ Small, frequent commits are better than one big messy commit.

✅ Write meaningful commit messages (e.g., Fix booking acceptance logic, not update code).

✅ Pull from development often to avoid conflicts.

❌ Never push broken or untested code.

❌ Never push directly to main or development without a PR.

✨ Example Workflow
# 1. Start
```bash
git checkout development
git pull origin development
```
# 2. Create feature branch
```bash
git checkout -b feature/booking-api
```
# 3. Do your work

# 4. Stage and commit
```bash
git add .
git commit -m "Implement Booking create and accept API"
```
# 5. Push
```bash
git push origin feature/booking-api
```
# 6. Open PR to 'development'
