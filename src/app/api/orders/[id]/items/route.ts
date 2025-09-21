import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, context: { params: { id: string } }) {
  // Merr param me await
  const { id } = context.params;
  const orderId = Number(id);

  if (!orderId) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  try {
    // Fshij item-et e lidhura
    await prisma.orderItem.deleteMany({ where: { orderId } });

    // Fshij porosine
    await prisma.order.delete({ where: { id: orderId } });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete order", details: error.message },
      { status: 500 }
    );
  }
}