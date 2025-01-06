import LoginForm from "@/components/auth/LoginForm";
import { GitHubLogin } from "./github-login";
import { cookies } from "next/headers";
import { RecordAuthResponse, RecordModel } from "pocketbase";
import { UsersResponse } from "@/types/pocketbase-types";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function handleCookies(
    authData:
      | RecordAuthResponse<RecordModel>
      | RecordAuthResponse<UsersResponse<unknown>>
  ) {
    "use server";

    const { token, record } = authData;
    const cookie = JSON.stringify({ token, record });
    const cookieStore = await cookies();

    cookieStore.set("pb_auth", cookie, {
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });

    redirect(`/dashboard`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <LoginForm />
      <GitHubLogin sendCookieToParent={handleCookies} />
    </main>
  );
}
