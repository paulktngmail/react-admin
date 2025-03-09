#!/bin/bash

# Script to push the project to GitHub
# This script automates the process of pushing changes to GitHub

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Make sure we're in the right directory
cd "$(dirname "$0")/.." || { echo -e "${RED}Error: Could not navigate to project root directory${NC}"; exit 1; }

echo -e "${YELLOW}Starting GitHub deployment process...${NC}"

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo -e "${YELLOW}Git repository not initialized. Initializing...${NC}"
  git init
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to initialize git repository${NC}"
    exit 1
  fi
fi

# Check if remote exists
if ! git remote | grep -q "origin"; then
  echo -e "${YELLOW}Remote 'origin' not found. Please enter GitHub repository URL:${NC}"
  read -r repo_url
  
  if [ -z "$repo_url" ]; then
    echo -e "${RED}No repository URL provided. Exiting.${NC}"
    exit 1
  fi
  
  git remote add origin "$repo_url"
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to add remote repository${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Remote 'origin' added successfully${NC}"
fi

# Get current branch or default to main
current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ -z "$current_branch" ] || [ "$current_branch" = "HEAD" ]; then
  current_branch="main"
  echo -e "${YELLOW}No branch detected. Using 'main' as default branch${NC}"
fi

# Check for uncommitted changes
if git status --porcelain | grep -q .; then
  echo -e "${YELLOW}Uncommitted changes detected${NC}"
  
  # Add all files
  echo -e "${YELLOW}Adding all files to staging area...${NC}"
  git add .
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to add files to staging area${NC}"
    exit 1
  fi
  
  # Prompt for commit message
  echo -e "${YELLOW}Please enter a commit message:${NC}"
  read -r commit_message
  
  if [ -z "$commit_message" ]; then
    commit_message="Update: Automated commit from github-deploy.sh script"
    echo -e "${YELLOW}No commit message provided. Using default message.${NC}"
  fi
  
  # Commit changes
  echo -e "${YELLOW}Committing changes...${NC}"
  git commit -m "$commit_message"
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to commit changes${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Changes committed successfully${NC}"
else
  echo -e "${GREEN}No uncommitted changes detected${NC}"
fi

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub (branch: $current_branch)...${NC}"
git push -u origin "$current_branch"

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to push to GitHub. Please check your credentials and try again.${NC}"
  echo -e "${YELLOW}You might need to set up authentication. Try:${NC}"
  echo -e "  git config --global user.name \"Your Name\""
  echo -e "  git config --global user.email \"your.email@example.com\""
  echo -e "  git config --global credential.helper cache"
  exit 1
fi

echo -e "${GREEN}Successfully pushed to GitHub!${NC}"
echo -e "${GREEN}Repository: $(git remote get-url origin)${NC}"
echo -e "${GREEN}Branch: $current_branch${NC}"
