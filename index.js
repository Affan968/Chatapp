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
};