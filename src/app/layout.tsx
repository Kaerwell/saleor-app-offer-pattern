import { AuthProvider } from "./AuthProvider";
import Providers from "./Providers";
export const metadata = {
  title: "Kinde Auth",
  description: "Kinde with Next.js App Router",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    </AuthProvider>
  );
}
