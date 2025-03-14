import { NextResponse } from 'next/server'
import {
  CompleteCheckoutDocument,
  CountryCode,
  CreateExampleCheckoutDocument,
  GetStoreOfferDocument,
  AddLinesToCheckoutDocument,
  UpdateCheckoutMetadataDocument,
  UpdateDeliveryDocument,
  GetStoreOfferQuery,
  AddLinesToCheckoutMutation,
} from "../../../../generated/graphql-server";
import { client } from "../../../lib/create-graphql-client-server";

type SuccessfulResponse = {
  orderId: string;
};

type ErrorResponse = {
  errorMessage: string;
};

type ParsedOfferPrice = {
  amount: number;
  currency: string;
};

export type AddToCartResponseData = SuccessfulResponse | ErrorResponse;

export async function POST(req: Request) {
  console.info("Add to cart has been called");
  const body = await req.json();

  console.log("body:", body);
  const offerId = body?.variantId as string;
  const checkoutId = body?.checkoutId as string;

  if (!offerId) {
    console.error("Offer Id has not been specified");
    return NextResponse.json({ errorMessage: "offerId has not been provided" }, { status: 400 });
  }

  let offerQuery: GetStoreOfferQuery;
  // Get the offer page to find the variant ID and price
  try {
    offerQuery = await client.request(GetStoreOfferDocument, {
      id: offerId,
    });
      
  } catch (error) {
    console.error("Error while getting offer details");
    console.error(error);
    return NextResponse.json({
      errorMessage: `Could not pull data for offer ${offerId}. Error: ${error}`,
    }, { status: 400 });
  }
  
  // if (offerQuery.error) {
  //   console.error("Error while getting offer details");
  //   console.error(offerQuery.error);
  //   return res.status(400).json({
  //     errorMessage: `Could not pull data for offer ${offerId}. Error: ${offerQuery.error.message}`,
  //   });
  // }

  const offerPage = offerQuery.page;

  if (!offerPage) {
    console.error(`Offer page ${offerId} not found`);
    return NextResponse.json({ errorMessage: "Offer page not found" }, { status: 400 });
  }

  // Extract variant ID and price from offer attributes
  const variantId = offerPage.attributes.find((attr) => attr.attribute.slug === "offer-variant")
    ?.values[0]?.reference;

  if (!variantId) {
    console.error("Variant ID not found in offer attributes");
    return NextResponse.json({ errorMessage: "Variant ID not found in offer" }, { status: 400 });
  }

  const offerPriceAttribute = offerPage.attributes.find(
    (attr) => attr.attribute.slug === "offer-price"
  );
  const rawOfferPrice = offerPriceAttribute?.values[0]?.name;
  const offerPrice = JSON.parse(rawOfferPrice || "{}") as ParsedOfferPrice;

  if (!offerPrice?.amount) {
    console.error("Offer price not found in offer attributes");
    return NextResponse.json({ errorMessage: "Offer price not found" }, { status: 400 });
  }

  console.log("Offer price: ", offerPrice);

  let addLinesToCheckoutMutation: AddLinesToCheckoutMutation;

  try {
    addLinesToCheckoutMutation = await client.request(AddLinesToCheckoutDocument, {
      id: checkoutId,
    lines: [
        {
          quantity: 1,
          variantId,
          price: offerPrice.amount,
        },
      ],
    })
  } catch (error) {
    console.error("Error while adding lines to checkout");
    console.error(error);
    return NextResponse.json({
      errorMessage: `Could not add lines to checkout. Error: ${error}`,
    }, { status: 400 });
  }

  console.log(
    "Create checkout mutation: ",
    addLinesToCheckoutMutation.checkoutLinesAdd?.errors
  );

  const checkout = addLinesToCheckoutMutation;

  if (!checkout) {
    console.error("Checkout has not been created");
    return NextResponse.json({
      errorMessage: "Checkout has not been created",
    }, { status: 400 });
  }

  // console.log("Checkout created: ", checkout.id);
  console.log("checkout:", checkout);

  return NextResponse.json({
    checkout,
  }, { status: 200 });

  console.log("Setting delivery method");

  // write the offer id to checkout metadata
  // const updateCheckoutMutation = await client
  //   .mutation(UpdateCheckoutMetadataDocument, {
  //     id: checkout.id,
  //     metadata: [
  //       { key: "offerId", value: offerId },
  //       { key: "offerName", value: offerPage.title },
  //     ],
  //   })
  //   .toPromise();

  // if (updateCheckoutMutation.error) {
  //   console.error(updateCheckoutMutation.error);
  //   return res.status(400).json({
  //     errorMessage: `Could not update checkout metadata. Error: ${updateCheckoutMutation.error.message}`,
  //   });
  // }

  // const shippingMethodId = checkout.shippingMethods[0]?.id;

  // if (!shippingMethodId) {
  //   console.error("Shipping method ID not found");
  //   return res.status(400).json({
  //     errorMessage: "Shipping method ID not found",
  //   });
  // }

  // const updateDeliveryMutation = await client
  //   .mutation(UpdateDeliveryDocument, {
  //     id: checkout.id,
  //     methodId: shippingMethodId,
  //   })
  //   .toPromise();

  // if (updateDeliveryMutation.error) {
  //   console.error(updateDeliveryMutation.error);
  //   return res.status(400).json({
  //     errorMessage: `Could not update delivery. Error: ${updateDeliveryMutation.error.message}`,
  //   });
  // }

  // console.log("Completing checkout");

  // const completeCheckoutMutation = await client
  //   .mutation(CompleteCheckoutDocument, {
  //     id: checkout.id,
  //   })
  //   .toPromise();

  // if (completeCheckoutMutation.error) {
  //   console.error(completeCheckoutMutation.error);
  //   return res.status(400).json({
  //     errorMessage: `Could not complete checkout. Error: ${completeCheckoutMutation.error.message}`,
  //   });
  // }

  // console.log("Checkout completed");

  // const orderId = completeCheckoutMutation.data?.checkoutComplete?.order?.id;

  // if (!orderId) {
  //   console.error("Order ID not found");
  //   return res.status(400).json({
  //     errorMessage: "Order ID not found",
  //   });
  // }

  // return res.status(200).json({
  //   orderId,
  // });
}
