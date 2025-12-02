# Git Workflow Guide for Team Members

This guide outlines the steps to contribute to the project. Follow these instructions to clone the repository, make changes, and upload your code to a new branch.

## 1. Clone the Repository
First, you need to get a copy of the code on your local machine.

1.  Open your terminal (Command Prompt, PowerShell, or Git Bash).
2.  Navigate to the folder where you want to store the project.
3.  Run the clone command:
    ```bash
    git clone <YOUR_REPOSITORY_URL>
    ```
    *(Replace `<YOUR_REPOSITORY_URL>` with the actual link to your GitHub repo)*

4.  Move into the project directory:
    ```bash
    cd Project_Files
    ```

## 2. Create a New Branch
**Never push directly to the `main` or `master` branch.** Always create a new branch for your specific feature or fix.

1.  Make sure you are on the latest version of the main branch:
    ```bash
    git checkout main
    git pull origin main
    ```

2.  Create and switch to a new branch. Name it descriptively (e.g., `feature-login-page`, `fix-header-bug`):
    ```bash
    git checkout -b <your-branch-name>
    ```

## 3. Make Your Changes
Now, open the project in your code editor (VS Code) and make your changes.

-   **Save your files** frequently.
-   Test your changes locally to ensure everything works.

## 4. Stage and Commit Changes
Once you are happy with your work, you need to save it to git.

1.  Check which files have changed:
    ```bash
    git status
    ```

2.  Stage the files you want to include (or use `.` for all files):
    ```bash
    git add .
    ```

3.  Commit the changes with a clear message explaining what you did:
    ```bash
    git commit -m "Added login form validation"
    ```

## 5. Push Your Branch
Upload your branch to the remote repository (GitHub).

1.  Push the code:
    ```bash
    git push origin <your-branch-name>
    ```

## 6. Create a Pull Request (PR)
1.  Go to the repository page on GitHub.
2.  You should see a banner asking to "Compare & pull request" for your recently pushed branch. Click it.
3.  Add a title and description for your PR.
4.  Click **Create Pull Request**.
5.  Wait for a team member to review and merge your code!

---

### Common Commands Cheat Sheet

-   `git status`: See changed files.
-   `git log`: See commit history.
-   `git checkout main`: Switch back to the main branch.
-   `git branch`: See all local branches.
