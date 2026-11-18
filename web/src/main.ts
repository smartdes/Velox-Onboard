import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  connectFirestoreEmulator
} from "firebase/firestore";

// Firebase Emulator Configuration
const firebaseConfig = {
  apiKey: "fake-api-key",
  authDomain: "demo-onboarding.firebaseapp.com",
  projectId: "demo-onboarding",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Connect to local Emulators
connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "127.0.0.1", 8080);

// Clean Light Theme UI with White Background and Blue/Black Accents
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
    <div class="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200 p-8 rounded-2xl shadow-xl">
      
      <!-- Centered Brand Logo & Tagline -->
      <div class="flex flex-col items-center text-center mb-6">
        <div class="bg-slate-900 p-3 rounded-2xl shadow-md mb-3">
          <img 
          src="/velox-onboarding_logo.svg" 
          alt="Velox-Onboard Logo" 
          class="h-14 w-auto object-contain mx-auto mb-2"
        />
        </div>
        <p class="text-xs font-medium text-slate-500">Streamlined Customer Onboarding</p>
      </div>

      <!-- Account Status Badge -->
      <div id="auth-status" class="mb-4 text-xs bg-slate-100 text-slate-700 py-2 px-3 rounded-lg border border-slate-200 flex items-center justify-between">
        <span>Account Status: <strong id="session-text" class="text-amber-600 font-semibold">Connecting...</strong></span>
        <span class="font-mono text-[10px] text-slate-400">Secure SSL</span>
      </div>

      <!-- Google Sign-In Button -->
      <button id="googleLoginBtn" class="w-full mb-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-medium py-2.5 rounded-lg text-sm shadow-sm flex items-center justify-center gap-2 transition cursor-pointer">
        <svg class="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.14C3.15 21.32 7.21 24 12 24z"/>
          <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.62H1.18C.43 8.14 0 9.87 0 11.75s.43 3.61 1.18 5.13l4.09-2.64z"/>
          <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.21 0 3.15 2.68 1.18 6.62l4.09 3.14c.95-2.85 3.6-4.96 6.73-4.96z"/>
        </svg>
        Sign in with Google
      </button>

      <div class="relative flex py-2 items-center">
        <div class="flex-grow border-t border-slate-200"></div>
        <span class="flex-shrink mx-4 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">or guest session</span>
        <div class="flex-grow border-t border-slate-200"></div>
      </div>

      <!-- Onboarding Form -->
      <form id="onboardForm" class="space-y-4 mt-2">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
          <input type="text" id="name" value="Alexander Macharia Wanjira" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition" required />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
          <input type="email" id="email" value="alexander@velox.io" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition" required />
        </div>
        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 rounded-lg text-sm shadow-md shadow-blue-600/20 transition cursor-pointer">
          Complete Registration
        </button>
      </form>

      <div id="status" class="mt-4 text-xs font-medium text-center min-h-[20px]"></div>

      <!-- Voucher Redemption Section -->
      <div class="mt-8 pt-6 border-t border-slate-200">
        <h2 class="text-sm font-semibold text-slate-800 mb-2">Have a Welcome Gift?</h2>
        <div class="flex gap-2">
          <input type="text" id="voucherInput" placeholder="WELCOME-XXXXXX" class="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase font-mono text-slate-900 focus:outline-none focus:border-blue-600" />
          <button id="redeemBtn" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
            Apply
          </button>
        </div>
        <div id="redeemStatus" class="mt-2 text-xs text-center min-h-[16px]"></div>
      </div>

    </div>
  </div>
`;

// Default to anonymous session on load, fallback if user clicks Google sign-in
signInAnonymously(auth).catch((err) => console.error("Auth error:", err));

// Handle Google Sign-In Popup
document.getElementById("googleLoginBtn")!.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (user.displayName) (document.getElementById("name") as HTMLInputElement).value = user.displayName;
    if (user.email) (document.getElementById("email") as HTMLInputElement).value = user.email;

    const sessionText = document.getElementById("session-text")!;
    sessionText.textContent = `Google: ${user.email}`;
    sessionText.className = "text-blue-600 font-semibold";
  } catch (err: any) {
    console.error("Google Auth error:", err);
  }
});

onAuthStateChanged(auth, (user) => {
  const sessionText = document.getElementById("session-text")!;
  if (user) {
    if (user.isAnonymous) {
      sessionText.textContent = "Secure Session Active";
      sessionText.className = "text-blue-600 font-semibold";
    } else {
      sessionText.textContent = `Connected (${user.email || 'Google User'})`;
      sessionText.className = "text-blue-600 font-semibold";
    }
  } else {
    sessionText.textContent = "Signed Out";
    sessionText.className = "text-rose-600 font-semibold";
  }
});

// Handle Onboarding Form Submission
const form = document.getElementById("onboardForm") as HTMLFormElement;
const statusP = document.getElementById("status") as HTMLDivElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = (document.getElementById("name") as HTMLInputElement).value;
  const email = (document.getElementById("email") as HTMLInputElement).value;

  statusP.textContent = "Setting up your account...";
  statusP.className = "mt-4 text-xs font-medium text-center text-amber-600";

  try {
    await addDoc(collection(db, "users"), {
      name,
      email,
      onboarded: false,
      createdAt: new Date()
    });
    statusP.textContent = "✨ Welcome aboard! Your account is ready and your welcome gift has been sent.";
    statusP.className = "mt-4 text-xs font-medium text-center text-emerald-600";
  } catch (err: any) {
    console.error(err);
    statusP.textContent = "Error: " + err.message;
    statusP.className = "mt-4 text-xs font-medium text-center text-rose-600";
  }
});

// Handle Voucher Redemption
const redeemBtn = document.getElementById("redeemBtn") as HTMLButtonElement;
const voucherInput = document.getElementById("voucherInput") as HTMLInputElement;
const redeemStatus = document.getElementById("redeemStatus") as HTMLDivElement;

redeemBtn.addEventListener("click", async () => {
  const code = voucherInput.value.trim();
  if (!code) {
    redeemStatus.textContent = "Please enter your welcome code.";
    redeemStatus.className = "mt-2 text-xs text-center text-rose-600";
    return;
  }

  redeemStatus.textContent = "Applying your discount...";
  redeemStatus.className = "mt-2 text-xs text-center text-amber-600";

  try {
    const response = await fetch("http://127.0.0.1:5001/demo-onboarding/us-central1/redeem_voucher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Redemption failed");

    redeemStatus.textContent = `🎉 Success! ${result.discountPercent}% discount applied to your account.`;
    redeemStatus.className = "mt-2 text-xs text-center text-emerald-600 font-semibold";
  } catch (err: any) {
    redeemStatus.textContent = `❌ ${err.message}`;
    redeemStatus.className = "mt-2 text-xs text-center text-rose-600";
  }
});