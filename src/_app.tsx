import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

function MyApp({ Component, pageProps }: { Component: React.ComponentType; pageProps: any }) {
  return (
    <KindeProvider>
      <Component {...pageProps} />
    </KindeProvider>
  );
}
export default MyApp;
