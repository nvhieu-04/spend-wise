import { auth } from "~/server/auth";
import { TransactionService } from "~/server/transaction";

// GET all transactions for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const transactions = await TransactionService.getUserTransactions(session.user.id);
    return Response.json(transactions);
  } catch (error) {
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
    const transaction = await TransactionService.createTransaction(data, session.user.id);

    return Response.json(transaction);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
} 