import { cookies } from "next/headers";
import PocketBase from "pocketbase";

export default async function GitHubCallback({
  searchParams,
}: {
  searchParams: Promise<{ code: string; state: string }>;
}) {
  let authState: "authenticating" | true | false = "authenticating";

  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

  const { code, state } = await searchParams;

  const cookieStore = await cookies();
  const storedProvider = cookieStore.get("github_provider")?.value ?? null;

  let storedState = null;
  let providerName = null;
  let codeVerifier = null;

  if (storedProvider) {
    ({
      state: storedState,
      name: providerName,
      codeVerifier,
    } = JSON.parse(storedProvider));
  }

  console.log(code, providerName, codeVerifier);

  if (
    code === null ||
    state === null ||
    storedProvider === null ||
    state !== storedState
  ) {
    authState = false;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const authData = await pb
      .collection("users")
      .authWithOAuth2Code(
        providerName,
        code,
        codeVerifier,
        `${process.env.NEXT_PUBLIC_URL}/login/github/callback`
      );
  } catch (error) {
    console.error(error);
    authState = false;
  }

  return (
    <>
      {authState === "authenticating" ? (
        <p>Authenticating...</p>
      ) : authState ? (
        <p>Authenticated!</p>
      ) : (
        <p>Failed to authenticate</p>
      )}
    </>
  );
}
