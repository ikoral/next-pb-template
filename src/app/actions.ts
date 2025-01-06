"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/pocketbase";

// Initialize PocketBase with debug logging
const pb = createServerClient();

export type ActionResult =
  | { success: true; error?: never }
  | { success: false; error: string | null };

export async function signup(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("passwordConfirm") as string;

  if (password !== passwordConfirm) {
    return { success: false, error: "Passwords do not match" };
  }

  try {
    await pb.collection("users").create({
      email,
      password,
      passwordConfirm,
    });

    // Auto login after signup
    const { token, record } = await pb
      .collection("users")
      .authWithPassword(email, password);

    const cookie = JSON.stringify({ token, record });
    const cookieStore = await cookies();

    cookieStore.set("pb_auth", cookie, {
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof ClientResponseError) {
      if (error.status === 400) {
        const data = error.response?.data;
        if (data) {
          const fieldErrors = Object.entries(data)
            .map(([field, errors]) => `${field}: ${errors}`)
            .join(", ");
          return {
            success: false,
            error: `Please fix the following: ${fieldErrors}`,
          };
        }
      }

      if (error.status === 0) {
        return {
          success: false,
          error: "Unable to connect to the server. Please try again later.",
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}

export async function login(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);

    const { token, record } = authData;
    const cookie = JSON.stringify({ token, record });
    const cookieStore = await cookies();

    cookieStore.set("pb_auth", cookie, {
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });

    // Instead of redirecting immediately, return a success value
    return { success: true };
  } catch (error) {
    if (error instanceof ClientResponseError) {
      if (error.status === 400) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }

      if (error.status === 0) {
        return {
          success: false,
          error:
            "Unable to connect to PocketBase. Please ensure the server is running.",
        };
      }

      return {
        success: false,
        error: `Login failed: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}

export async function logout() {
  pb.authStore.clear();
  const cookieStore = await cookies();
  cookieStore.delete("pb_auth");
  redirect("/");
}
