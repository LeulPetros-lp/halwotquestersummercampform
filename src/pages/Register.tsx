import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import PDFUpload from "@/components/PDFUpload";
import PaymentNotice from "@/components/PaymentNotice"; // This component might become unused if payment verification is removed

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
import { submitRegistration, RegistrationFormData, uploadReceipt } from "@/lib/api"; // Removed verifyCBEPayment
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPaymentUploaded, setIsPaymentUploaded] = useState(false);
  // Removed states related to previous payment verification logic
  // const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  // const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'verified' | 'failed'>('pending');
  // const [verificationResult, setVerificationResult] = useState<any>(null);

  // Added state to store the uploaded receipt URL
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState<string | null>(null);
  
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

    },
  });
  
  const handleHobbySelect = (value: string) => {
    setValue("hobbies", value, { shouldValidate: true });
  };

  // Removed handleDrop and dragActive state as PDFUpload component handles the drop now
  // const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setDragActive(false);
    
  //   const file = e.dataTransfer.files?.[0];
  //   if (file) {
  //     handleFileUpload(file);
  //   }
  // };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    console.log('File upload started');
    setReceiptFile(null);
    setUploadedReceiptUrl(null); // Clear previous URL
    setUploadError(null);
    clearErrors('receipt');
    setError('receipt', { type: 'manual', message: '' });

    // Validate file type (if it's not a PDF, ImgBB might handle it, but you might want to restrict)
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setUploadError('Invalid file type. Please upload an image or PDF file.');
        setIsUploading(false);
        return;
    }

    setIsUploading(true);
    try {
      // Upload file to ImgBB
      const receiptData = await uploadReceipt(file);
      setReceiptFile(file);
      setUploadedReceiptUrl(receiptData.url); // Store the URL received from ImgBB
      setIsPaymentUploaded(true);
      setUploadError(null);
      
      toast({
        title: "Receipt Uploaded",
        description: "Your receipt has been successfully uploaded!",
        variant: "default"
      });

    } catch (err: any) {
      console.error('Error uploading file:', err);
      setUploadError(err.message || 'Failed to upload file. Please try again.');
      setIsPaymentUploaded(false);
      setUploadedReceiptUrl(null); // Reset URL on error
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: err.message || 'Failed to upload file. Please try again.',
      });
    } finally {
      setIsUploading(false);
      console.log('File upload finished');
    }
  };

  // The processPayment function block was problematic and removed as per instructions and error analysis.
  // If payment verification via CBE is still required, this function needs to be reimplemented fully.
  // For now, the process relies on manual payment and receipt upload to ImgBB.

  const onSubmit = async (formData: RegistrationForm) => {
    try {
      if (!receiptFile || !uploadedReceiptUrl) { // Ensure both file and its URL are present
        toast({
          variant: "destructive",
          title: "Receipt Required",
          description: "Please upload a receipt before submitting.",
        });
        return;
      }
      setIsUploading(true); // Renamed from isSubmitting to isUploading for consistency with the button disable state
      
      // Add '09' prefix to phone number
      const phoneNumber = '09' + formData.emergencyContact;
      
      try {
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

          receiptUrl: uploadedReceiptUrl, // Use the stored uploadedReceiptUrl
          paymentDate: new Date().toISOString(),
          // Default to 'pending' or 'completed' based on your backend payment verification flow
          // If you have a separate backend verification, it might be 'pending' initially.
          // For now, assuming payment is considered 'completed' upon receipt upload and form submission.
          status: 'completed', 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const result = await submitRegistration(registrationData);
        
        if (result.success) {
          reset();
          setReceiptFile(null);
          setUploadedReceiptUrl(null); // Clear URL after successful submission
          setIsPaymentUploaded(false); // Reset upload status
          
          toast({
            title: "Registration Successful",
            description: "Your registration has been submitted!",
            variant: "default"
          });

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
        console.error('Submission or upload error:', error);
        throw new Error('Failed to submit registration. Please try again.');
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

      {/* Background Image or PDFs with Transition */}
      <div className="fixed inset-0 -z-10">
        {transitionImages.map((imageOrPDF, index) => (
          <div
            key={imageOrPDF}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${imageOrPDF})`,
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
              </div> {/* End of Input Fields Grid */}

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
                </div> {/* End of Allergies div */}

                {/* Payment Receipt Upload */}
                <div className="w-full sm:col-span-2">
                  <PDFUpload 
                    isUploading={isUploading}
                    uploadError={uploadError}
                    onFileChange={handleFileChange}
                    errors={errors}
                    // Optionally pass receiptFile to PDFUpload if you want to display file name
                    receiptFile={receiptFile}
                  />
                  {receiptFile && !uploadError && (
                    <div className="mt-2 text-white text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{receiptFile.name} uploaded.</span>
                      <Check className="h-4 w-4 text-green-400" />
                    </div>
                  )}
                </div>

                {/* Orange Warning Notice */}
                <div className="w-full sm:col-span-2">
                  <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4" role="alert">
                    <p className="font-bold">Important Note</p>
                    <p>Note: The teen must attend all 6 days of the camp.</p>
                    <p>Payment Amount: 1000 Birr</p>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-4 space-y-4 w-full sm:col-span-2"> {/* Added w-full sm:col-span-2 for consistent layout */}
                  {/* CBE Payment */}
                  <div className="border-2 border-purple-400 rounded-lg p-4 bg-purple-50 shadow-md">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">CBE</div>
                      <h4 className="font-bold text-purple-800 text-lg">Bank Transfer</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <p className="font-medium text-gray-800">Send payment to:</p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold min-w-[120px]">Account Name:</span>
                          <span className="bg-white px-3 py-1 rounded border font-medium">Meaza Mesfin And Gulilat Yishak</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold min-w-[120px]">Account Number:</span>
                          <span className="bg-white px-3 py-1 rounded border font-mono font-medium">1000708766643</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold min-w-[120px]">Bank:</span>
                          <span className="bg-white px-3 py-1 rounded border">Commercial Bank of Ethiopia (CBE)</span>
                        </div>
                      </div>
                      <div className="text-sm text-purple-800 bg-purple-100 p-2 rounded mt-2">
                       <strong>Please make sure to include summercamp on the reason of payment</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div> {/* End of Grade Section and additional fields, wrapping the Payment and Church Member parts */}

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting || isUploading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </div>
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