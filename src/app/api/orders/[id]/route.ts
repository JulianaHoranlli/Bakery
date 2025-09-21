import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = Number(params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch order", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const orderId = Number(params.id);
  try {
    const {
      customer,
      phone,
      address,
      pickup,
      status,
      items,
      sideNote,
      pickupTime, // 🔥 fusha e re
    } = await req.json();

    if (!customer || !phone || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Validim numri telefoni
    let warning = null;
    if (!/^06\d{8}$/.test(phone)) {
      warning =
        "⚠️ Numri i telefonit nuk është i saktë (duhet të ketë 10 shifra dhe të fillojë me 06).";
    }

    // Fshij item-at që nuk janë më në listë
    await prisma.orderItem.deleteMany({
      where: {
        orderId,
        NOT: {
          id: { in: items.filter((i: any) => i.id).map((i: any) => i.id) },
        },
      },
    });

    // Përditëso ose krijo item-at
    for (const item of items) {
      if (item.id) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            product: item.product,
            quantity: Number(item.quantity),
            price: Number(item.price),
            total: Number(item.quantity) * Number(item.price),
          },
        });
      } else {
        await prisma.orderItem.create({
          data: {
            orderId,
            product: item.product,
            quantity: Number(item.quantity),
            price: Number(item.price),
            total: Number(item.quantity) * Number(item.price),
          },
        });
      }
    }

    // Përditëso porosinë (tani përfshin pickupTime)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        customer,
        phone,
        address,
        pickup,
        status,
        sideNote,
        pickupTime: pickupTime ? new Date(pickupTime) : null, // ✅
      },
      include: { items: true },
    });

    return NextResponse.json({
      ...updatedOrder,
      ...(warning ? { warning } : {}),
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update order", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = Number(params.id);
    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete order", details: error.message },
      { status: 500 }
    );
  }
}