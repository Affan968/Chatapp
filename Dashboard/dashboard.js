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
                listenToMyFriends(user.uid);
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
                // loadSuggestedFriends ke andar forEach loop mein ye wala div use karein
                const userItem = document.createElement("div");
                userItem.className = "user-item";
                userItem.innerHTML = `
    <div class="user-info-wrapper">
        <div class="avatar-circle">${userData.name.charAt(0)}</div>
        <span class="user-name">${userData.name}</span>
    </div>
    <button class="add-btn" id="btn-${docSnap.id}">
        <i class="fas fa-user-plus"></i> Add
    </button>
`;;
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
function listenToMyFriends(currentUid) {
    const friendsDiv = document.getElementById("accepted-friends-list");

    // Query: Jahan status 'accepted' hai
    const q = query(collection(db, "friendRequests"), where("status", "==", "accepted"));

    onSnapshot(q, (snapshot) => {
        friendsDiv.innerHTML = snapshot.empty ? "<p style='font-size:12px; color:gray;'>No friends yet.</p>" : "";

        snapshot.forEach(async (docSnap) => {
            const data = docSnap.data();

            // Pata lagao dost ki ID (agar aapne bheji thi ya aapko aayi thi)
            let friendId = (data.from === currentUid) ? data.to : data.from;

            // Sirf wahi dikhao jisme aap shamil hain
            if (data.from === currentUid || data.to === currentUid) {
                const userSnap = await getDoc(doc(db, "users", friendId));
                if (userSnap.exists()) {
                    const friendData = userSnap.data();
                    // listenToMyFriends ke andar forEach loop mein ye wala div use karein
                    const item = document.createElement("div");
                    item.className = "user-item";
                    item.innerHTML = `
    <div class="user-info-wrapper">
        <div class="avatar-circle" style="background:#4caf50;">${friendData.name.charAt(0)}</div>
        <div>
            <span class="user-name">${friendData.name}</span>
            <div style="font-size:10px; color:green;">🟢 Online</div>
        </div>
    </div>
    <a href="../chat/chat.html" class="chat-link">
        <i class="fas fa-comment-dots"></i> Chat
    </a>
`;;
                    friendsDiv.appendChild(item);
                }
            }
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