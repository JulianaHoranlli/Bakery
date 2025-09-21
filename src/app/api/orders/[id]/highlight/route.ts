import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { isHighlighted } = await req.json();

  const updated = await prisma.order.update({
    where: { id: Number(params.id) },
    data: { isHighlighted: Boolean(isHighlighted) },
  });

  return NextResponse.json(updated);
}