"use server"

import { client } from "../../lib/create-graphql-client-server";
import { CompleteCheckoutDocument } from "../../../generated/graphql-server";
import { redirect } from "next/navigation";
import stripe from "stripe";

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = async (lineItems: {
  quantity: number;
  unitPrice: { gross: { amount: number } };
  variant: { name: string };
}[], checkoutId: string) => {

  // first we need to call the checkoutComplete mutation
  // this will give the needed confirmationData with the clientSecret

  const checkoutComplete = await client.request(CompleteCheckoutDocument, {
    id: checkoutId,
  });

  const confirmationData = checkoutComplete.checkoutComplete?.confirmationData;

  const session = await stripeClient.checkout.sessions.create({
    payment_intent_data: {
      
    },
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

  console.log("session: ", session);

  if (!session.url) {
    throw new Error("No URL");
  }

  redirect(session.url);
};