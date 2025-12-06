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

## 7. Keeping Your Branch Updated
If your friend merged code into `main` while you were working, you need to update your branch before you can push.

1.  Switch to your branch (if not already there):
    ```bash
    git checkout <your-branch-name>
    ```

2.  Fetch the latest changes from GitHub:
    ```bash
    git fetch origin
    ```

3.  Merge the `main` branch into your branch:
    ```bash
    git merge origin/main
    ```
    *This brings your friend's changes into your working branch.*

## 8. Resolving Conflicts
If you and your friend changed the **same lines** in the **same file**, Git will pause and tell you there is a **CONFLICT**.

1.  Run `git status` to see which files have conflicts (they will be listed under "Unmerged paths").
2.  Open those files in VS Code. You will see markers like this:
    ```text
    <<<<<<< HEAD
    Your changes
    =======
    Incoming changes from main
    >>>>>>> origin/main
    ```
3.  **Decide what to keep:**
    -   Keep your changes?
    -   Keep the incoming changes?
    -   Combine both?
    -   Delete the markers (`<<<<<<<`, `=======`, `>>>>>>>`) and save the file.
4.  After saving all conflicted files, stage them:
    ```bash
    git add .
    ```
5.  Commit the resolution:
    ```bash
    git commit -m "Resolved merge conflicts"
    ```
    *Now you can push your branch again.*

## 9. Best Practices
-   **Pull often:** Run `git pull origin main` (or the fetch/merge steps) every morning to get the latest code.
-   **Communicate:** If you are working on a shared file (like `Header.jsx`), tell your team so they know.
-   **Small PRs:** Make small changes and merge them often to avoid huge conflicts.
