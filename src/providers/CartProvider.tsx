import React, { createContext, useContext, useState, useEffect } from "react";
import { useMutation, useQuery } from "urql";
import {
  CreateExampleCheckoutDocument,
  AddLinesToCheckoutDocument,
  GetCheckoutDetailsDocument,
  CheckoutDetailsFragment,
  CountryCode,
} from "../../generated/graphql";
import { CreateExampleCheckoutMutation, CheckoutCreateInput } from "../../generated/graphql";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";

interface CartContextType {
  checkout: CheckoutDetailsFragment | null;
  loading: boolean;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  isCartEmpty: boolean;
  itemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checkout, setCheckout] = useState<CheckoutDetailsFragment | null>(null);
  const [loading, setLoading] = useState(true);

  const { getUser } = useKindeAuth()
  const user = getUser()
  const email = user?.email!

    const [, createCheckout] = useMutation(CreateExampleCheckoutDocument);
  // const [, addLines] = useMutation(AddLinesToCheckoutDocument);
  const [checkoutResult, reexecuteQuery] = useQuery({
    query: GetCheckoutDetailsDocument,
    variables: { id: localStorage.getItem("checkoutId") || "" },
    pause: !localStorage.getItem("checkoutId"),
  });
  const { data, fetching, stale } = checkoutResult;

  console.log("fetching: ", fetching)
  console.log("stale: ", stale)

  // Initialize checkout on mount
  useEffect(() => {
    const initializeCheckout = async () => {
      if (fetching || stale) return;
      const storedCheckoutId = localStorage.getItem("checkoutId");

      if (storedCheckoutId) {
        // Validate existing checkout
        // await reexecuteQuery({ requestPolicy: "network-only" });
        console.log("data.tome: ", data?.checkout)

        if (data?.checkout) {
          console.log("data.checkout: ", data.checkout)
          setCheckout(data.checkout);
          setLoading(false);
          return;
        } else {
          // Checkout not found or expired
          localStorage.removeItem("checkoutId");
        }
      }

      // Create new checkout if needed
      await createNewCheckout();
    };

    initializeCheckout();
  }, [fetching, stale]);

  const createNewCheckout = async () => {
    setLoading(true);

    // Create a new empty checkout
    const result = await createCheckout({
      input: {
        billingAddress: {
          firstName: "John",
          lastName: "Doe",
          streetAddress1: "813 Howard Street",
          city: "Oswego",
          countryArea: "NY",
          postalCode: "13126",
          country: CountryCode.Us,
        },
        shippingAddress: {
          firstName: "John",
          lastName: "Doe",
          streetAddress1: "813 Howard Street",
          city: "Oswego",
          countryArea: "NY",
          postalCode: "13126",
          country: CountryCode.Us,
        },
        lines: [], // Start with empty cart
        email, // This should be the authenticated user's email
        channel: "default-channel", // Use your default channel
      },
    });

    if (result.data?.checkoutCreate?.checkout) {
      const newCheckout = result.data.checkoutCreate.checkout;
      localStorage.setItem("checkoutId", newCheckout.id);
      setCheckout(newCheckout);
    }

    setLoading(false);
  };

  const addToCart = async (variantId: string, quantity: number) => {
    if (!checkout?.id) {
      await createNewCheckout();
    }

    const checkoutId = localStorage.getItem("checkoutId");
    if (!checkoutId) return;

    const result = await fetch("/api/add-to-cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkoutId,
        variantId,
        quantity,
      }),
    });

    const data = await result.json();

    console.log("data: ", data)

    if (data?.checkoutLinesAdd?.checkout) {
      setCheckout(data.checkoutLinesAdd.checkout);
    }

    // Reexecute query to get updated checkout
    reexecuteQuery({ requestPolicy: "network-only" });
  };

  // Calculate cart metrics
  const isCartEmpty = !checkout?.lines || checkout.lines.length === 0;
  const itemsCount = checkout?.lines?.reduce((sum, line) => sum + line.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        checkout,
        loading,
        addToCart,
        isCartEmpty,
        itemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
