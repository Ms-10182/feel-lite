
import Layout from "@/components/layout/Layout";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Register = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // If user is already logged in, redirect to home
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" />;
  }

  return (
    <Layout onCreatePost={() => {}}>
      <div className="max-w-lg mx-auto py-8">
        <h1 className="text-2xl font-bold text-center mb-8">Join Feel-Lite</h1>
        <RegisterForm />
      </div>
    </Layout>
  );
};

export default Register;
