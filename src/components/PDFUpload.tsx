import React from 'react';
import { Upload, Loader2, X, FileText, ArrowLeft } from 'lucide-react';

interface PDFUploadProps {
  isUploading: boolean;
  uploadError: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: any;
  onReset?: () => void; // Called when user clicks back/reset
  receiptFile?: File | null;
}

const PDFUpload: React.FC<PDFUploadProps> = ({ isUploading, uploadError, onFileChange, errors, onReset }) => {
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);

  // Reset upload state
  const handleReset = () => {
    setUploadedFileName(null);
    if (typeof onFileChange === 'function') {
      // Use 'unknown as' to satisfy TypeScript
      const fakeEvent = { target: { files: [] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      onFileChange(fakeEvent);
    }
    if (typeof onReset === 'function') {
      onReset();
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFileName(e.target.files[0].name);
    } else {
      setUploadedFileName(null);
    }
    onFileChange(e);
  };

  return (
    <div className="space-y-1.5 sm:space-y-2 w-full sm:col-span-2 pt-4">
      {uploadedFileName && !isUploading ? (
        <div className="relative flex flex-col items-center justify-center mb-2 bg-green-50 border border-green-200 rounded-lg py-4 px-2">
          <button
            type="button"
            className="absolute left-2 top-2 p-1 rounded-full hover:bg-green-100 focus:outline-none"
            aria-label="Back to upload"
            onClick={handleReset}
          >
            <ArrowLeft className="w-6 h-6 text-green-700" />
          </button>
          <span className="inline-flex items-center justify-center rounded-full bg-green-200 p-2 mb-2 mt-2">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </span>
          <span className="text-green-700 font-bold text-lg mb-1 mt-1">File uploaded successfully!</span>
          <span className="text-green-900 text-sm break-all font-mono">{uploadedFileName}</span>
        </div>
      ) : (
        <label htmlFor="receipt" className="text-white text-base font-bold block mb-2 text-left">
          Upload Payment image or PDF receipt <span className="text-red-500">*</span>
        </label>
      )}
      {!uploadedFileName && (
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-transparent border-orange-200 shadow-lg`}
          >
            {isUploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent rounded-lg">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
                <p className="text-sm font-medium text-white">Uploading...</p>
              </div>
            ) : uploadError ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <X className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-sm font-medium text-red-500">
                  {uploadError || 'Invalid file'}
                </p>
                <p className="text-xs text-red-400 mt-1">
                  Please upload a valid file
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-orange-500" />
                <p className="mb-2 text-sm text-white text-left">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-white/70 text-left">Any file type accepted</p>
              </div>
            )}
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      )}
      {errors?.receipt && (
        <p className="text-red-300 text-xs sm:text-sm mt-1 text-center">
          {errors.receipt.message?.toString()}
        </p>
      )}
    </div>
  );
};

export default PDFUpload;
