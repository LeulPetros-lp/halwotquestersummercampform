import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { transitionImages } from '@/utils/transitionImages';
import Footer from '@/components/Footer';

const images = [
  '/transition-images/photo_5870632106906993865_y.jpg',
  '/transition-images/photo_5870632106906993874_y.jpg',
  '/transition-images/photo_5870632106906993895_y.jpg',
  '/transition-images/photo_5870632106906993927_y.jpg',
  '/transition-images/photo_5926885793253673398_y.jpg',
  '/transition-images/photo_5926885793253673401_y.jpg'
];

const headlines = [
  { main: 'Join us for an', highlight: 'Unforgettable Summer' },
  { main: 'Experience the', highlight: 'Adventure of a Lifetime' },
];

const Index = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentText, setCurrentText] = useState(0);

  useEffect(() => {
    const imageTimer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    
    const textTimer = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % headlines.length);
    }, 3500);

    return () => {
      clearInterval(imageTimer);
      clearInterval(textTimer);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 -z-10">
        {images.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              transition: 'opacity 1s ease-in-out',
            }}
          />
        ))}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-6 text-center font-sans">
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 -mt-10">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentText}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                  {headlines[currentText].main}
                  <span className="block -mt-1 text-orange-400">
                    {headlines[currentText].highlight}
                  </span>
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="h-[3.94725rem]"></div>
          {/* <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
            Registration is now open!
          </p> */}

          <div className="mt-0">
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 max-w-md mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold px-10 py-7 text-xl sm:text-2xl rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl w-full sm:w-auto"
                onClick={() => navigate('/register')}
              >
                Register Now
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:text-white font-bold px-10 py-7 text-lg sm:text-xl rounded-2xl transition-all duration-300 w-full sm:w-auto"
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </motion.div>
          </div>

          <motion.div 
            className="mt-6 text-white/70 text-sm sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <p className="font-medium">Limited spots available!</p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
