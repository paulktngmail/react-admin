# Frontend-Backend Communication Fix

## Issue Summary

The frontend (deployed on AWS Amplify) was unable to communicate with the backend (deployed on AWS Elastic Beanstalk) due to two main issues:

1. **Double `/api/` Prefix**: The frontend was using a base URL with `/api` and then adding another `/api/` prefix to all endpoint paths, resulting in URLs like:
   ```
   http://double9-env.eba-wxarapmn.us-east-2.elasticbeanstalk.com/api/api/presale/info
   ```

2. **Incorrect Endpoint Paths**: The backend is running `solana-api.js` (as specified in the Procfile), which has endpoints with a `/pool/` prefix (e.g., `/api/pool/presale-pool-data`), but the frontend was trying to access endpoints without this prefix (e.g., `/api/presale/info`).

## Root Cause Analysis

1. The backend's Procfile specifies `web: node solana-api.js`, which means it's running the Solana API server, not the main server (`server.js`).

2. The `solana-api.js` file defines routes with the `/api/` prefix, but the paths are different from what the frontend was expecting. For example, it has `/api/pool/presale-pool-data` instead of `/api/presale/info`.

3. There's a URL mapping middleware in `server.js` that's supposed to map the frontend endpoints to the backend endpoints, but it's not being used because `server.js` is not being run.

## Fix Implementation

We implemented the following fixes:

1. **Removed Double `/api/` Prefix**: Updated the frontend API service files to use the correct base URL with a single `/api` prefix.

2. **Updated Endpoint Paths**: Modified the frontend API service files to use the correct endpoint paths with the `/pool/` prefix where needed.

### Files Modified:

1. `src/services/api.js`:
   - Removed the double `/api/` prefix from all endpoint paths
   - Updated endpoint paths to use the `/pool/` prefix where needed

2. `src/services/solanaApi.js`:
   - This file was already using the correct endpoint paths with the `/pool/` prefix

### Testing:

We created a test script (`test-fixed-connection.js`) to verify that the frontend can now communicate with the backend correctly. The test confirmed that the API endpoints are now accessible.

## Deployment

### Deploy to AWS Amplify

To deploy the fixed frontend to AWS Amplify, run:

```bash
./deploy-fixed-frontend.sh
```

This script will:
1. Build the frontend with the fixed API endpoints
2. Deploy the built frontend to AWS Amplify

### Push to GitHub

To push the API communication fix to GitHub, you can use one of the following scripts:

#### Standard Push Scripts (with rebase)

1. Standard push (if you have credentials cached or SSH keys set up):
```bash
./push-api-fix-to-github.sh
```

2. Push with authentication (if you need to enter your GitHub Personal Access Token):
```bash
./push-api-fix-with-auth.sh
```

These scripts will:
1. Add the modified files to git
2. Commit the changes with a descriptive message
3. Stash any unstaged changes
4. Pull the latest changes from the remote repository with rebase
5. Apply the stashed changes if any
6. Push the changes to the GitHub repository

The scripts include stashing and rebasing steps to handle cases where the local repository is behind the remote repository or has unstaged changes, which are common issues when multiple people are working on the same codebase.

#### Force Push Scripts (if standard push fails)

If the standard push scripts fail due to complex merge conflicts, you can use the force push scripts as a last resort:

1. Force push (if you have credentials cached or SSH keys set up):
```bash
./force-push-api-fix.sh
```

2. Force push with authentication (if you need to enter your GitHub Personal Access Token):
```bash
./force-push-api-fix-with-auth.sh
```

**WARNING**: Force pushing will overwrite any remote changes. Use with caution, especially in collaborative projects.

These scripts will:
1. Add the modified files to git
2. Commit the changes with a descriptive message
3. Force push the changes to the GitHub repository, overwriting any remote changes

#### Push Only API Fix Scripts (if there are large files in the repository)

If there are large files in the repository that exceed GitHub's file size limits, you can use these scripts to push only the specific files you modified to a new branch:

1. Push only API fix (if you have credentials cached or SSH keys set up):
```bash
./push-only-api-fix.sh
```

2. Push only API fix with authentication (if you need to enter your GitHub Personal Access Token):
```bash
./push-only-api-fix-with-auth.sh
```

These scripts will:
1. Create a new branch called `api-communication-fix`
2. Add only the specific files you modified to git
3. Commit the changes with a descriptive message
4. Push the changes to the new branch on GitHub
5. You can then create a pull request to merge these changes into the main branch

#### Push Directly to Main Branch Scripts

To push the API communication fix directly to the main branch on GitHub, you can use these scripts:

1. Push to main branch (if you have credentials cached or SSH keys set up):
```bash
./push-to-main-branch.sh
```

2. Push to main branch with authentication (if you need to enter your GitHub Personal Access Token):
```bash
./push-to-main-branch-with-auth.sh
```

These scripts will:
1. Make sure you're on the main branch
2. Add only the specific files you modified to git
3. Commit the changes with a descriptive message
4. Pull the latest changes from the remote repository with rebase
5. Push the changes directly to the main branch on GitHub

#### Direct Push Scripts (if other methods fail)

If all other push methods fail, you can use these scripts that create a fresh git repository and push directly to the main branch:

1. Direct push to main branch (if you have credentials cached or SSH keys set up):
```bash
./direct-push-to-main.sh
```

2. Direct push to main branch with authentication (if you need to enter your GitHub Personal Access Token):
```bash
./direct-push-to-main-with-auth.sh
```

These scripts will:
1. Create a fresh git repository
2. Add only the specific files you modified to git
3. Commit the changes with a descriptive message
4. Force push the changes directly to the main branch on GitHub

**WARNING**: These scripts will delete the existing `.git` directory and create a new one. Use with caution, especially in collaborative projects.

#### Push Complete Project Scripts (for AWS Amplify deployment)

If you need to deploy to AWS Amplify, you should use these scripts that push the complete project structure to GitHub:

1. Push complete project (if you have credentials cached or SSH keys set up):
```bash
./push-complete-project.sh
```

2. Push complete project with authentication (if you need to enter your GitHub Personal Access Token):
```bash
./push-complete-project-with-auth.sh
```

These scripts will:
1. Create a fresh git repository
2. Add all necessary files for the project to git (package.json, public/, src/, etc.)
3. Commit the changes with a descriptive message
4. Force push the complete project to the main branch on GitHub

**NOTE**: These scripts are necessary for AWS Amplify deployment because Amplify needs the complete project structure, including package.json and other build files.

## Alternative Solutions Considered

1. **Fix the Backend URL Mapping**: We could have modified the backend to run `server.js` instead of `solana-api.js`, or added the URL mapping middleware to `solana-api.js`. However, this would have required redeploying the backend, which is more complex and risky.

2. **Use Environment Variables for API URLs**: A more robust solution would be to use environment variables for the API URLs, which would make it easier to switch between different environments (development, staging, production). This could be implemented in a future update.

## Future Recommendations

1. **Standardize API Endpoint Naming**: Adopt a consistent naming convention for API endpoints across both frontend and backend.

2. **Use Environment Variables**: Use environment variables for API URLs to make it easier to switch between different environments.

3. **Implement API Versioning**: Consider implementing API versioning to make it easier to make breaking changes to the API in the future.

4. **Add Comprehensive API Tests**: Add more comprehensive tests for the API endpoints to catch issues like this earlier.
