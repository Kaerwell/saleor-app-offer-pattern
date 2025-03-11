"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  GetStoreOffersQuery,
  GetStorePageQuery,
  GetVariantQuery,
  GetStoreProductOffersQuery,
  GetProductsQuery,
} from "../../../../generated/graphql";
import {
  GetStoreOffersDocument,
  GetStorePageDocument,
  GetStoreProductOffersDocument,
  GetVariantDocument,
  GetProductsDocument,
} from "../../../../generated/graphql";
import { DEFAULT_CHANNEL, SALEOR_API_URL } from "../../../const";
import { createClient } from "../../../lib/create-graphql-client";
import { formatPrice } from "../../../lib/format-price";
import { AddToCartResponseData } from "../../api/add-to-cart";
import { fetchExchange } from "urql";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const client = createClient(SALEOR_API_URL, async () => {
  // For frontend queries we don't need auth
  return Promise.resolve({ token: "" });
});

const getVariant = async (variantId: string): Promise<GetVariantQuery> => {
  const result = await client
    .query(GetVariantDocument, { id: variantId, channel: DEFAULT_CHANNEL })
    .toPromise();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("No data returned from the query");
  }

  return result.data;
};

const getStorePage = async (storeId: string): Promise<GetStorePageQuery> => {
  const result = await client.query(GetStorePageDocument, { id: storeId }).toPromise();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("No data returned from the query");
  }

  return result.data;
};

const getProducts = async (productIds: string[]): Promise<GetProductsQuery> => {
  const result = await client
    .query(GetProductsDocument, { ids: productIds, channel: DEFAULT_CHANNEL })
    .toPromise();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("No data returned from the query");
  }

  return result.data;
};

const getStoreProductOffers = async (offerIds: string[]): Promise<GetStoreProductOffersQuery> => {
  const result = await client.query(GetStoreProductOffersDocument, { ids: offerIds }).toPromise();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("No data returned from the query");
  }

  return result.data;
};

type OfferCardProps = NonNullable<NonNullable<GetProductsQuery["products"]>["edges"][0]>["node"];

type ParsedOfferPrice = {
  amount: number;
  currency: string;
};

const OfferCard = ({ id, name, description, media }: OfferCardProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  if (!id) return null;
  // const variantId = attributes.find((attr) => attr.attribute.slug === "offer-variant")?.values[0]
  //   ?.reference;

  // const productOfferName = attributes.find((attr) => attr.attribute.slug === "product-offer-name")
  //   ?.values[0]?.name;
  // const offerPriceAttribute = attributes.find((attr) => attr.attribute.slug === "offer-price");
  // const productImageAttribute = attributes.find(
  //   (attr) => attr.attribute.slug === "product-offer-image"
  // );
  // const rawOfferPrice = offerPriceAttribute?.values[0]?.name;
  // this is formato of rawOfferPrice: {"amount": 14.99, "currency": "USD"}
  // const offerPrice = JSON.parse(rawOfferPrice || "{}") as ParsedOfferPrice;
  const productImage = media?.[0]?.url;
  // const { data: variantData } = useQuery<GetVariantQuery>({
  //   queryKey: ["variant", variantId],
  //   queryFn: () => getVariant(variantId || ""),
  //   enabled: !!variantId,
  // });

  // const basePrice = variantData?.productVariant?.pricing?.price?.gross;

  const handleBuyClick = async () => {
    // if (!id || !offerPrice) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/add-to-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offerId: id,
          quantity: 1,
        }),
      });

      const data = (await response.json()) as AddToCartResponseData;

      if ("errorMessage" in data) {
        console.error("Error adding to cart:", data.errorMessage);
        // You might want to show an error message to the user here
        return;
      }

      // You might want to show a success message or redirect to cart here
      console.log("Successfully created order:", data.orderId);
      // remove /graphql from SALEOR_API_URL
      const rootPage = SALEOR_API_URL.replace("/graphql/", "");
      console.log(rootPage);
      // redirect to order page
      const orderPage = `${rootPage}/dashboard/orders/${data.orderId}`;
      console.log(orderPage);
      // open in new tab
      window.open(orderPage, "_blank");
    } catch (error) {
      console.error("Error adding to cart:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  console.log("productImage: ", productImage);

  return (
    <Card className="max-w-sm mx-auto overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center space-y-6">
        {/* Product Image */}
        <div className="relative w-48 h-48">
          <Image
            src={productImage || "/product-image-coming-soon.jpeg"}
            alt={name}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Product Title */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">{name}</h2>
        </div>

        {/* View Details Button */}
        <Button
          variant="outline"
          className="w-full max-w-[200px] h-12 text-base font-medium"
          onClick={() => router.push(`/product/${id}`)}
        >
          VIEW DETAILS
        </Button>
      </CardContent>
    </Card>
  );
};

const StorePage = ({ id }: { id: string }) => {
  const storeId = id;

  const { data: pageData, isLoading: isLoadingPage } = useQuery<GetStorePageQuery>({
    queryKey: ["storePage", storeId],
    queryFn: () => getStorePage(decodeURIComponent(storeId) || ""),
    enabled: !!storeId,
  });

  const productOfferIds =
    pageData?.page?.attributes
      .find((attr) => attr.attribute.slug === "product-offers")
      ?.values.map((value) => value.reference)
      .filter((ref): ref is string => typeof ref === "string") || [];

  const { data: productOffersData, isLoading: isLoadingProductOffers } =
    useQuery<GetStoreProductOffersQuery>({
      queryKey: ["productOffers", productOfferIds],
      queryFn: () => getStoreProductOffers(productOfferIds),
      enabled: productOfferIds.length > 0,
    });

  // need to flat this list
  const productsIds =
    productOffersData?.pages?.edges
      .flatMap(({ node }) =>
        node.attributes
          .find((attr) => attr.attribute.slug === "product")
          ?.values.map((value) => value.reference)
      )
      .filter((ref): ref is string => typeof ref === "string") || [];

  console.log("productsIds: ", productsIds);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery<GetProductsQuery>({
    queryKey: ["products", productsIds],
    queryFn: () => getProducts(productsIds),
    enabled: productsIds.length > 0,
  });

  console.log("productsData: ", productsData);

  if (isLoadingPage) {
    return <div>Loading store details...</div>;
  }

  if (!pageData?.page) {
    return <div>Store not found</div>;
  }

  return (
    <div className="container">
      <h1 className="title">{pageData.page.title}</h1>

      {isLoadingProductOffers ? (
        <div>Loading products...</div>
      ) : (
        <div className="offers-grid">
          {productsData?.products?.edges.map(({ node }) => {
            const productOfferId = productOffersData?.pages?.edges.find(
              (edge) =>
                edge.node.attributes.find((attr) => attr.attribute.slug === "product")?.values[0]
                  ?.reference === node.id
            )?.node.id;
            return (
              <OfferCard
                key={node.id}
                id={productOfferId || ""}
                name={node.name}
                description={node.description}
                // slug={node.slug}
                media={node.media}
                // content={node.description}
                // attributes={node.attributes}
              />
            );
          })}
        </div>
      )}
      <style jsx>{`
        .container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .title {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          color: #1a1a1a;
        }

        .offers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
      `}</style>
    </div>
  );
};

export default StorePage;
