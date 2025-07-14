import { Button } from "@/components/ui/button";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Phone, MapPin, CheckCircle } from 'lucide-react';
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { submitRegistration } from "@/lib/api";
import { Loader2 } from "lucide-react";

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { formData } = location.state || {};

  useEffect(() => {
    const completeRegistration = async () => {
      if (!formData) return;
      
      try {
        setIsSubmitting(true);
        const result = await submitRegistration(formData);
        
        if (result.success) {
          setIsSuccess(true);
          // Clear form data from state
          window.history.replaceState({}, document.title);
        } else {
          throw new Error(result.error || 'Failed to complete registration');
        }
      } catch (err) {
        console.error('Registration error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while completing your registration');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (formData) {
      completeRegistration();
    }
  }, [formData]);

  if (!formData && !isSuccess) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8 text-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            {isSubmitting ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Completing Your Registration</h2>
                <p className="text-gray-600">Please wait while we process your registration...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-red-100 p-3 mb-4">
                  <svg
                    className="h-12 w-12 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Incomplete</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.href = "/register"}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-base font-medium rounded-md shadow-sm"
                >
                  Return to Registration
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                  Registration Complete!
                </h2>
                <p className="text-gray-600 mb-6">
                  Thank you for registering for the Halwot Questers Summercamp. 
                  Your payment has been received and your spot is confirmed.
                </p>
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 text-left">
                  <p className="font-medium text-green-800">What's Next?</p>
                  <ul className="list-disc pl-5 mt-2 text-green-700 space-y-1">
                    <li>You'll receive a confirmation email with all the details</li>
                    <li>Check your inbox for the camp schedule and what to bring</li>
                    <li>Contact us if you have any questions</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-base font-medium rounded-md shadow-sm"
                  >
                    Register Another Participant
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://maps.app.goo.gl/example', '_blank')}
                    className="flex items-center justify-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    View Camp Location
                  </Button>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-12 bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Our Location</h3>
            <div className="aspect-w-16 aspect-h-9 w-full mb-8">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.8918681348973!2d38.76349457548018!3d8.982096989720445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85f972cb2efd%3A0x376f1b1133620645!2sHalwot%20Emmanuel%20united%20Church!5e0!3m2!1sen!2set!4v1751907970658!5m2!1sen!2set"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="rounded-lg"
                title="Our Location"
              />
            </div>
            
            <div className="space-y-6 mt-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Phone className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Call Us</h4>
                    <div className="space-y-1 mt-1">
                      <p className="text-gray-600">
                        <a href="tel:+251934815617" className="hover:text-orange-500 transition-colors">
                          +251 934 815 617
                        </a>
                      </p>
                      <p className="text-gray-600">
                        <a href="tel:+251934815617" className="hover:text-orange-500 transition-colors">
                        +251 903 412 222
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-4 pt-4 border-t border-gray-200">
                  <MapPin className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Visit Us</h4>
                    <p className="text-gray-600 mt-1">
                      Wollo Sefer, Addis Ababa<br />
                      Around Future Talent Academy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
