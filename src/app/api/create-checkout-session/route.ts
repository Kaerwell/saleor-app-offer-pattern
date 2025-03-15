import { NextRequest, NextResponse } from "next/server";
import stripe from "stripe";
import { permanentRedirect, redirect } from 'next/navigation'

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.json();
  const lineItems = body.lineItems;

  const session = await stripeClient.checkout.sessions.create({
    line_items: lineItems.map(
      (item: {
        quantity: number;
        unitPrice: { gross: { amount: number } };
        variant: { name: string };
      }) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.variant.name,
          },
          unit_amount: item.unitPrice.gross.amount * 100,
        },
        quantity: item.quantity,
      })
    ),
    mode: "payment",
    success_url: `https://victor.kaerwell.com/success`,
    cancel_url: `https://victor.kaerwell.com/cancel`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "No URL" }, { status: 500 });
  }

  console.log("session: ", session);

  permanentRedirect(session.url);

  
}
