import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import SellerDashboard from './pages/seller/SellerDashboard';
import ManageProducts from './pages/seller/ManageProducts';
import ProductForm from './pages/seller/ProductForm';
import StoreSettingsPage from './pages/seller/StoreSettingsPage';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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