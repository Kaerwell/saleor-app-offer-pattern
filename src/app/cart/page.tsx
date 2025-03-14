"use client";

import React from "react";
import { useCart } from "../../providers/CartProvider";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { checkout, loading, isCartEmpty, itemsCount } = useCart();

  if (loading) {
    return <div className="container mx-auto p-4">Loading cart...</div>;
  }

  if (isCartEmpty) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p>Your cart is empty.</p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart ({itemsCount} items)</h1>

      <div className="divide-y">
        {checkout?.lines?.map((line) => (
          <div key={line.id} className="py-4 flex items-center">
            {line.variant?.product?.thumbnail && (
              <div className="w-24 h-24 relative mr-4">
                <Image
                  src={line.variant.product.thumbnail.url}
                  alt={line.variant.product.name || "Product"}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-medium">{line.variant?.product?.name}</h3>
              <p className="text-sm text-gray-600">{line.variant?.name}</p>
              <p className="mt-1">Quantity: {line.quantity}</p>
            </div>

            <div className="text-right">
              <p className="font-medium">
                {line.totalPrice.gross.amount} {line.totalPrice.gross.currency}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>
            {checkout?.subtotalPrice.gross.amount} {checkout?.subtotalPrice.gross.currency}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/checkout"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 inline-block text-center"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
