"use client";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/pocketbase";
import { UsersResponse } from "@/types/pocketbase-types";
import { RecordAuthResponse } from "pocketbase";

interface GitHubLoginProps {
  sendCookieToParent: (
    authData: RecordAuthResponse<UsersResponse<unknown>>
  ) => void;
}

export function GitHubLogin({ sendCookieToParent }: GitHubLoginProps) {
  async function startGitHubOauthFlow() {
    const pb = createBrowserClient();
    const authData = await pb
      .collection("users")
      .authWithOAuth2({ provider: "github" });
    return authData;
  }

  async function clearLocalStorage() {
    localStorage.removeItem("pb_auth");
    localStorage.removeItem("pocketbase_auth");
  }

  const handleClick = async () => {
    const authData = await startGitHubOauthFlow();
    await clearLocalStorage();
    sendCookieToParent(authData);
  };

  return (
    <div>
      <Button onClick={handleClick}>Login with GitHub</Button>
    </div>
  );
}
