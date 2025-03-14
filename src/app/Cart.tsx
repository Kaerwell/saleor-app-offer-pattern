"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartProvider";
import { useRouter } from "next/navigation";

export default function Cart() {
  const { itemsCount } = useCart();
  const router = useRouter();

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/cart")}>
      <ShoppingCart className="h-6 w-6" />
      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
        {itemsCount}
      </span>
    </Button>
  );
}
