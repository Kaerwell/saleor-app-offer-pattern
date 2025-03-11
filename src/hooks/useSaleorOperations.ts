import { DEFAULT_CHANNEL } from "@/const";
import useUrqlClient from "./useClient";
import {
  GetProductDocument,
  GetProductQuery,
  GetProductOfferDocument,
  GetProductOfferQuery,
  GetProductOffersDocument,
  GetProductOffersQuery,
  GetVariantsDocument,
  GetVariantsQuery,
} from "../../generated/graphql";

const useSaleorOperations = () => {
  const client = useUrqlClient();

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

  const getVariantsDetails = async (variantIds: string[]): Promise<GetVariantsQuery> => {
    const result = await client
      .query(GetVariantsDocument, { ids: variantIds, channel: DEFAULT_CHANNEL })
      .toPromise();

    if (result.error) {
      throw new Error(result.error.message);
    }

    if (!result.data) {
      throw new Error("No data returned from the query");
    }

    return result.data;
  };

  return { getProduct, getProductOffer, getProductOffers, getVariantsDetails };
};

export default useSaleorOperations;
