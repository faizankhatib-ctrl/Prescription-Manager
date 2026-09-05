import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  collection, doc, setDoc, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, query, orderBy, Timestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// DOM Elements
const authContainer = document.getElementById("auth-container");
const dashboard = document.getElementById("dashboard");
const loader = document.getElementById("loader");

// Auth
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginError = document.getElementById("login-error");
const signupError = document.getElementById("signup-error");
const logoutBtn = document.getElementById("logout-btn");
const welcomeMessage = document.getElementById("welcome-message");

// Prescriptions
const prescriptionsList = document.getElementById("prescriptions-list");
const noPrescriptionsMessage = document.getElementById("no-prescriptions-message");
const addPrescriptionBtn = document.getElementById("add-prescription-btn");

// Modal & Form
const prescriptionModalEl = document.getElementById("prescription-modal");
const prescriptionModal = new bootstrap.Modal(prescriptionModalEl);
const modalTitle = document.getElementById("modal-title");
const prescriptionForm = document.getElementById("prescription-form");
const prescriptionError = document.getElementById("prescription-error");


// --- Tab Switching ---
const setActiveTab = (tab) => {
  loginTab.classList.toggle('active', tab === 'login');
  signupTab.classList.toggle('active', tab === 'signup');
  loginForm.classList.toggle('hidden', tab !== 'login');
  signupForm.classList.toggle('hidden', tab !== 'signup');
};
loginTab.addEventListener("click", () => setActiveTab('login'));
signupTab.addEventListener("click", () => setActiveTab('signup'));

// --- Authentication ---
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupError.textContent = "";
  const name = signupForm['signup-name'].value;
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    await setDoc(doc(db, "users", userCredential.user.uid), { name, email, createdAt: Timestamp.now() });
    signupForm.reset();
  } catch (error) {
    signupError.textContent = error.message;
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginForm.reset();
  } catch (error) {
    loginError.textContent = error.message;
  }
});

logoutBtn.addEventListener("click", () => signOut(auth));

// --- Auth State Listener ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    authContainer.classList.add("hidden");
    dashboard.classList.remove("hidden");
    welcomeMessage.textContent = `Welcome back, ${user.displayName || 'User'}!`;
    renderPrescriptions(user.uid);
  } else {
    authContainer.classList.remove("hidden");
    dashboard.classList.add("hidden");
    welcomeMessage.textContent = "";
    setActiveTab('login');
  }
});

// --- Firestore CRUD ---

// READ Prescriptions
const renderPrescriptions = async (uid) => {
  loader.classList.remove('hidden');
  prescriptionsList.innerHTML = "";
  noPrescriptionsMessage.classList.add('hidden');

  const q = query(collection(db, "users", uid, "prescriptions"), orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);

  loader.classList.add('hidden');
  if (querySnapshot.empty) {
    noPrescriptionsMessage.classList.remove('hidden');
  } else {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const card = createPrescriptionCard(doc.id, data);
      prescriptionsList.innerHTML += card;
    });
  }
};

const createPrescriptionCard = (id, data) => {
  const date = data.date.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `
    <div class="prescription-card" data-id="${id}">
      <div class="flex-grow">
        <div class="flex justify-between items-start">
            <h3 class="text-xl font-bold text-indigo-600 mb-2">${data.medicineName}</h3>
            <span class="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">${date}</span>
        </div>
        <p class="text-gray-700 mb-1"><strong class="font-semibold">Dosage:</strong> ${data.dosage}</p>
        <p class="text-gray-700 mb-1"><strong class="font-semibold">Frequency:</strong> ${data.frequency}</p>
        <p class="text-gray-700 mb-4"><strong class="font-semibold">Doctor:</strong> ${data.doctorName}</p>
        ${data.notes ? `<p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"><strong>Notes:</strong> ${data.notes}</p>` : ''}
      </div>
      <div class="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
        <button class="edit-btn p-2 text-gray-500 hover:text-indigo-600 transition-colors" data-id="${id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/></svg>
        </button>
        <button class="delete-btn p-2 text-gray-500 hover:text-red-600 transition-colors" data-id="${id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
        </button>
      </div>
    </div>`;
};

// --- Modal and Form Logic ---
const setupEditModal = async (id) => {
  const user = auth.currentUser;
  if (!user) return;
  const docRef = doc(db, "users", user.uid, "prescriptions", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    prescriptionForm['prescription-id'].value = id;
    prescriptionForm['medicine-name'].value = data.medicineName;
    prescriptionForm['dosage'].value = data.dosage;
    prescriptionForm['frequency'].value = data.frequency;
    prescriptionForm['doctor-name'].value = data.doctorName;
    prescriptionForm['prescription-date'].value = data.date.toDate().toISOString().split('T')[0];
    prescriptionForm['notes'].value = data.notes || "";
    
    modalTitle.textContent = "Edit Prescription";
    prescriptionModal.show();
  }
};

// Event Delegation for Edit/Delete buttons
prescriptionsList.addEventListener('click', (e) => {
  const editBtn = e.target.closest('.edit-btn');
  const deleteBtn = e.target.closest('.delete-btn');

  if (editBtn) {
    const id = editBtn.dataset.id;
    setupEditModal(id);
  } else if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    if (confirm("Are you sure you want to delete this prescription?")) {
      deletePrescription(id);
    }
  }
});

// ADD/UPDATE Prescription
prescriptionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  
  const id = prescriptionForm['prescription-id'].value;
  const data = {
    medicineName: prescriptionForm['medicine-name'].value,
    dosage: prescriptionForm['dosage'].value,
    frequency: prescriptionForm['frequency'].value,
    doctorName: prescriptionForm['doctor-name'].value,
    date: Timestamp.fromDate(new Date(prescriptionForm['prescription-date'].value)),
    notes: prescriptionForm['notes'].value,
  };

  try {
    if (id) { // Update existing document
      const docRef = doc(db, "users", user.uid, "prescriptions", id);
      await updateDoc(docRef, data);
    } else { // Add new document
      await addDoc(collection(db, "users", user.uid, "prescriptions"), data);
    }
    prescriptionForm.reset();
    prescriptionModal.hide();
    renderPrescriptions(user.uid);
  } catch (error) {
    prescriptionError.textContent = `Error: ${error.message}`;
  }
});

// DELETE Prescription
const deletePrescription = async (id) => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const docRef = doc(db, "users", user.uid, "prescriptions", id);
    await deleteDoc(docRef);
    renderPrescriptions(user.uid);
  } catch (error) {
    console.error("Error deleting prescription: ", error);
    alert("Could not delete the prescription.");
  }
};

// Open modal for adding a new prescription
addPrescriptionBtn.addEventListener('click', () => {
    prescriptionForm.reset();
    prescriptionForm['prescription-id'].value = ''; // Ensure ID is cleared
    modalTitle.textContent = "Add New Prescription";
    prescriptionError.textContent = "";
    prescriptionModal.show();
});

// Clear error when modal is closed
prescriptionModalEl.addEventListener('hidden.bs.modal', () => {
    prescriptionError.textContent = "";
});