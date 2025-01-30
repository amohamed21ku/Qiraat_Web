import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAh5K2z-9RDM_cHCI5EpYYRNcItVPmAp2c",
    authDomain: "qiraat-bf2e6.firebaseapp.com",
    projectId: "qiraat-bf2e6",
    storageBucket: "qiraat-bf2e6.appspot.com",
    messagingSenderId: "820441840325",
    appId: "1:820441840325:web:0521b88607468d88ec4eac"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentLang = 'en';
const translations = {
    en: {
        full_name: "Full Name",
        email: "Email",
        education: "Education Degree",
        about: "Tell us about you",
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
        send: "إرسال",
        success: "تم تقديم الطلب بنجاح!",
        required: "هذا الحقل مطلوب",
        degrees: ["بكالوريوس", "ماجستير", "دكتوراه"]
    }
};

// Language toggle handler
document.getElementById('langToggle').addEventListener('click', toggleLanguage);

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    document.documentElement.lang = currentLang;
    document.body.style.direction = currentLang === 'ar' ? 'rtl' : 'ltr';
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = translations[currentLang][key];
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

    if (!isValid) {
        alert(translations[currentLang].required);
        return;
    }

    try {
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            education: document.getElementById('education').value,
            about: document.getElementById('about').value.trim(),
            status: "Not Read",
            timestamp: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'sent_documents'), formData);
        
        confirmationMsg.textContent = translations[currentLang].success;
        confirmationMsg.style.color = 'green';
        confirmationMsg.style.display = 'block';
        
        document.getElementById('applicationForm').reset();

        setTimeout(() => {
            confirmationMsg.style.display = 'none';
        }, 3000);

        console.log("Document written with ID: ", docRef.id);

    } catch (error) {
        console.error('Error adding document: ', error);
        confirmationMsg.textContent = `Error: ${error.message}`;
        confirmationMsg.style.color = 'red';
        confirmationMsg.style.display = 'block';
    }
});