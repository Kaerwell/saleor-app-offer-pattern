import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GetProductOfferDocument,
  GetProductOfferQuery,
  GetProductOffersDocument,
  GetProductOffersQuery,
  GetProductDocument,
  GetProductQuery,
} from "../../../generated/graphql";
import { createClient } from "../../lib/create-graphql-client";

import { DEFAULT_CHANNEL, SALEOR_API_URL } from "../../const";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/format-price";

const client = createClient(SALEOR_API_URL, async () => {
  // For frontend queries we don't need auth
  return Promise.resolve({ token: "" });
});

type ParsedOfferPrice = {
  amount: number;
  currency: string;
};

const getProduct = async (id: string): Promise<GetProductQuery> => {
  const result = await client
    .query(GetProductDocument, { id, channel: DEFAULT_CHANNEL })
    .toPromise();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("No data returned from the query");
  }

  return result.data;
};

const getProductOffer = async (id: string): Promise<GetProductOfferQuery> => {
  const result = await client.query(GetProductOfferDocument, { id }).toPromise();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("No data returned from the query");
  }

  return result.data;
};

const getProductOffers = async (offerIds: string[]): Promise<GetProductOffersQuery> => {
  const result = await client.query(GetProductOffersDocument, { ids: offerIds }).toPromise();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("No data returned from the query");
  }

  return result.data;
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

  const { data: productData, isLoading: isLoadingProduct } = useQuery<GetProductQuery>({
    queryKey: ["product", productOfferId],
    queryFn: () => getProduct(productOfferId || ""),
    enabled: !!productOfferId,
  });

  console.log("productData: ", productData);

  const description = JSON.parse(productData?.product?.description || "{}") as ParsedDescription;

  const { data: productOfferData, isLoading: isLoadingProductOffer } =
    useQuery<GetProductOfferQuery>({
      queryKey: ["productOffer", productOfferId],
      queryFn: () => getProductOffer(productOfferId || ""),
      enabled: !!productOfferId,
    });

  const attributes = productOfferData?.page?.attributes;

  const productOffersIds = attributes
    ?.find((attr) => attr.attribute.slug === "product-offers")
    ?.values.map((value) => value.reference)
    .filter((ref): ref is string => typeof ref === "string");

  const { data: productOffersData, isLoading: isLoadingProductOffers } =
    useQuery<GetProductOffersQuery>({
      queryKey: ["productOffers", productOfferId],
      queryFn: () => getProductOffers(productOffersIds || []),
      enabled: !!productOffersIds,
    });

  const productOfferName = attributes?.find((attr) => attr.attribute.slug === "product-offer-name")
    ?.values[0]?.name;
  const productOfferDescription = attributes?.find(
    (attr) => attr.attribute.slug === "product-offer-description"
  )?.values[0]?.name;
  const productImageAttribute = attributes?.find(
    (attr) => attr.attribute.slug === "product-offer-image"
  );

  const wholeSaleOffer = productOffersData?.pages?.edges.find(
    (edge) =>
      edge.node.attributes.find((attr) => attr.attribute.slug === "variant")?.values[0]?.slug ===
      "wholesale"
  );
  const wholeSalePriceRaw = wholeSaleOffer?.node.attributes.find(
    (attr) => attr.attribute.slug === "offer-price"
  )?.values[0]?.name;

  const wholeSaleOfferPrice = JSON.parse(wholeSalePriceRaw || "{}") as ParsedOfferPrice;

  const privateLabelOffer = productOffersData?.pages?.edges.find(
    (edge) =>
      edge.node.attributes.find((attr) => attr.attribute.slug === "variant")?.values[0]?.slug ===
      "private-label"
  );

  const privateLabelOfferPriceRaw = privateLabelOffer?.node.attributes.find(
    (attr) => attr.attribute.slug === "offer-price"
  )?.values[0]?.name;

  const privateLabelOfferPrice = JSON.parse(privateLabelOfferPriceRaw || "{}") as ParsedOfferPrice;

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
                <p className="text-gray-600">Sku: 1002U</p>
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
                <p className="text-gray-600">Sku: 1002U</p>
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

              <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-6">
                DESIGN YOUR PRIVATE LABEL
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
            {description.blocks.map((block) => block.data.text).join("\n")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductPage;
