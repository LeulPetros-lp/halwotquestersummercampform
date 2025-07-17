import { useNavigate } from "react-router-dom";
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
import { Camera, Plus, X, Upload, Loader2, Check, FileText } from "lucide-react";
import { submitRegistration, RegistrationFormData, uploadReceipt } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

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
  receipt: z.any().optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAgeFocused, setIsAgeFocused] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPaymentUploaded, setIsPaymentUploaded] = useState(false);
  const hobbies = [
    'Reading', 'Sports', 'Singing', 'Drawing',
    'Swimming', 'Cooking', 'Photography', 'Gaming', 'Hiking',
    'Other'
  ];


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % transitionImages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    setError,
    clearErrors,
    watch,
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      age: "",
      gender: "",
      parentName: "",
      emergencyContact: "",
      grade: "",
      hobbies: "",
      allergies: "",
      isChurchMember: false,
    },
  });
  
  const handleHobbySelect = (value: string) => {
    setValue("hobbies", value, { shouldValidate: true });
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    // Reset previous state
    setReceiptFile(null);
    setUploadError(null);
    clearErrors('receipt');
    setError('receipt', { type: 'manual', message: '' });
    
    // Check if file is a PDF or image and has 'telebirr' in the name
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a PDF or image file.');
      setIsPaymentUploaded(false);
      return;
    }
    
    if (!file.name.toLowerCase().includes('telebirr')) {
      setUploadError('Invalid receipt. Please upload the correct payment receipt.');
      setIsPaymentUploaded(false);
      return;
    }

    setIsUploading(true);

    try {
      // Upload the file to ImgBB
      const receiptData = await uploadReceipt(file);
      setReceiptFile(file);
      setValue('receipt', file, { shouldValidate: true });
      setUploadError(null);
      setIsPaymentUploaded(true);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setUploadError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (formData: RegistrationForm) => {
    try {
      if (!receiptFile) {
        toast({
          variant: "destructive",
          title: "Receipt Required",
          description: "Please upload a receipt before submitting.",
        });
        return;
      }

      setIsUploading(true);
      
      // Add '09' prefix to phone number
      const phoneNumber = '09' + formData.emergencyContact;
      let receiptUrl = '';

      try {
        // Upload receipt to ImgBB
        const receiptData = await uploadReceipt(receiptFile);
        receiptUrl = receiptData.url;
        
        // Prepare form data with correct types
        const registrationData: RegistrationFormData = {
          fullName: formData.fullName,
          age: parseInt(formData.age),
          gender: formData.gender,
          parentName: formData.parentName,
          phone: phoneNumber,
          emergencyContact: phoneNumber,
          grade: formData.grade,
          hobbies: formData.hobbies,
          allergies: formData.allergies,
          isChurchMember: formData.isChurchMember || false,
          receiptUrl: receiptUrl,
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Submit registration with receipt
        const result = await submitRegistration(registrationData);
        
        if (result.success) {
          reset();
          setReceiptFile(null);
          // Navigate to thank you page after successful registration
          navigate('/thank-you', { 
            state: { 
              registrationId: result.id,
              formData: registrationData
            } 
          });
        } else {
          throw new Error(result.error || 'Failed to submit registration');
        }
      } catch (error) {
        console.error('Upload error:', error);
        throw new Error('Failed to upload receipt. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit registration. Please try again.",
      });
    } finally {
      setIsUploading(false);
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
                {/* Allergies */}
        



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
                  
                  <div className="space-y-2">
                    <Select 
                      onValueChange={handleHobbySelect}
                      value={watch("hobbies") || ""}
                    >
                      <SelectTrigger className="w-full h-11 sm:h-12 bg-white/90 focus:bg-white border-white/30 focus:ring-2 focus:ring-orange-500 text-base">
                        <SelectValue placeholder="Select a hobby" />
                      </SelectTrigger>
                      <SelectContent>
                        {hobbies.map((hobby) => (
                          <SelectItem key={hobby} value={hobby}>
                            {hobby}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {errors.hobbies && (
                    <p className="text-red-300 text-xs sm:text-sm mt-1">
                      {errors.hobbies.message}
                    </p>
                  )}
                </div>
                </div>

                {/* Allergies */}
                <div className="space-y-1.5 sm:space-y-2 w-full sm:col-span-2">
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

                {/* File Upload */}
                <div className="space-y-1.5 sm:space-y-2 w-full sm:col-span-2 pt-4">
                  <Label htmlFor="receipt" className="text-white text-sm sm:text-base">
                    Upload Payment Receipt (PDF) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        errors.receipt 
                          ? 'border-red-500 bg-red-500/10' 
                          : receiptFile
                            ? 'border-green-500 bg-green-500/10' 
                            : 'border-gray-300 bg-white/90 hover:border-orange-400 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-orange-400'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(false);
                      }}
                      onDrop={handleDrop}
                    >

                      {isUploading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent rounded-lg">
                          <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                          <p className="text-sm font-medium text-white">
                            Uploading...
                          </p>
                        </div>
                      ) : uploadError ? (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <X className="w-8 h-8 text-red-500 mb-2" />
                          <p className="text-sm font-medium text-red-500">
                            {uploadError || 'Invalid receipt'}
                          </p>
                          <p className="text-xs text-red-400 mt-1">
                            Please upload a valid payment receipt
                          </p>
                        </div>
                      ) : receiptFile ? (
                        <div className="flex flex-col items-center p-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-2">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-sm text-white text-center">
                              {receiptFile.name}
                            </p>
                            {!receiptFile.name.toLowerCase().includes('telebirr') && (
                              <span className="text-yellow-300 text-xs mt-1">
                                Not identified as Telebirr receipt
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF only (MAX. 5MB)
                          </p>
                        </div>
                      )}
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  {errors.receipt && (
                    <p className="text-red-300 text-xs sm:text-sm mt-1">
                      {errors.receipt.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Payment Notice */}
                <div className={`border-l-4 p-4 rounded-md ${
                  isPaymentUploaded 
                    ? 'bg-green-50 border-green-400' 
                    : uploadError 
                      ? 'bg-red-50 border-red-400' 
                      : 'bg-yellow-50 border-yellow-400'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {uploadError ? (
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      ) : isPaymentUploaded ? (
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm ${
                        isPaymentUploaded ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {isPaymentUploaded ? (
                          <>
                            <strong>Payment submitted for review</strong> - Thank you for your payment of 1000 ETB for the 6-day camp (food and water included). Our team will verify your payment shortly.
                          </>
                        ) : (
                          <>
                            <strong>Payment required:</strong> Please upload your payment receipt (1000 ETB for 6 days, food and water included).
                            {uploadError && (
                              <span className="block mt-1 text-red-600 font-medium">
                                {uploadError}
                              </span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
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
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-12 sm:h-14 bg-orange-500 hover:bg-orange-600 text-white font-medium text-base sm:text-lg transition-colors mt-4"
                    disabled={isSubmitting || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </Button>
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
