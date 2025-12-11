import { Navigate } from "react-router-dom";
import { getSession } from "@/lib/storage";

const Index = () => {
  const session = getSession();
  
  if (session) {
    return <Navigate to="/home" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default Index;
