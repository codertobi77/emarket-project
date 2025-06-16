import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      location: true,
      image: true,
      isCertified: true,
    }
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  return NextResponse.json(user);
}