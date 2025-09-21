import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { customer, phone, address, pickup, items, sideNote, pickupTime } = await req.json();

    if (!customer || !phone || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Validim numri telefoni (10 shifra dhe fillon me 06)
    let warning = null;
    if (!/^06\d{8}$/.test(phone)) {
      warning = "⚠️ Numri i telefonit nuk është i saktë (duhet të ketë 10 shifra dhe të fillojë me 06).";
    }

    const newOrder = await prisma.order.create({
      data: {
        customer,
        phone,
        address,
        pickup,
        sideNote,
        status: "pending",
        pickupTime: pickupTime ? new Date(pickupTime) : null, // ✅ pickupTime ruhet si Date
        items: {
          create: items.map((i: any) => ({
            product: i.product,
            quantity: Number(i.quantity),
            price: Number(i.price),
            total: Number(i.quantity) * Number(i.price),
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({
      ...newOrder,
      ...(warning ? { warning } : {}), // paralajmërim nëse ka
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}