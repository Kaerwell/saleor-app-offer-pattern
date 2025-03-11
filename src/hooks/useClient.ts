import { SALEOR_API_URL } from "@/const";
import { createClient } from "@/lib/create-graphql-client";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { useMemo } from "react";

const useUrqlClient = () => {
  const { getToken } = useKindeAuth();
  const token = getToken();

  const client = useMemo(() => {
    return createClient(SALEOR_API_URL, async () => {
      return Promise.resolve({ token: token || "" });
    });
  }, [token]);

  return client;
};

export default useUrqlClient;
