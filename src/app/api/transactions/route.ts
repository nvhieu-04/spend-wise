import { auth } from "~/server/auth";
import { TransactionService } from "~/server/transaction";

// GET all transactions for the current user
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10);
    const result = await TransactionService.getUserTransactions(
      session.user.id,
      page,
      pageSize,
    );
    return Response.json(result);
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}

// POST create a new transaction
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const transaction = await TransactionService.createTransaction(
      data,
      session.user.id,
    );

    return Response.json(transaction);
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
