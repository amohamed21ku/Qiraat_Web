import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { 
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAh5K2z-9RDM_cHCI5EpYYRNcItVPmAp2c",
    authDomain: "qiraat-bf2e6.firebaseapp.com",
    projectId: "qiraat-bf2e6",
    storageBucket: "qiraat-bf2e6.firebasestorage.app",
    messagingSenderId: "820441840325",
    appId: "1:820441840325:web:0521b88607468d88ec4eac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let currentLang = 'ar';
const translations = {
    en: {
        full_name: "Full Name",
        email: "Email",
        education: "Education Degree",
        about: "Tell us about you",
        document: "Attach Document",
        send: "Send",
        success: "Application submitted successfully!",
        required: "This field is required",
        degrees: ["Bachelor", "Master", "PhD"]
    },
    ar: {
        full_name: "الاسم الكامل",
        email: "البريد الإلكتروني",
        education: "الدرجة العلمية",
        about: "حدثنا عن نفسك",
        document: "إرفاق مستند",
        send: "إرسال",
        success: "تم تقديم الطلب بنجاح!",
        required: "هذا الحقل مطلوب",
        degrees: ["بكالوريوس", "ماجستير", "دكتوراه"]
    }
};

// Initialize the page with Arabic language
function initializePage() {
    document.documentElement.lang = currentLang;
    document.body.style.direction = 'rtl'; // Set RTL direction for Arabic
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });

    const educationSelect = document.getElementById('education');
    educationSelect.innerHTML = translations[currentLang].degrees
        .map(degree => `<option value="${degree}">${degree}</option>`)
        .join('');
}

// Call initialize function when the page loads
document.addEventListener('DOMContentLoaded', initializePage);

// Language toggle handler
document.getElementById('langToggle').addEventListener('click', toggleLanguage);

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.documentElement.lang = currentLang;
    document.body.style.direction = currentLang === 'ar' ? 'rtl' : 'ltr';
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });

    const educationSelect = document.getElementById('education');
    educationSelect.innerHTML = translations[currentLang].degrees
        .map(degree => `<option value="${degree}">${degree}</option>`)
        .join('');
}

// Form submission handler
document.getElementById('applicationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const confirmationMsg = document.getElementById('confirmationMessage');
    confirmationMsg.style.display = 'none';

    // Validate inputs
    const requiredFields = ['fullName', 'email', 'about'];
    let isValid = true;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = 'red';
        } else {
            field.style.borderColor = '#ddd';
        }
    });

    if (!isValid) return alert(translations[currentLang].required);

    try {
        const fileInput = document.getElementById('document');
        const file = fileInput.files[0];
        let documentUrl = null;

        // Upload file if exists
        if (file) {
            console.log("File to upload:", file);
            const storageRef = ref(storage, `Articles/${document.getElementById('fullName').value.trim()}`);
            const snapshot = await uploadBytes(storageRef, file);
            documentUrl = await getDownloadURL(snapshot.ref);
            console.log("Document URL:", documentUrl);
        }
        
        // Create form data with optional document URL
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            education: document.getElementById('education').value,
            about: document.getElementById('about').value.trim(),
            status: "ملف مرسل",
            timestamp: serverTimestamp(),
            documentUrl: documentUrl // Will be null if no file uploaded
        };

        // Add to Firestore
        const docRef = await addDoc(collection(db, 'sent_documents'), formData);
        
        // Success handling
        confirmationMsg.textContent = translations[currentLang].success;
        confirmationMsg.style.color = 'green';
        confirmationMsg.style.display = 'block';
        
        document.getElementById('applicationForm').reset();

        setTimeout(() => {
            confirmationMsg.style.display = 'none';
        }, 3000);

    } catch (error) {
        console.error('Error:', error);
        confirmationMsg.textContent = `Error: ${error.message}`;
        confirmationMsg.style.color = 'red';
        confirmationMsg.style.display = 'block';
    }
});