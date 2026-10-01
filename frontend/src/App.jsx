import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import SellerDashboard from './pages/seller/SellerDashboard';
import ManageProducts from './pages/seller/ManageProducts';
import ProductForm from './pages/seller/ProductForm';
import StoreSettingsPage from './pages/seller/StoreSettingsPage';
import Cart from './pages/Cart';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />

        <Route element={<ProtectedRoute role="seller" />}>
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<ManageProducts />} />
          <Route path="/seller/products/new" element={<ProductForm />} />
          <Route path="/seller/products/:id/edit" element={<ProductForm />} />
          <Route path="/seller/settings" element={<StoreSettingsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;