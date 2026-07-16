import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProductForm from "../components/ProductForm";

export default function AddProduct() {
  const navigate = useNavigate();

  const handleCreate = async (values) => {
    await api.post("/products", values);
    navigate("/seller/dashboard");
  };

  return (
    <div className="product-form-page">
      <h2>Add a New Product</h2>
      <ProductForm onSubmit={handleCreate} submitLabel="Add Product" />
    </div>
  );
}
