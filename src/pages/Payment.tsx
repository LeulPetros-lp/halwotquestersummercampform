import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import { transitionImages } from "@/utils/transitionImages";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData } = location.state || {};
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % transitionImages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!formData) {
      navigate('/register');
    }
  }, [formData, navigate]);

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handlePayment = () => {
    // This will use Chapa's payment link which includes Telebirr as an option
    window.location.href = "https://checkout.chapa.co/checkout/web/payment/PL-WplnfYJznXBH";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {/* Background Images with Transition */}
        <div className="fixed inset-0 -z-10">
          {transitionImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "opacity 1s ease-in-out",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="w-full max-w-2xl mx-auto px-4 py-12 relative z-10">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/register', { state: formData })}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Registration
          </Button>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/10 p-6">
              <CardTitle className="text-2xl font-bold text-white text-center">
                Complete Your Registration
              </CardTitle>
              <CardDescription className="text-white/80 text-center">
                Choose your preferred payment method to secure your spot
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="bg-yellow-50/20 border border-yellow-200/30 rounded-lg p-4">
                <h3 className="font-medium text-yellow-100">Registration Summary</h3>
                <div className="mt-2 text-yellow-50 space-y-2">
                  <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                  <p><span className="font-medium">Phone:</span> {formData.emergencyContact}</p>
                  <p className="mt-2 font-medium">
                    Amount to Pay: <span className="text-yellow-300 text-xl">1000 ETB</span>
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handlePayment}
                  className="w-full py-6 bg-[#00B2FF] hover:bg-[#0095E5] text-white font-bold text-lg"
                >
                  Pay with Telebirr
                </Button>
                
                <div className="bg-[#00B2FF]/10 border border-[#00B2FF]/30 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-white mb-2">Secure Payment</h4>
                  <p className="text-white/80 text-sm">
                    Your payment will be processed securely through Telebirr's payment gateway.
                  </p>
                </div>
                <p className="text-sm text-white/70 text-center mt-4">
                  You'll be redirected to a secure payment page to complete your transaction.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="bg-white/5 p-4 border-t border-white/10">
              <div className="text-xs text-white/60 text-center w-full">
                Your payment is secured with end-to-end encryption
              </div>
            </CardFooter>
          </Card>
          
          <div className="mt-6 text-center text-white/60 text-sm">
            Need help? Call us at <a href="tel:+251934815617" className="text-white hover:underline">+251 93 481 5617</a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
