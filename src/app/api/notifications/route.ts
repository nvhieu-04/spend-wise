import { NextResponse } from 'next/server';
import { auth } from "~/server/auth";
import { NotificationService } from '~/server/notification';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await NotificationService.getUpcomingPaymentNotifications(session.user.id);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 