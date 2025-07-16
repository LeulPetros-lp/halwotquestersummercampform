// src/lib/api.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

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
  fullName: string;
  age: number;
  gender: string;
  parentName: string;
  phone: string;
  emergencyContact: string;
  grade: string;
  hobbies?: string;
  allergies?: string;
  isChurchMember: boolean;
  receiptUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReceiptData {
  url: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

const IMGBB_API_KEY = 'b0a1a6e53ee71951d772568e68407226';

export const uploadReceipt = async (file: File): Promise<ReceiptData> => {
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
    throw new Error('Failed to upload image');
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
    const docRef = await addDoc(collection(db, 'registrations'), {
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
    await updateDoc(doc(db, 'registrations', registrationId), {
      receiptUrl: receiptData.url,
      status: 'payment_received',
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating document: ', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};