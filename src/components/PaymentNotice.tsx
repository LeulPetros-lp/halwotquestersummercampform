import React from 'react';

interface PaymentNoticeProps {
  paymentStatus: 'verified' | 'pending' | 'failed';
  uploadError: string | null;
  verificationResult?: { reference?: string; amount?: string };
}

const PaymentNotice: React.FC<PaymentNoticeProps> = ({ paymentStatus, uploadError, verificationResult }) => (
  <div className={`border-l-4 p-4 rounded-md ${
    paymentStatus === 'verified'
      ? 'bg-green-50 border-green-400'
      : uploadError
      ? 'bg-red-50 border-red-400'
      : 'bg-blue-50 border-blue-400'
  }`}>
    <div className="flex">
      <div className="flex-shrink-0">
        {uploadError ? (
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        ) : paymentStatus === 'verified' ? (
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="ml-3">
        <p className={`text-sm ${
          paymentStatus === 'verified'
            ? 'text-green-700'
            : uploadError
            ? 'text-red-700'
            : 'text-blue-700'
        }`}>
          {paymentStatus === 'verified' ? (
            <>
              <strong>Payment Verified</strong> - Thank you for your payment of 1000 ETB for the 6-day summer camp (food and water included).
            </>
          ) : uploadError ? (
            <>
              <strong>Payment Error:</strong> {uploadError}
            </>
          ) : (
            <>
              <strong>Payment Required:</strong> Complete your registration by making a payment of 1000 ETB for the 6-day summer camp (food and water included) using the CBE payment method below.
            </>
          )}
        </p>
        {paymentStatus === 'verified' && verificationResult?.reference && (
          <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
            <p>Transaction ID: <span className="font-mono">{verificationResult.reference}</span></p>
            {verificationResult.amount && (
              <p>Amount: <span className="font-medium">{verificationResult.amount} ETB</span></p>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default PaymentNotice;
