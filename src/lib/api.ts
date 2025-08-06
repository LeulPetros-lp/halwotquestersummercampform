// src/lib/api.ts

/**
 * POST a PDF file to the external verification API and return the parsed response.
 * @param file - The PDF file to upload
 * @param autoVerify - Whether to auto-verify (default: true)
 * @param suffix - A string identifier (e.g., user id or random)
 */
export async function verifyScreenshotAndTelebirr(file: File, autoVerify: boolean = true, suffix: string = "12345678") {
  if (!(file.type.startsWith('image/') || file.type === 'application/pdf')) {
    throw new Error('Only image or PDF files are accepted');
  }
  console.log('Uploading screenshot file:', file);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('autoVerify', autoVerify ? 'true' : 'false');
  formData.append('suffix', suffix);

  const verifyRes = await fetch('https://verifyapi.leulzenebe.pro/verify-image', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY
    },
    body: formData
  });
  if (!verifyRes.ok) throw new Error('Verification failed');
  const verifyData = await verifyRes.json();
  console.log('Verification API response:', verifyData);

  // Scrape and log receipt content if possible
  if (verifyData && typeof verifyData.text === 'string') {
    const { scrapeReceiptData } = await import('./receiptScraper');
    const scraped = scrapeReceiptData(verifyData.text);
    console.log('Scraped Receipt Data:', scraped);
  }

  // If there's a reference, request Telebirr reference API
  let telebirrData = null;
  if (verifyData && verifyData.reference) {
    try {
      const telebirrRes = await fetch('https://verifyapi.leulzenebe.pro/verify-telebirr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({ reference: verifyData.reference })
      });
      if (!telebirrRes.ok) throw new Error('Telebirr reference verification failed');
      telebirrData = await telebirrRes.json();
      console.log('Telebirr Reference API response:', telebirrData);
    } catch (e) {
      console.error('Telebirr reference API error:', e);
    }
  }

  return { verifyData, telebirrData };
}

export async function verifyReceiptWithAPI(file: File, autoVerify: boolean = true, suffix: string = "12345678") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("autoVerify", autoVerify ? "true" : "false");
  formData.append("suffix", suffix);

  const res = await fetch("https://verifyapi.leulzenebe.pro/verify-image", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY
    },
    body: formData
  });
  if (!res.ok) {
    throw new Error("Verification failed");
  }
  return await res.json();
}

/**
 * Uploads a PDF file to the backend for scraping and returns the raw text
 */
export async function scrapePdfOnBackend(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/scrape-pdf', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to scrape PDF');
  const data = await res.json();
  return data.text;
}

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

// API Configuration
const API_BASE_URL = 'https://verifyapi.leulzenebe.pro';
const API_KEY = 'Y21kZWh0bW84MDA1NG5xMGs3N2dhemowbi0xNzUzMTg3NDExNDQ5LWk4cjJqb255Mms'; // Replace with actual API key


const firebaseConfig = {
  apiKey: "AIzaSyBav7I8SqGTMSsB_Ly5kcISE_2lO--SNyU",
  authDomain: "oplms-6defb.firebaseapp.com",
  projectId: "oplms-6defb",
  storageBucket: "oplms-6defb.firebasestorage.app",
  messagingSenderId: "643836071157",
  appId: "1:643836071157:web:b6877c038b65ca14a2c9bc",
  measurementId: "G-RRFP74F9V5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface RegistrationFormData {
  // Personal Information
  fullName: string;
  age: number;
  gender: string;
  parentName: string;
  phone: string;
  emergencyContact: string;
  grade: string;
  hobbies?: string;
  allergies?: string;

  
  // Payment Information
  receiptUrl?: string;
  receiptFileName?: string;
  paymentStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  paymentAmount?: string;
  paymentDate?: string;
  transactionId?: string;
  verificationData?: any;
  
  // System Fields
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReceiptData {
  url: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  extractedText?: string;
  previewText?: string;
}

const IMGBB_API_KEY = 'b0a1a6e53ee71951d772568e68407226';

// Types for CBE Verification
export interface CBEVerificationRequest {
  // These fields should be extracted from the PDF
  transactionId?: string;
  amount?: string;
  date?: string;
  senderAccount?: string;
  receiverAccount?: string;
  senderName?: string;
  // Add other fields that can be extracted from CBE receipt PDF
}

export interface CBEVerificationResponse {
  success: boolean;
  reference?: string;
  amount?: string;
  date?: string;
  payer?: string;
  payerAccount?: string;
  receiver?: string;
  receiverAccount?: string;
  reason?: string;
  error?: string;
}

/**
 * Upload file to ImgBB with filename validation
 */
export const uploadReceipt = async (file: File): Promise<ReceiptData> => {

  // Upload to ImgBB
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload file to ImgBB');
  }

  const data = await response.json();
  
  return {
    url: data.data.url,
    fileName: file.name,
    fileSize: file.size,
    uploadedAt: new Date().toISOString()
  };
};

export const submitRegistration = async (data: RegistrationFormData) => {
  try {
    const docRef = await addDoc(collection(db, 'registration-public'), {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding document: ', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const updateRegistrationWithReceipt = async (registrationId: string, receiptData: ReceiptData) => {
  try {
    const registrationRef = doc(db, 'registration-public', registrationId);
    await updateDoc(registrationRef, {
      receiptUrl: receiptData.url,
      receiptFileName: receiptData.fileName,
      receiptUploadedAt: new Date().toISOString(),
      status: 'payment_pending_verification',
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating registration with receipt:', error);
    throw error;
  }
};

/**
 * Verify CBE payment by extracting data from uploaded PDF
 * @param file The PDF file to extract data from
 * @returns Verification result from the API
 */
export const verifyCBEPayment = async (file: File): Promise<CBEVerificationResponse> => {
  try {
    // Step 1: Extract text from PDF
    const text = await extractTextFromPdf(file);
    
    // Step 2: Parse the extracted text to get transaction details
    const transactionData = parseCBETransaction(text);
    
    // Step 3: Call the verification API
    const response = await fetch(`${API_BASE_URL}/verify-cbe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying CBE payment:', error);
    throw error;
  }
};

/**
 * Extract text from PDF file using pdf-parse
 */
async function extractTextFromPdf(file: File): Promise<string> {
  // Dynamically import pdf-parse to handle client-side only
  const pdfjsLib = await import('pdf-parse/lib/pdf-parse');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }
        
        // Convert ArrayBuffer to Uint8Array
        const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
        
        // Extract text from PDF
        const data = await pdfjsLib.default(typedArray);
        resolve(data.text);
      } catch (error) {
        console.error('Error extracting text from PDF:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };
    
    // Read the file as ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse CBE transaction details from extracted text
 */
function parseCBETransaction(text: string): CBEVerificationRequest {
  // Normalize text: replace multiple spaces with single space and handle various line endings
  const normalizedText = text.replace(/\s+/g, ' ').replace(/[\r\n]+/g, '\n');
  
  // Common patterns in CBE receipts (case insensitive)
  const patterns = {
    // Transaction ID patterns (various formats)
    transactionId: [
      /Transaction\s*[#:]?\s*([A-Z0-9]{8,})/i,
      /Ref\.?\s*[#:]?\s*([A-Z0-9]{8,})/i,
      /Receipt\s*No\.?\s*[#:]?\s*([A-Z0-9]{8,})/i,
    ],
    
    // Amount patterns (handles various formats like 1,000.00, 1000.00, 1.000,00)
    amount: [
      /(?:Amount|Amt|Total)\s*[#:]?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i,
      /(?:Amount|Amt|Total)\s*[#:]?\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)/i,
    ],
    
    // Date patterns (various date formats)
    date: [
      /Date\s*[#:]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
      /([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
    ],
    
    // Sender's account patterns
    senderAccount: [
      /From\s*Account\s*[#:]?\s*([0-9X\*]{10,})/i,
      /Account\s*No\.?\s*[#:]?\s*([0-9X\*]{10,})/i,
      /From\s*:?\s*[0-9X\*\s]*([0-9X\*]{4,})/i,
    ],
    
    // Receiver's account patterns (CBE account number)
    receiverAccount: [
      /To\s*Account\s*[#:]?\s*([0-9X\*]{10,})/i,
      /Beneficiary\s*Account\s*[#:]?\s*([0-9X\*]{10,})/i,
      /To\s*:?\s*[0-9X\*\s]*([0-9X\*]{4,})/i,
    ],
    
    // Sender's name patterns
    senderName: [
      /From\s*:?\s*([A-Za-z\s\.]+)(?=\s*Account|\s*[0-9]|$)/i,
      /Customer\s*Name\s*[#:]?\s*([A-Za-z\s\.]+)(?=\s*[0-9]|$)/i,
      /Payer\s*:?\s*([A-Za-z\s\.]+)(?=\s*[0-9]|$)/i,
    ],
  };

  // Helper function to find first matching pattern
  const findMatch = (patterns: RegExp[], text: string): string | undefined => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return undefined;
  };

  // Extract fields using patterns
  const transactionId = findMatch(patterns.transactionId, normalizedText);
  const amount = findMatch(patterns.amount, normalizedText);
  const date = findMatch(patterns.date, normalizedText);
  const senderAccount = findMatch(patterns.senderAccount, normalizedText);
  const receiverAccount = findMatch(patterns.receiverAccount, normalizedText) || '1000708766643'; // Default to our account
  const senderName = findMatch(patterns.senderName, normalizedText);

  // Log extracted data for debugging
  console.log('Extracted transaction data:', {
    transactionId,
    amount,
    date,
    senderAccount,
    receiverAccount,
    senderName,
  });

  return {
    transactionId,
    amount,
    date,
    senderAccount,
    receiverAccount,
    senderName,
  };
}