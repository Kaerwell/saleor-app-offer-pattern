import { AuthProvider } from "./AuthProvider";
import Providers from "./Providers";
import { SiteHeader } from "./siteHeader";
export const metadata = {
  title: "Kinde Auth",
  description: "Kinde with Next.js App Router",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body>
          <Providers>
            <SiteHeader />
            <div className="container py-8">{children}</div>
          </Providers>
        </body>
      </html>
    </AuthProvider>
  );
}
