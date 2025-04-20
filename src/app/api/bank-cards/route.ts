import { auth } from "~/server/auth";
import { BankCardService } from "~/server/card";

// GET all bank cards for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const cards = await BankCardService.getUserCards(session.user.id);
    return Response.json(cards);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}

// POST create a new bank card
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const card = await BankCardService.createCard({
      ...data,
      userId: session.user.id,
    });

    return Response.json(card);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
} 