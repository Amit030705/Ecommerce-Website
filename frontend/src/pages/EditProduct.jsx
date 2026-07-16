import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import ProductForm from "../components/ProductForm";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleUpdate = async (values) => {
    await api.put(`/products/${id}`, values);
    navigate("/seller/dashboard");
  };

  if (loading) return <p className="page-loading">Loading product...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="product-form-page">
      <h2>Edit Product</h2>
      <ProductForm initialValues={product} onSubmit={handleUpdate} submitLabel="Save Changes" />
    </div>
  );
}
