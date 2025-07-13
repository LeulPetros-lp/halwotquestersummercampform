import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

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
const db = getFirestore(app);

export interface RegistrationFormData {
  fullName: string;
  age: number;
  parentName: string;
  emergencyContact: string;
  grade: string;
  hobbies?: string;
  allergies?: string;
}

export const submitRegistration = async (data: RegistrationFormData) => {
  try {
    const docRef = await addDoc(collection(db, 'registrations'), {
      fullName: data.fullName,
      age: data.age,
      parentName: data.parentName,
      emergencyContact: data.emergencyContact,
      grade: data.grade,
      allergies: data.allergies || null,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding document: ', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit registration' 
    };
  }
};

export const checkIfRegistered = async (fullName: string, parentName: string): Promise<{ exists: boolean; error?: Error }> => {
  try {
    const q = query(
      collection(db, 'registrations'),
      where('fullName', '==', fullName),
      where('parentName', '==', parentName)
    );
    
    const querySnapshot = await getDocs(q);
    return { exists: !querySnapshot.empty };
  } catch (error) {
    console.error('Error checking registration:', error);
    return { 
      exists: false, 
      error: error instanceof Error ? error : new Error('Error checking registration')
    };
  }
};
