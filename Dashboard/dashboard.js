import { 
    auth, db, collection, addDoc, getDocs, getDoc, doc, 
    onAuthStateChanged, onSnapshot, query, where, 
    deleteDoc, updateDoc, serverTimestamp, signOut 
} from "../config/configs.js";

// 1. Auth & Sidebar Profile Update
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                document.getElementById("display-name").innerText = userData.name || "User";
                document.getElementById("display-email").innerText = "@" + (userData.name ? userData.name.toLowerCase().replace(/\s/g, '') : "username");
            }
        } catch (error) {
            console.error("Profile Error:", error);
        }
        
        // Functions ko call karein
        loadSuggestedFriends(user.uid);
        listenToIncomingRequests(user.uid);
    } else {
        window.location.href = "../login/login.html";
    }
});

// 2. Suggested Friends Logic (FIXED SYNTAX)
async function loadSuggestedFriends(currentUid) {
    const usersListDiv = document.getElementById("users-list");
    
    try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        
        usersListDiv.innerHTML = "";
        
        // Agar database mein koi users nahi hain
        if (querySnapshot.size <= 1) {
            usersListDiv.innerHTML = "<p style='font-size:12px; color:gray;'>No suggestions found.</p>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const userData = docSnap.data();
            
            // Apni profile ko list se nikal dein
            if (docSnap.id !== currentUid) {
                const userItem = document.createElement("div");
                userItem.className = "user-item";
                userItem.innerHTML = `
                    <div class="user-info">
                        <span class="user-name" style="font-weight:bold;">${userData.name}</span>
                    </div>
                    <button class="add-btn" id="btn-${docSnap.id}" style="background:#e65100; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
                        Add Friend
                    </button>
                `;
                usersListDiv.appendChild(userItem);

                // Add Friend Button Event
                userItem.querySelector(".add-btn").addEventListener("click", () => sendRequest(docSnap.id));
            }
        });
    } catch (error) {
        console.error("Load Users Error:", error);
        usersListDiv.innerHTML = "<p>Error loading users.</p>";
    }
} // <--- Syntax fix: Bracket band kiya

// 3. Send Friend Request
async function sendRequest(receiverId) {
    const btn = document.getElementById(`btn-${receiverId}`);
    try {
        btn.innerText = "Sending...";
        btn.disabled = true;

        await addDoc(collection(db, "friendRequests"), {
            from: auth.currentUser.uid,
            to: receiverId,
            status: "pending",
            timestamp: serverTimestamp()
        });
        btn.innerText = "Requested";
    } catch (error) {
        console.error("Request Error:", error);
        btn.disabled = false;
        btn.innerText = "Add Friend";
    }
}

// 4. Incoming Requests (Real-time)
function listenToIncomingRequests(currentUid) {
    const requestDiv = document.getElementById("friend-requests-list");
    const countBadge = document.getElementById("request-count");

    const q = query(collection(db, "friendRequests"), where("to", "==", currentUid), where("status", "==", "pending"));

    onSnapshot(q, (snapshot) => {
        requestDiv.innerHTML = snapshot.empty ? "<p style='font-size:12px; color:gray;'>No pending requests</p>" : "";
        countBadge.innerText = snapshot.size;
        countBadge.style.display = snapshot.size > 0 ? "block" : "none";

        snapshot.forEach(async (requestDoc) => {
            const reqData = requestDoc.data();
            const senderSnap = await getDoc(doc(db, "users", reqData.from));
            const senderName = senderSnap.exists() ? senderSnap.data().name : "User";

            const reqItem = document.createElement("div");
            reqItem.className = "user-item";
            reqItem.style.marginBottom = "10px";
            reqItem.innerHTML = `
                <span class="user-name">${senderName}</span>
                <div>
                    <button onclick="handleRequest('${requestDoc.id}', 'accepted')" style="background:green; color:white; border:none; padding:2px 8px; border-radius:4px; cursor:pointer;">✔</button>
                    <button onclick="handleRequest('${requestDoc.id}', 'rejected')" style="background:red; color:white; border:none; padding:2px 8px; border-radius:4px; cursor:pointer;">✖</button>
                </div>
            `;
            requestDiv.appendChild(reqItem);
        });
    });
}

// 5. Global Accept/Reject Handler
window.handleRequest = async (requestId, newStatus) => {
    try {
        if (newStatus === 'accepted') {
            await updateDoc(doc(db, "friendRequests", requestId), { status: "accepted" });
            alert("Request Accepted!");
        } else {
            await deleteDoc(doc(db, "friendRequests", requestId));
        }
    } catch (error) {
        console.error("Handle Request Error:", error);
    }
};

// 6. Logout
document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "../login/login.html");
});