import { auth, createUserWithEmailAndPassword, db, doc, setDoc } from "./config/configs.js";

window.signuppage = async function(event) {
    event.preventDefault();

    const signupName = document.getElementById("signup-name").value;
    const emailInput = document.getElementById('signup-email').value;
    const passwordInput = document.getElementById('signup-password').value;

    const btn = document.getElementById("signup-btn");
    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        // STEP 1: Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
        const user = userCredential.user;
        console.log("Auth Success:", user.uid);

        // STEP 2: Save extra user info in Firestore Database
        await setDoc(doc(db, "users", user.uid), {
            name: signupName,
            email: emailInput,
            createdAt: new Date().toISOString() // Standard format for dates
        });

        console.log("Firestore Save Success!");

        // STEP 3: Redirect only after everything is successful
        window.location.href = "./Dashboard/dashboard.html";

    } catch (error) {
        console.error("Error signing up:", error.message);
        alert("Signup Failed: " + error.message);
        
        // Reset button if there's an error
        btn.innerText = "Sign up now";
        btn.disabled = false;
    }
};