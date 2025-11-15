import { auth } from "~/server/auth";
import { UserService } from "~/server/user";

// GET current user data
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await UserService.getUserById(session.user.id);
    return Response.json(user);
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const user = await UserService.updateUser(session.user.id, data);

    return Response.json(user);
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 },
    );
  }
}
