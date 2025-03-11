import Store from "./store";

export default function StorePage({ params }: { params: { id: string } }) {
  const { id } = params;

  return <Store id={id} />;
}
