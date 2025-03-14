import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import Cart from "./Cart";


export async function SiteHeader() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const firstName = user?.given_name || '';
    const lastName = user?.family_name || '';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 pl-4">
          <Link href="/" className="text-xl font-bold">
            Logotype
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {/* <Link href="/catalog" className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Catalog
          </Link>
          <Link
            href="/private-labels"
            className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            My Private Labels
          </Link> */}
        </nav>

        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 bg-navy-700">
            <AvatarFallback className="bg-[#1a365d] text-white">{firstName?.charAt(0) + lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Cart />
        </div>
      </div>
    </header>
  )
}

