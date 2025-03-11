import { AuthConfig, authExchange } from "@urql/exchange-auth";
import { cacheExchange, createClient as urqlCreateClient, fetchExchange } from "urql";

import { getTenantConfig } from "./tenant-config";

interface IAuthState {
  token: string;
}

export const createClient = (url: string, getAuth: AuthConfig<IAuthState>["getAuth"]) =>
  urqlCreateClient({
    url,
    exchanges: [
      cacheExchange,
      authExchange<IAuthState>({
        addAuthToOperation: ({ authState, operation }) => {
          if (!authState || !authState?.token) {
            return operation;
          }

          const fetchOptions =
            typeof operation.context.fetchOptions === "function"
              ? operation.context.fetchOptions()
              : operation.context.fetchOptions || {};

          return {
            ...operation,
            context: {
              ...operation.context,
              fetchOptions: {
                beforeSend: (request: Request) => {
                  console.log('Request headers:', request.headers);
                  return request;
                },
                ...fetchOptions,
                headers: {
                  ...fetchOptions.headers,
                  "Authorization-Bearer": authState.token,
                },
              },
            },
          };
        },
        getAuth,
      }),
      fetchExchange,
    ],
  });
