import { NextRequest, NextResponse } from "next/server";
// import pb from "@/lib/pocketbase";
import { ClientResponseError } from "pocketbase";
import { cookies } from "next/headers";
import PocketBase from "pocketbase";

export async function GET(request: NextRequest) {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("pb_auth");
  console.log(authCookie?.value);

  if (!authCookie) {
    return NextResponse.json(
      { error: "User is not authenticated" },
      { status: 401 }
    );
  }

  const { token, model } = JSON.parse(authCookie.value);
  pb.authStore.save(token, model);

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const userId = searchParams.get("userId");
  const tag = searchParams.get("tag");

  try {
    const filter: string[] = [];
    if (userId) filter.push(`user = "${userId}"`);
    if (tag) filter.push(`tags ~ "${tag}"`);

    const posts = await pb.collection("posts").getList(page, limit, {
      filter: filter.join(" && "),
      expand: "user",
      sort: "-created",
    });

    return NextResponse.json(posts);
  } catch (error) {
    if (error instanceof ClientResponseError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  try {
    const body = await request.json();
    const post = await pb.collection("posts").create(body);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof ClientResponseError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
  pb.authStore.clear();
}
