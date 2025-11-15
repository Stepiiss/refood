import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Logo from "../components/logo";
import Navbar from "../components/navbar";

export default function Home() {
  const { user } = useAuth();

  return (
    
    <div className="min-h-screen bg-[#25A73D] w-screen">
      <Navbar/>
      <div className="flex items-center justify-center min-h-screen">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#25A73D]/90 to-[#25A73D]"/>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Logo className="h-20 mx-auto mb-6" />
            
           
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-2xl mx-auto">
              Zachraňte jídlo, šetřete peníze a pomozte planetě
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/offers"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base !text-black font-medium rounded-xl text-[#25A73D] bg-white hover:bg-green-50 transition shadow-lg hover:scale-105 transform duration-200"
              >
                Prohlédnout produkty
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}