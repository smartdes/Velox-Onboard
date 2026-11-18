import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInAnonymously,
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

// Connect to local Emulators
connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "127.0.0.1", 8080);

// Modern Glassmorphism UI with Centered Brand Logo
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
    <div class="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
      
      <!-- Centered Brand Logo & Tagline -->
      <div class="flex flex-col items-center text-center mb-6">
        <div class="bg-white p-3 rounded-2xl shadow-lg shadow-indigo-500/20 mb-3">
          <img 
            src="/velox-onboarding_logo.svg" 
            alt="Velox-Onboard Logo" 
            class="h-16 w-auto object-contain mx-auto"
          />
        </div>
        <p class="text-xs text-slate-400">Streamlined Customer Onboarding</p>
      </div>

      <!-- Account Status Badge -->
      <div id="auth-status" class="mb-4 text-xs bg-slate-800/60 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-700/50 flex items-center justify-between">
        <span>Account Status: <strong id="session-text" class="text-amber-400">Connecting...</strong></span>
        <span class="font-mono text-[10px] text-slate-500">Secure SSL</span>
      </div>

      <!-- Onboarding Form -->
      <form id="onboardForm" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
          <input type="text" id="name" value="Alexander Macharia Wanjira" class="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" required />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
          <input type="email" id="email" value="alexander@velox.io" class="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" required />
        </div>
        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm shadow-lg shadow-indigo-600/30 transition cursor-pointer">
          Complete Registration
        </button>
      </form>

      <div id="status" class="mt-4 text-xs font-medium text-center min-h-[20px]"></div>

      <!-- Voucher Redemption Section -->
      <div class="mt-8 pt-6 border-t border-slate-800/80">
        <h2 class="text-sm font-semibold text-slate-200 mb-2">Have a Welcome Gift?</h2>
        <div class="flex gap-2">
          <input type="text" id="voucherInput" placeholder="WELCOME-XXXXXX" class="flex-1 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-sm uppercase font-mono text-white focus:outline-none focus:border-indigo-500" />
          <button id="redeemBtn" class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
            Apply
          </button>
        </div>
        <div id="redeemStatus" class="mt-2 text-xs text-center min-h-[16px]"></div>
      </div>

    </div>
  </div>
`;

// Initialize secure session
signInAnonymously(auth).catch((err) => console.error("Auth error:", err));

onAuthStateChanged(auth, (user) => {
  const sessionText = document.getElementById("session-text")!;
  if (user) {
    sessionText.textContent = "Active & Verified";
    sessionText.className = "text-emerald-400 font-semibold";
  } else {
    sessionText.textContent = "Signed Out";
    sessionText.className = "text-rose-400 font-semibold";
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
  statusP.className = "mt-4 text-xs font-medium text-center text-amber-400";

  try {
    await addDoc(collection(db, "users"), {
      name,
      email,
      onboarded: false,
      createdAt: new Date()
    });
    statusP.textContent = "✨ Welcome aboard! Your account is ready and your welcome gift has been sent.";
    statusP.className = "mt-4 text-xs font-medium text-center text-emerald-400";
  } catch (err: any) {
    console.error(err);
    statusP.textContent = "Error: " + err.message;
    statusP.className = "mt-4 text-xs font-medium text-center text-rose-400";
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
    redeemStatus.className = "mt-2 text-xs text-center text-rose-400";
    return;
  }

  redeemStatus.textContent = "Applying your discount...";
  redeemStatus.className = "mt-2 text-xs text-center text-amber-400";

  try {
    const response = await fetch("http://127.0.0.1:5001/demo-onboarding/us-central1/redeem_voucher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Redemption failed");

    redeemStatus.textContent = `🎉 Success! ${result.discountPercent}% discount applied to your account.`;
    redeemStatus.className = "mt-2 text-xs text-center text-emerald-400 font-semibold";
  } catch (err: any) {
    redeemStatus.textContent = `❌ ${err.message}`;
    redeemStatus.className = "mt-2 text-xs text-center text-rose-400";
  }
});