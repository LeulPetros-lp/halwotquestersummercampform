import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { transitionImages } from "@/utils/transitionImages";
import { Camera } from "lucide-react";
import { submitRegistration, checkIfRegistered, RegistrationFormData } from "@/lib/api";

const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  age: z.string()
    .min(1, "Age is required")
    .refine((val) => parseInt(val) >= 13, {
      message: "You must be at least 13 years old to register",
    }),
  gender: z.string().min(1, "Please select a gender"),
  parentName: z.string().min(2, "Parent/Guardian name is required"),
  emergencyContact: z.string()
    .length(8, "Phone number must be 8 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  grade: z.string().min(1, "Please select a grade"),
  hobbies: z.string().min(1, "Please tell us about your hobbies"),
  allergies: z.string().optional(),
  isChurchMember: z.boolean().default(false),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAgeFocused, setIsAgeFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % transitionImages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationForm) => {
    try {
      // Add '09' prefix to phone number
      const phoneNumber = '09' + data.emergencyContact;
      
      // Check if already registered
      const { exists } = await checkIfRegistered(data.fullName, data.parentName);
      
      if (exists) {
        toast({
          variant: "destructive",
          title: "Already Registered",
          description: "A registration with this name and parent/guardian already exists.",
        });
        return;
      }

      // Prepare form data with correct types
      const formData: Omit<RegistrationFormData, 'emergencyContact'> & { emergencyContact: string } = {
        fullName: data.fullName,
        age: parseInt(data.age),
        gender: data.gender,
        parentName: data.parentName,
        emergencyContact: phoneNumber,
        grade: data.grade,
        hobbies: data.hobbies,
        allergies: data.allergies,
        isChurchMember: data.isChurchMember || false,
      };

      // Submit registration
      const result = await submitRegistration(formData);
      
      if (result.success) {
        reset();
        // Navigate to thank you page after successful submission
        navigate('/thank-you', { state: { formData } });
      } else {
        throw new Error(result.error || 'Failed to submit registration');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit registration. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="w-full max-w-6xl mx-auto py-4 sm:py-8 px-2 sm:px-4 relative z-10">
        {/* Gallery button temporarily disabled
        <Button
          variant="ghost"
          onClick={() => navigate('/gallery')}
          className="text-white hover:bg-white/10 h-10 w-full sm:w-auto sm:px-6 flex items-center justify-center sm:justify-start gap-2"
        >
          <Camera className="h-4 w-4" />
          <span>Gallery Overview</span>
        </Button>
        */}
      </div>

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

      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 relative z-10">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl overflow-hidden mb-8">
          <CardHeader className="border-b border-white/10 p-4 sm:p-6">
            <div className="text-center">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Halwot Questers Summercamp Registration
              </CardTitle>
              <CardDescription className="text-white/80 text-base sm:text-lg mt-2">
                Fill out the form below to secure your spot
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              {/* Input Fields Grid */}
              <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Full Name */}
                <div className="space-y-1.5 sm:space-y-2 w-full">
                  <Label htmlFor="fullName" className="text-white text-sm sm:text-base">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register("fullName")}
                    className="w-full max-w-none h-11 sm:h-12 bg-white/90 focus:bg-white border-white/30 focus:ring-2 focus:ring-orange-500 text-base"
                  />
                  {errors.fullName && (
                    <p className="text-red-300 text-xs sm:text-sm mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Age */}
                <div className="space-y-1.5 sm:space-y-2 w-full">
                  <Label htmlFor="age" className="text-white text-sm sm:text-base">
                    Age <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter age"
                    min="13"
                    {...register("age")}
                    onFocus={() => setIsAgeFocused(true)}
                    onBlur={() => setIsAgeFocused(false)}
                    className="w-full max-w-none h-11 sm:h-12 bg-white/90 focus:bg-white border-white/30 focus:ring-2 focus:ring-orange-500 text-base"
                  />
                  <div className={`transition-all duration-300 overflow-hidden ${isAgeFocused ? 'max-h-20' : 'max-h-0'}`}>
                    <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-2 text-xs sm:text-sm mt-1 rounded">
                      <p>Please enter your age. You must be at least 13 years old to register.</p>
                    </div>
                  </div>
                  {errors.age && (
                    <p className="text-red-300 text-xs sm:text-sm mt-1">
                      {errors.age.message}
                    </p>
                  )}
                </div>

                {/* Parent/Guardian Name */}
                <div className="space-y-1.5 sm:space-y-2 w-full">
                  <Label htmlFor="parentName" className="text-white text-sm sm:text-base">
                    Parent/Guardian Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="parentName"
                    placeholder="Parent's Full Name"
                    {...register("parentName")}
                    className="w-full max-w-none h-11 sm:h-12 bg-white/90 focus:bg-white border-white/30 focus:ring-2 focus:ring-orange-500 text-base"
                  />
                  {errors.parentName && (
                    <p className="text-red-300 text-xs sm:text-sm mt-1">
                      {errors.parentName.message}
                    </p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="space-y-1.5 sm:space-y-2 w-full">
                  <Label htmlFor="emergencyContact" className="text-white text-sm sm:text-base">
                    Emergency Contact <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-700">09</span>
                    </div>
                    <Input
                      id="emergencyContact"
                      placeholder="12345678"
                      {...register("emergencyContact")}
                      className="w-full max-w-none h-11 sm:h-12 bg-white/90 focus:bg-white border-white/30 focus:ring-2 focus:ring-orange-500 text-base pl-12"
                      maxLength={8}
                      onInput={(e) => {
                        // Only allow numbers
                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 8);
                      }}
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-1">
                    Enter 8 digits (will be prefixed with 09)
                  </p>
                  {errors.emergencyContact && (
                    <p className="text-red-300 text-xs sm:text-sm mt-1">
                      {errors.emergencyContact.message}
                    </p>
                  )}
                </div>




              </div>

              {/* Grade Section */}
              <div className="w-full max-w-4xl mx-auto space-y-6">
                <div className="space-y-1.5 sm:space-y-2 w-full">
                  <Label htmlFor="grade" className="text-white text-sm sm:text-base">
                    Grade <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue("grade", value)}>
                    <SelectTrigger className="w-full h-11 sm:h-12 bg-white/90 focus:bg-white border-white/30 focus:ring-2 focus:ring-orange-500 text-base">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Grade 7</SelectItem>
                      <SelectItem value="8">Grade 8</SelectItem>
                      <SelectItem value="9">Grade 9</SelectItem>
                      <SelectItem value="10">Grade 10</SelectItem>
                      <SelectItem value="11">Grade 11</SelectItem>
                      <SelectItem value="12">Grade 12</SelectItem>
                      <SelectItem value="college">College/University</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.grade && (
                    <p className="text-red-300 text-xs sm:text-sm mt-1">
                      {errors.grade.message}
                    </p>
                  )}
                </div>

                {/* Gender Field */}
                <div className="space-y-1.5 sm:space-y-2 w-full">
                  <Label htmlFor="gender" className="text-white text-sm sm:text-base">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue("gender", value)}>
                    <SelectTrigger className="w-full h-11 sm:h-12 bg-white/90 focus:bg-white border-white/30 focus:ring-2 focus:ring-orange-500 text-base">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-red-300 text-xs sm:text-sm mt-1">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                {/* Hobbies */}
                <div className="space-y-1.5 sm:space-y-2 w-full sm:col-span-2">
                  <Label htmlFor="hobbies" className="text-white text-sm sm:text-base">
                    Hobbies & Interests <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="hobbies"
                    placeholder="Tell us about your hobbies and interests..."
                    className="w-full min-h-[100px] bg-white/90 focus:bg-white border-white/30 focus:ring-2 focus:ring-orange-500 text-base"
                    {...register("hobbies")}
                  />
                  {errors.hobbies && (
                    <p className="text-red-300 text-xs sm:text-sm mt-1">
                      {errors.hobbies.message}
                    </p>
                  )}
                </div>

                {/* Allergies */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="allergies" className="text-white text-sm sm:text-base">
                    Allergies or Special Requirements (if any)
                  </Label>
                  <Textarea
                    id="allergies"
                    placeholder="List any allergies, dietary restrictions, or special requirements..."
                    className="min-h-[100px] text-base bg-white/90 focus:bg-white border-white/30 focus:ring-2 focus:ring-orange-500 w-full"
                    {...register("allergies")}
                  />
                  <p className="text-white/60 text-xs sm:text-sm">
                    Please list any medical conditions, allergies, or special requirements we should be aware of.
                  </p>
                </div>

                {/* Church Member Checkbox */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isChurchMember"
                    {...register("isChurchMember")}
                    className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="isChurchMember" className="text-sm sm:text-base text-white">
                    I am a member of the church
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full py-5 sm:py-6 text-lg sm:text-xl bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-white font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-base sm:text-lg">Submitting...</span>
                      </div>
                    ) : (
                      'SUBMIT REGISTRATION'
                    )}
                  </Button>
                </div>

                {/* Payment Information */}
                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-yellow-800 font-medium">
                    Registration Fee: <span className="font-bold">1000 ETB</span>
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Includes 5 days of lunch and water
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;
