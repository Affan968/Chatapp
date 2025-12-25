<<<<<<< HEAD
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
    const userCredential = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
    const user = userCredential.user;
    console.log("Auth Success:", user.uid);

    // Database mein save karein
    await setDoc(doc(db, "users", user.uid), {
        name: signupName,
        email: emailInput,
        createdAt: new Date()
    });

    console.log("Firestore Save Success!");
    window.location.href = "./Dashboard/dashboard.html";

} catch (error) {
    console.error("Full Error Object:", error); // Is se pura error pata chalega
    alert("Error: " + error.message); // Screen par error dikhayega
    btn.innerText = "Sign up now";
    btn.disabled = false;
}
=======
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
        // STEP 1: Create user in Auth
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
        const user = userCredential.user;
        console.log("Auth Success:", user.uid);

        // --- LINE REMOVED FROM HERE ---

        // STEP 2: Save user info in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: signupName,
            email: emailInput,
            createdAt: new Date().toISOString() // behtar hai string format use karein
        });

        console.log("Firestore Save Success!");

        // STEP 3: Redirect ONLY after Firestore is done
        window.location.href = "./Dashboard/dashboard.html";

    } catch (error) {
        console.error("Error signing up:", error.message); // Error console mein check karein
        alert(error.message); // User ko error dikhane ke liye
        btn.innerText = "Sign up now";
        btn.disabled = false;
    }
>>>>>>> b853f791e6e776f6bee3fffade066b4ab3b30668
};