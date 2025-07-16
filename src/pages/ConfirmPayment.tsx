import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Loader2, ArrowLeft } from 'lucide-react';
import { useState, useRef } from "react";
import { uploadReceipt, updateRegistrationWithReceipt } from "@/lib/api";

export default function ConfirmPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrationId = location.state?.registrationId;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size too large. Maximum size is 5MB.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Upload receipt to ImgBB
      const receiptData = await uploadReceipt(file);
      
      // Update registration with receipt URL
      if (registrationId) {
        const result = await updateRegistrationWithReceipt(registrationId, receiptData);
        if (result.success) {
          toast({
            title: "Success!",
            description: "Receipt uploaded successfully.",
          });
          navigate('/success');
        } else {
          throw new Error(result.error || 'Failed to update registration');
        }
      } else {
        throw new Error('Registration ID not found');
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload receipt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              className="w-fit mb-4 text-white hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-white">Upload Payment Receipt</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div
                className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-white/50 transition-colors"
                onClick={() => !isLoading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-white/70 mx-auto" />
                  <p className="text-white/80">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-white/60">
                    PNG, JPG, or JPEG (max 5MB)
                  </p>
                </div>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center space-x-2 text-white/80">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Uploading receipt...</span>
                </div>
              )}

              {error && (
                <div className="text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
