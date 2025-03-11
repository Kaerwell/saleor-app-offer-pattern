import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GetProductOfferQuery,
  GetProductOffersQuery,
  GetProductQuery,
  GetVariantsQuery,
} from "../../../generated/graphql";
import { AddToCartResponseData } from "../api/add-to-cart";

import { SALEOR_API_URL } from "../../const";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/format-price";
import { useState } from "react";
import useSaleorOperations from "@/hooks/useSaleorOperations";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";

type ParsedOfferPrice = {
  amount: number;
  currency: string;
};

type ParsedDescription = {
  time: string;
  blocks: {
    id: string;
    data: {
      text: string;
    };
  }[];
};

const ProductPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const productOfferId = typeof id === "string" ? id : undefined;

  const { getProduct, getProductOffer, getProductOffers, getVariantsDetails } =
    useSaleorOperations();

  const [isLoading, setIsLoading] = useState(false);

  const { data: productOfferData, isLoading: isLoadingProductOffer } =
    useQuery<GetProductOfferQuery>({
      queryKey: ["productOffer", productOfferId],
      queryFn: () => getProductOffer(productOfferId || ""),
      enabled: !!productOfferId,
    });

  const productId = productOfferData?.page?.attributes.find(
    (attr) => attr.attribute.slug === "product"
  )?.values[0]?.reference;

  const { data: productData, isLoading: isLoadingProduct } = useQuery<GetProductQuery>({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId || ""),
    enabled: !!productId,
  });

  const description = JSON.parse(productData?.product?.description || "{}") as ParsedDescription;

  const productOffersIds = productOfferData?.page?.attributes
    ?.find((attr) => attr.attribute.slug === "product-offers")
    ?.values.map((value) => value.reference)
    .filter((ref): ref is string => typeof ref === "string");

  const { data: productOffersData, isLoading: isLoadingProductOffers } =
    useQuery<GetProductOffersQuery>({
      queryKey: ["productOffers", productOfferId],
      queryFn: () => getProductOffers(productOffersIds || []),
      enabled: !!productOffersIds,
    });

  const variantIds = productOffersData?.pages?.edges
    .map(
      (edge) =>
        edge.node.attributes.find((attr) => attr.attribute.slug === "offer-variant")?.values[0]
          ?.reference
    )
    ?.filter((ref): ref is string => typeof ref === "string");
  console.log("variantIds: ", variantIds);

  const { data: variantData, isLoading: isLoadingVariants } = useQuery<GetVariantsQuery>({
    queryKey: ["variants", variantIds],
    queryFn: () => getVariantsDetails(variantIds || []),
    enabled: !!variantIds,
  });

  const mergeVariantsAndOfferVariant = variantData?.productVariants?.edges.map((edge) => {
    const offerVariant = productOffersData?.pages?.edges.find(
      (inEdge) =>
        inEdge.node.attributes?.find((attr) => attr.attribute.slug === "offer-variant")?.values[0]
          ?.reference === edge.node.id
    );
    console.log("offerVariant: ", edge.node);
    return {
      ...edge.node,
      ...offerVariant?.node,
      type: edge.node.attributes.find((attr) => attr.attribute.slug === "pricing")?.values[0].name,
    };
  });

  const wholeSaleOffer = mergeVariantsAndOfferVariant?.find((edge) => edge.type === "wholesale");
  const wholeSalePriceRaw = wholeSaleOffer?.attributes?.find(
    (attr) => attr.attribute.slug === "offer-price"
  )?.values[0]?.name;

  const wholeSaleOfferPrice = JSON.parse(wholeSalePriceRaw || "{}") as ParsedOfferPrice;

  const privateLabelOffer = mergeVariantsAndOfferVariant?.find(
    (edge) => edge.type === "private label"
  );

  const privateLabelOfferPriceRaw = privateLabelOffer?.attributes?.find(
    (attr) => attr.attribute.slug === "offer-price"
  )?.values[0]?.name;

  const privateLabelOfferPrice = JSON.parse(privateLabelOfferPriceRaw || "{}") as ParsedOfferPrice;

  const handleBuyClick = async (variantId: string, token: string) => {
    // if (!id || !offerPrice) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/add-to-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offerId: variantId,
          quantity: 1,
          token: token,
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

  // get token from local storage
  const { getToken } = useKindeAuth();
  const token = getToken();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="flex justify-center md:justify-start">
          <Image
            src={productData?.product?.media?.[0]?.url || "/product-image-coming-soon.jpeg"}
            alt={productData?.product?.name || "Bio-Ae-Mulsion Forte product"}
            width={400}
            height={500}
            className="object-contain"
            priority
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold mb-6">{productData?.product?.name}</h1>

          <Tabs defaultValue="private-label" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              {privateLabelOffer && (
                <TabsTrigger value="private-label" className="text-lg">
                  Private Label
                </TabsTrigger>
              )}
              {wholeSaleOffer && (
                <TabsTrigger value="wholesale" className="text-lg">
                  Wholesale
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="private-label" className="space-y-6">
              <div className="space-y-2">
                <p className="text-gray-600">Sku: {privateLabelOffer?.sku}</p>
                <p className="text-gray-600">Minimum: 12</p>
                <p className="text-gray-600">Box size: 12</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">TOTAL</span>
                  <span className="text-3xl font-bold">$217.20</span>
                </div>
                <p className="text-gray-600">
                  Unit price: {formatPrice(privateLabelOfferPrice.amount)}
                </p>
              </div>

              <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-6">
                DESIGN YOUR PRIVATE LABEL
              </Button>
            </TabsContent>

            <TabsContent value="wholesale" className="space-y-6">
              {/* Wholesale content would go here */}
              <div className="space-y-2">
                <p className="text-gray-600">Sku: {wholeSaleOffer?.sku}</p>
                <p className="text-gray-600">Minimum: 12</p>
                <p className="text-gray-600">Box size: 12</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">TOTAL</span>
                  <span className="text-3xl font-bold">$217.20</span>
                </div>
                <p className="text-gray-600">
                  Unit price: {formatPrice(wholeSaleOfferPrice.amount)}
                </p>
              </div>

              <Button
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-6"
                onClick={() => handleBuyClick(wholeSaleOffer?.id || "", token || "")}
                disabled={isLoading}
              >
                {isLoading ? "Adding to cart..." : "ADD TO CART"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 inline-block border-b-2 border-black pb-1">
            Product Description
          </h2>
          <p className="text-gray-600 mt-4 leading-relaxed">
            {description?.blocks?.map((block) => block.data.text).join("\n")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductPage;
