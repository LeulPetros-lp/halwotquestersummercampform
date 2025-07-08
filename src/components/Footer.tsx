import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-orange-600 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Map Section - Made larger */}
          <div className="h-80 md:h-96 lg:h-[32rem] w-full rounded-xl overflow-hidden shadow-2xl">
         
           
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.8918681348973!2d38.76349457548018!3d8.982096989720445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85f972cb2efd%3A0x376f1b1133620645!2sHalwot%20Emmanuel%20united%20Church!5e0!3m2!1sen!2set!4v1751907970658!5m2!1sen!2set"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
              className="w-full h-full"
            ></iframe>
          </div>

          {/* Contact Information - Adjusted for better spacing */}
          <div className="space-y-8 pt-4 lg:pt-12">
            <h2 className="text-2xl md:text-3xl font-bold">Contact Us</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Location</h3>
                  <p className="text-orange-100">
                    Wollo Sefer, Addis Ababa<br />
                    Around Future Talent Academy
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Phone className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Call Us</h3>
                  <p className="text-orange-100">
                    <a href="tel:+251934815617" className="hover:underline">+251 934 815 617</a>
                  </p>
                  <p className="text-orange-100">
                    <a href="tel:+251934815617" className="hover:underline">+251 934 815 617</a>
                  </p>
                </div>
              </div>

       
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-orange-500 text-center">
          <p className="text-orange-100">
            © {new Date().getFullYear()} Halwot Questers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
