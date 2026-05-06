import type { JiraTicket } from "./types.js";
import { getEnvValue } from "./env.js";

interface JiraIssueResponse {
  fields?: {
    summary?: string;
    description?: unknown;
    status?: { name?: string };
    priority?: { name?: string };
    issuetype?: { name?: string };
  };
}

interface JiraCommentBlock {
  type: "paragraph";
  content: Array<{ type: "text"; text: string }>;
}

function flattenDescription(input: unknown): string {
  if (!input || typeof input !== "object") {
    return "";
  }

  const node = input as { content?: unknown[]; text?: string; type?: string };
  if (typeof node.text === "string") {
    return node.text;
  }

  if (!Array.isArray(node.content)) {
    return "";
  }

  return node.content
    .map((entry) => flattenDescription(entry))
    .filter(Boolean)
    .join("\n");
}

function mockTicket(jiraKey: string): JiraTicket {
  return {
    key: jiraKey,
    summary: `Mock Jira ticket ${jiraKey}`,
    description:
      "Live Jira credentials are not configured. This mock payload exists so the local orchestration MVP can still demonstrate plan, run, and status flows.",
    status: "Mock",
    priority: "Medium",
    issueType: "Task",
    source: "mock"
  };
}

export class JiraClient {
  private credentials(): { baseUrl?: string; email?: string; token?: string } {
    return {
      baseUrl: getEnvValue("JIRA_BASE_URL", "JIRA_URL"),
      email: getEnvValue("JIRA_EMAIL"),
      token: getEnvValue("JIRA_API_TOKEN")
    };
  }

  private authHeader(email: string, token: string): string {
    return `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;
  }

  async getIssue(jiraKey: string): Promise<JiraTicket> {
    const { baseUrl, email, token } = this.credentials();

    if (!baseUrl || !email || !token) {
      return mockTicket(jiraKey);
    }

    const response = await fetch(`${baseUrl}/rest/api/3/issue/${jiraKey}`, {
      headers: {
        Accept: "application/json",
        Authorization: this.authHeader(email, token)
      }
    });

    if (!response.ok) {
      return mockTicket(jiraKey);
    }

    const payload = (await response.json()) as JiraIssueResponse;
    return {
      key: jiraKey,
      summary: payload.fields?.summary || jiraKey,
      description: flattenDescription(payload.fields?.description),
      status: payload.fields?.status?.name || "Unknown",
      priority: payload.fields?.priority?.name || "Unknown",
      issueType: payload.fields?.issuetype?.name || "Task",
      source: "live"
    };
  }

  async addComment(jiraKey: string, text: string): Promise<boolean> {
    const { baseUrl, email, token } = this.credentials();
    if (!baseUrl || !email || !token) {
      return false;
    }

    const blocks: JiraCommentBlock[] = text
      .split(/\n{2,}/)
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => ({
        type: "paragraph" as const,
        content: [{ type: "text" as const, text: chunk }]
      }));

    const response = await fetch(`${baseUrl}/rest/api/3/issue/${jiraKey}/comment`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: this.authHeader(email, token)
      },
      body: JSON.stringify({
        body: {
          type: "doc",
          version: 1,
          content: blocks.length ? blocks : [{ type: "paragraph", content: [{ type: "text", text }] }]
        }
      })
    });

    return response.ok;
  }
}
