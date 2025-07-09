import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Phone, MapPin } from 'lucide-react';
import Footer from "@/components/Footer";

const ThankYou = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8 text-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Thank You for Registering!
            </h2>
            <p className="text-gray-600 mb-8">
              We've received your registration for the Halwot Questers Summercamp. 
              We'll be in touch with you soon with more details.
            </p>
            <Button
              onClick={() => navigate('/register')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-base font-medium rounded-md shadow-sm"
            >
              Back to Registration Form
            </Button>
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
