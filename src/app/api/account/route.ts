import { NextResponse } from "next/server";
import _stripe from "stripe";

const stripe = new _stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST() {
  try {
    const account = await stripe.accounts.create({
      controller: {
        stripe_dashboard: {
          type: "none",
        },
        fees: {
          payer: "application",
        },
        losses: {
          payments: "application",
        },
        requirement_collection: "application",
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      country: "BR",
    });

    return NextResponse.json({
      account: account.id,
    });
  } catch (error) {
    console.error("An error occurred when calling the Stripe API to create an account", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

