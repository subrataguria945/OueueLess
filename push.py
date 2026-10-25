import sys
import subprocess
import argparse

# Configure UTF-8 output if possible
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ANSI color codes for terminal output
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def run_command(cmd, check=True):
    """Run a shell command and return stdout. Raises exception on failure if check=True."""
    print(f"{CYAN}> {cmd}{RESET}")
    result = subprocess.run(cmd, shell=True, text=True, capture_output=True)
    if result.stdout.strip():
        print(result.stdout.strip())
    if result.returncode != 0:
        if result.stderr.strip():
            print(f"{RED}{result.stderr.strip()}{RESET}")
        if check:
            raise RuntimeError(f"Command failed with exit code {result.returncode}: {cmd}")
    return result


def get_current_branch():
    """Get the name of the currently active branch."""
    res = subprocess.run("git rev-parse --abbrev-ref HEAD", shell=True, text=True, capture_output=True)
    if res.returncode != 0:
        raise RuntimeError("Failed to detect current git branch.")
    return res.stdout.strip()


def has_changes_to_commit():
    """Check if there are unstaged, staged, or untracked changes."""
    res = subprocess.run("git status --porcelain", shell=True, text=True, capture_output=True)
    return bool(res.stdout.strip())


def main():
    parser = argparse.ArgumentParser(description="Auto commit and push across development branches.")
    parser.add_argument("-m", "--message", type=str, help="Commit message")
    args = parser.parse_args()

    commit_message = args.message
    if not commit_message:
        try:
            commit_message = input(f"{BOLD}Enter commit message: {RESET}").strip()
        except (KeyboardInterrupt, EOFError):
            print(f"\n{YELLOW}Aborted by user.{RESET}")
            sys.exit(0)

    if not commit_message:
        print(f"{RED}Error: Commit message cannot be empty.{RESET}")
        sys.exit(1)

    initial_branch = get_current_branch()
    print(f"\n{BOLD}Starting Branch:{RESET} {YELLOW}{initial_branch}{RESET}")

    # Determine pipeline branches
    # Normal workflow: [current_branch] -> backend -> dev
    pipeline = [initial_branch]
    if initial_branch != "backend" and initial_branch != "dev":
        pipeline.append("backend")
    if initial_branch != "dev":
        pipeline.append("dev")

    print(f"{BOLD}Branch Push Pipeline:{RESET} {CYAN}{' -> '.join(pipeline)}{RESET}\n")

    try:
        # Step 1: Check & Commit on initial branch
        if has_changes_to_commit():
            print(f"{BOLD}[1/4] Staging & Committing changes on {initial_branch}...{RESET}")
            run_command("git add -A")
            run_command(f'git commit -m "{commit_message}"')
        else:
            print(f"{YELLOW}No local changes to commit on {initial_branch}. Proceeding with existing commits...{RESET}")

        # Step 2: Push current branch
        print(f"\n{BOLD}[2/4] Pushing {initial_branch} to origin...{RESET}")
        run_command(f"git push origin {initial_branch}")
        print(f"{GREEN}[OK] Successfully pushed {initial_branch}{RESET}")

        # Step 3: Propagate through downstream branches
        prev_branch = initial_branch
        downstream_branches = pipeline[1:]

        for idx, branch in enumerate(downstream_branches, start=3):
            print(f"\n{BOLD}[{idx}/{len(pipeline) + 1}] Updating and pushing {branch}...{RESET}")
            run_command(f"git switch {branch}")
            # Pull latest changes to avoid conflicts
            run_command(f"git pull origin {branch}")
            # Merge previous branch
            run_command(f'git merge {prev_branch} -m "Merge branch \'{prev_branch}\' into {branch}"')
            # Push to origin
            run_command(f"git push origin {branch}")
            print(f"{GREEN}[OK] Successfully merged and pushed {branch}{RESET}")
            prev_branch = branch

        # Step 4: Return to the initial branch
        print(f"\n{BOLD}Returning to starting branch {initial_branch}...{RESET}")
        run_command(f"git switch {initial_branch}")

        print(f"\n{GREEN}{BOLD}[DONE] All branches ({', '.join(pipeline)}) successfully updated and pushed!{RESET}\n")

    except Exception as e:
        print(f"\n{RED}{BOLD}[ERROR] An error occurred during the push process:{RESET} {e}")
        print(f"{YELLOW}Returning to original branch: {initial_branch}...{RESET}")
        subprocess.run(f"git switch {initial_branch}", shell=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
