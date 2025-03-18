import { NextResponse } from "next/server";
import _stripe from "stripe";

const stripe = new _stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request, { params }: { params: Promise<{ account: string }> }) {
  try {
    const { account: accountId } = await params;
    console.log("accountId", accountId);

    const account = await stripe.accounts.update(accountId, {
        individual: {
            first_name: "Victor",
            last_name: "Feitosa",
            dob: {
                day: 1,
                month: 1,
                year: 1901,
            },
            address: {
                line1: "address_full_match",
                postal_code: '05511010',
                city: "Sao Paulo",
                state: 'SP'
            },
            email: "victoronline9@gmail.com",
            phone: "+5511999999999",
            political_exposure: "none",
            id_number: '000000000',
        },
      business_profile: {
        mcc: "5999",
        product_description: "Teste",
      },
      tos_acceptance: {
        ip: "127.0.0.1",
        date: Math.floor((new Date()).getTime() / 1000),
      },
      external_account: {
        account_number: "0001234",
        routing_number: "110-0000",
        country: "BR",
        object: "bank_account",
        currency: "brl",
      },
      business_type: "individual",
    });

    return NextResponse.json({
      account: account.id,
    });
  } catch (error) {
    console.error("An error occurred when calling the Stripe API to update an account", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
