import path from "node:path";
import type { PullRequestResult } from "./types.js";
import { runCommand } from "./shell.js";

export class GitHubClient {
  constructor(private readonly repoRoot: string) {}

  private githubToken(): string | null {
    const token = process.env.GITHUB_TOKEN?.trim();
    return token ? token : null;
  }

  private async originUrl(): Promise<string | null> {
    const result = await runCommand("git", ["remote", "get-url", "origin"], this.repoRoot);
    if (result.exitCode !== 0) {
      return null;
    }
    const value = result.stdout.trim();
    return value || null;
  }

  private async repoSlug(): Promise<{ owner: string; repo: string } | null> {
    const remote = await this.originUrl();
    if (!remote) {
      return null;
    }

    const sshMatch = remote.match(/^git@github\.com:(.+?)\/(.+?)(?:\.git)?$/);
    if (sshMatch) {
      return { owner: sshMatch[1], repo: sshMatch[2] };
    }

    const httpsMatch = remote.match(/^https:\/\/github\.com\/(.+?)\/(.+?)(?:\.git)?$/);
    if (httpsMatch) {
      return { owner: httpsMatch[1], repo: httpsMatch[2] };
    }

    return null;
  }

  private authHeaderValue(token: string): string {
    return `basic ${Buffer.from(`x-access-token:${token}`).toString("base64")}`;
  }

  private async canUseGh(): Promise<boolean> {
    const status = await runCommand("gh", ["auth", "status"], this.repoRoot);
    return status.exitCode === 0;
  }

  private async canUseGithubApi(): Promise<boolean> {
    return Boolean(this.githubToken() && (await this.repoSlug()));
  }

  private async fetchExistingPullRequestViaApi(branch: string): Promise<{ number: number | null; url: string | null }> {
    const slug = await this.repoSlug();
    const token = this.githubToken();
    if (!slug || !token) {
      return { number: null, url: null };
    }

    const response = await fetch(
      `https://api.github.com/repos/${slug.owner}/${slug.repo}/pulls?state=open&head=${encodeURIComponent(`${slug.owner}:${branch}`)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      return { number: null, url: null };
    }

    try {
      const payload = (await response.json()) as Array<{ number?: number; html_url?: string }>;
      const match = payload[0];
      return {
        number: typeof match?.number === "number" ? match.number : null,
        url: typeof match?.html_url === "string" ? match.html_url : null
      };
    } catch {
      return { number: null, url: null };
    }
  }

  private async hasTrackedChanges(worktreePath: string): Promise<boolean> {
    const status = await runCommand("git", ["status", "--short"], worktreePath);
    return status.exitCode === 0 && status.stdout.trim().length > 0;
  }

  private async findExistingPullRequest(branch: string): Promise<{ number: number | null; url: string | null }> {
    if (!(await this.canUseGh())) {
      return this.fetchExistingPullRequestViaApi(branch);
    }

    const result = await runCommand(
      "gh",
      ["pr", "list", "--head", branch, "--json", "number,url", "--limit", "1"],
      this.repoRoot
    );

    if (result.exitCode !== 0 || !result.stdout.trim()) {
      return { number: null, url: null };
    }

    try {
      const payload = JSON.parse(result.stdout) as Array<{ number?: number; url?: string }>;
      const match = payload[0];
      return {
        number: typeof match?.number === "number" ? match.number : null,
        url: typeof match?.url === "string" ? match.url : null
      };
    } catch {
      return { number: null, url: null };
    }
  }

  async preparePullRequest(branch: string, title: string, bodyPath: string): Promise<{ ready: boolean; command: string }> {
    const command = `gh pr create --draft --base main --head ${branch} --title ${JSON.stringify(
      title
    )} --body-file ${JSON.stringify(path.relative(this.repoRoot, bodyPath))}`;

    return {
      ready: (await this.canUseGh()) || (await this.canUseGithubApi()),
      command
    };
  }

  async publishPullRequest(
    worktreePath: string,
    branch: string,
    title: string,
    bodyPath: string,
    commitMessage: string
  ): Promise<PullRequestResult> {
    const canUseGh = await this.canUseGh();
    const canUseApi = await this.canUseGithubApi();
    if (!canUseGh && !canUseApi) {
      return {
        ready: false,
        created: false,
        skipped: true,
        branch,
        url: null,
        number: null,
        command: null,
        reason: "Neither GitHub CLI auth nor GITHUB_TOKEN API auth is available on this host."
      };
    }

    if (!(await this.hasTrackedChanges(worktreePath))) {
      const existing = await this.findExistingPullRequest(branch);
      return {
        ready: true,
        created: false,
        skipped: true,
        branch,
        url: existing.url,
        number: existing.number,
        command: null,
        reason: existing.url ? "No new git changes to publish; existing PR reused." : "No git changes to publish."
      };
    }

    const addResult = await runCommand("git", ["add", "-A"], worktreePath);
    if (addResult.exitCode !== 0) {
      return {
        ready: false,
        created: false,
        skipped: false,
        branch,
        url: null,
        number: null,
        command: null,
        reason: addResult.stderr || "git add failed"
      };
    }

    const commitResult = await runCommand("git", ["commit", "-m", commitMessage], worktreePath);
    if (commitResult.exitCode !== 0 && !commitResult.stderr.includes("nothing to commit")) {
      return {
        ready: false,
        created: false,
        skipped: false,
        branch,
        url: null,
        number: null,
        command: null,
        reason: commitResult.stderr || "git commit failed"
      };
    }

    const token = this.githubToken();
    const pushArgs = token
      ? ["-c", `http.https://github.com/.extraheader=AUTHORIZATION: ${this.authHeaderValue(token)}`, "push", "-u", "origin", branch]
      : ["push", "-u", "origin", branch];
    const pushResult = await runCommand("git", pushArgs, worktreePath);
    if (pushResult.exitCode !== 0) {
      return {
        ready: false,
        created: false,
        skipped: false,
        branch,
        url: null,
        number: null,
        command: null,
        reason: pushResult.stderr || "git push failed"
      };
    }

    const existing = await this.findExistingPullRequest(branch);
    if (existing.url) {
      return {
        ready: true,
        created: false,
        skipped: false,
        branch,
        url: existing.url,
        number: existing.number,
        command: "gh pr list --head <branch>",
        reason: "Existing PR already present for this branch."
      };
    }

    if (!canUseGh) {
      const slug = await this.repoSlug();
      const apiToken = this.githubToken();
      if (!slug || !apiToken) {
        return {
          ready: false,
          created: false,
          skipped: false,
          branch,
          url: null,
          number: null,
          command: null,
          reason: "Cannot create PR via API because repo slug or token is unavailable."
        };
      }

      const body = await runCommand("bash", ["-lc", `cat ${JSON.stringify(bodyPath)}`], worktreePath);
      const response = await fetch(`https://api.github.com/repos/${slug.owner}/${slug.repo}/pulls`, {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          head: branch,
          base: "main",
          body: body.stdout,
          draft: true
        })
      });

      if (!response.ok) {
        return {
          ready: false,
          created: false,
          skipped: false,
          branch,
          url: null,
          number: null,
          command: "POST /pulls",
          reason: await response.text()
        };
      }

      const payload = (await response.json()) as { number?: number; html_url?: string };
      return {
        ready: true,
        created: true,
        skipped: false,
        branch,
        url: typeof payload.html_url === "string" ? payload.html_url : null,
        number: typeof payload.number === "number" ? payload.number : null,
        command: "POST /repos/{owner}/{repo}/pulls"
      };
    }

    const createArgs = ["pr", "create", "--draft", "--base", "main", "--head", branch, "--title", title, "--body-file", bodyPath];
    const createResult = await runCommand("gh", createArgs, worktreePath);
    if (createResult.exitCode !== 0) {
      return {
        ready: false,
        created: false,
        skipped: false,
        branch,
        url: null,
        number: null,
        command: `gh ${createArgs.join(" ")}`,
        reason: createResult.stderr || "gh pr create failed"
      };
    }

    const created = await this.findExistingPullRequest(branch);
    return {
      ready: true,
      created: true,
      skipped: false,
      branch,
      url: created.url,
      number: created.number,
      command: `gh ${createArgs.join(" ")}`
    };
  }
}
