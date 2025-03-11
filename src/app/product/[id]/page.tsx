import Product from "./product";

export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return <Product id={id} />;
}
