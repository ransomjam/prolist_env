import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import EditListing from "./pages/EditListing";
import ListingSuccess from "./pages/ListingSuccess";
import ProductPage from "./pages/ProductPage";
import SellerProfile from "./pages/SellerProfile";
import SmartShare from "./pages/SmartShare";
import BuyerPayment from "./pages/BuyerPayment";
import TransactionStatus from "./pages/TransactionStatus";
import ConfirmDelivery from "./pages/ConfirmDelivery";
import Payments from "./pages/Payments";
import BuyerOrders from "./pages/BuyerOrders";
import BuyerTrackOrder from "./pages/BuyerTrackOrder";
import Profile from "./pages/Profile";
import InvoicePage from "./pages/InvoicePage";
import Verify from "./pages/Verify";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/posts/new" element={<CreatePost />} />
            <Route path="/posts/:postId/edit" element={<EditListing />} />
            <Route path="/posts/:postId/success" element={<ListingSuccess />} />
            <Route path="/p/:listingId" element={<ProductPage />} />
            <Route path="/u/:userId" element={<SellerProfile />} />
            <Route path="/product/:listingId" element={<ProductPage />} />
            <Route path="/smart-share/:transactionId" element={<SmartShare />} />
            <Route path="/pay/:transactionId" element={<BuyerPayment />} />
            <Route path="/status/:transactionId" element={<TransactionStatus />} />
            <Route path="/confirm/:transactionId" element={<ConfirmDelivery />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/my-orders" element={<BuyerOrders />} />
            <Route path="/track/:transactionId" element={<BuyerTrackOrder />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/invoice/:transactionId" element={<InvoicePage />} />
            <Route path="/verify" element={<Verify />} />
            {/* Legacy routes */}
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/create-post" element={<Navigate to="/posts/new" replace />} />
            <Route path="/listing-success/:listingId" element={<ListingSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
