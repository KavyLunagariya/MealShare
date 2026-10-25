import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Home from "./pages/home/Home";
import About from "./pages/About/About";
import Meals from "./pages/Meals";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ReserverDashboard from "./pages/ReserverDashboard/ReserverDashboard";
import FoodListerDashboard from "./pages/FoodListerDashboard/FoodListerDashboard";
import CreateListing from "./pages/CreateListing/CreateListing";
import ManageListings from "./pages/ManageListings/ManageListings";
import Reservations from "./pages/Reservations/Reservations";
import PartnerProfile from "./pages/PartnerProfile/PartnerProfile";
import PartnerSettings from "./pages/PartnerSettings/PartnerSettings";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";

function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <>
      {!isLandingPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reserver-dashboard" element={<ProtectedRoute allowedRole="reserver"><ReserverDashboard /></ProtectedRoute>} />
        <Route path="/food-lister-dashboard" element={<ProtectedRoute allowedRole="food-lister"><FoodListerDashboard /></ProtectedRoute>} />
        <Route path="/create-listing" element={<ProtectedRoute allowedRole="food-lister"><CreateListing /></ProtectedRoute>} />
        <Route path="/manage-listings" element={<ProtectedRoute allowedRole="food-lister"><ManageListings /></ProtectedRoute>} />
        <Route path="/reservations" element={<ProtectedRoute allowedRole="food-lister"><Reservations /></ProtectedRoute>} />
        <Route path="/partner-profile" element={<ProtectedRoute allowedRole="food-lister"><PartnerProfile /></ProtectedRoute>} />
        <Route path="/partner-settings" element={<ProtectedRoute allowedRole="food-lister"><PartnerSettings /></ProtectedRoute>} />
        <Route path="*" element={<main style={{ padding: "4rem 1.5rem", textAlign: "center" }}><h1>Page not found</h1><p>The page you requested does not exist.</p></main>} />
      </Routes>
    </>
  );
}

export default function App() {
  return <AuthProvider><BrowserRouter><AppLayout /></BrowserRouter></AuthProvider>;
}
