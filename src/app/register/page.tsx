"use client";

import { signup, type ActionResult } from "../actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useEffect } from "react";

const initialState: ActionResult = {
  success: false,
  error: null,
};

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(
    // Changed from useFormState to useActionState
    async (_: ActionResult, formData: FormData) => {
      return await signup(formData);
    },
    initialState
  );

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard");
    }
  }, [state?.success, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Create Account
        </h1>

        <div className="flex mb-6">
          <Link
            href="/"
            className="flex-1 py-2 text-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="flex-1 py-2 text-center text-blue-600 border-b-2 border-blue-600 font-medium"
          >
            Sign Up
          </Link>
        </div>

        <form action={formAction} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
              <input
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Must be at least 8 characters
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
              <input
                name="passwordConfirm"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </label>
          </div>

          {state?.error && (
            <div
              aria-live="polite"
              role="status"
              className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
            >
              {state.error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transition-colors duration-200 shadow-sm"
          >
            Create Account
          </button>
        </form>
      </div>
    </main>
  );
}
