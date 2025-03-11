import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";

import { saleorApp } from "../../saleor-app";
import { NextRequest } from "next/server";

/**
 * Required endpoint, called by Saleor to install app.
 * It will exchange tokens with app, so saleorApp.apl will contain token
 */
export async function POST(request: NextRequest) {
  return createAppRegisterHandler({
    apl: saleorApp.apl,
    allowedSaleorUrls: [
      /**
       * You may want your app to work only for certain Saleor instances.
       *
       * Your app can work for every Saleor that installs it, but you can
       * limit it here
       *
       * By default, every url is allowed.
       *
       * URL should be a full graphQL address, usually starting with https:// and ending with /graphql/
       *
       * Alternatively pass a function
       */
    ],
  });
}
