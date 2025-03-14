import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { PropsWithChildren } from "react";
import { Provider } from "urql";
import { createClient } from "../lib/create-graphql-client";
import { SALEOR_API_URL } from "@/const";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";

export function GraphQLProvider(props: PropsWithChildren<{}>) {
  // const { appBridgeState } = useAppBridge();
  // const url = appBridgeState?.saleorApiUrl!;

  const { getToken } = useKindeAuth();

  const token = getToken();

  if (!token) {
    console.warn("No token found");
    return <div>Loading...</div>;
  }

  // if (!url) {
    // console.warn("Install the app in the Dashboard to be able to query Saleor API.");
    // return <div>{props.children}</div>;
  // }

  // console.log("url: ", url)

  const client = createClient(SALEOR_API_URL, async () => Promise.resolve({ token }));

  return <Provider value={client} {...props} />;
}
