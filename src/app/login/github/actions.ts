"use server";

import PocketBase from "pocketbase";
import { cookies } from "next/headers";

export async function handleGitHubLogin(): Promise<string> {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  const redirectUrl = `${process.env.NEXT_PUBLIC_URL}/login/github/callback`;

  const authMethods = await pb.collection("users").listAuthMethods();
  const providers = authMethods.oauth2?.providers || [];

  const providerGitHub = providers.find(
    (provider) => provider.name === "github"
  );

  const gitGubAuthUrl = `${providerGitHub?.authURL}${redirectUrl}`;

  // localStorage.setItem("github", JSON.stringify(providerGitHub));
  const cookie = JSON.stringify(providerGitHub);
  const cookieStore = await cookies();

  cookieStore.set("github_provider", cookie, {
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });

  return gitGubAuthUrl;
}
