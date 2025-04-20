import { auth } from "~/server/auth";
import { CashbackPolicyService } from "~/server/cashback";

// GET all cashback policies for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const policies = await CashbackPolicyService.getUserPolicies(session.user.id);
    return Response.json(policies);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}

// POST create a new cashback policy
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const policy = await CashbackPolicyService.createPolicy(data, session.user.id);

    return Response.json(policy);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
} 