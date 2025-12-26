import { 
    auth, db, collection, addDoc, getDocs, getDoc, doc, 
    onAuthStateChanged, onSnapshot, query, where, orderBy, serverTimestamp 
} from "../config/configs.js";

let selectedFriendId = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadMyFriends(user.uid);
    } else {
        window.location.href = "../login/login.html";
    }
});

// 1. Load Accepted Friends
async function loadMyFriends(currentUid) {
    const friendsListDiv = document.getElementById("friends-list");
    
    // Status 'accepted' wali requests ko dekho
    const q = query(collection(db, "friendRequests"), where("status", "==", "accepted"));
    
    onSnapshot(q, async (snapshot) => {
        // Ek 'Map' banayein jo sirf unique friend IDs save karega
        const uniqueFriendsMap = new Map();

        // Pehle saari unique IDs jama karein
        for (const docReq of snapshot.docs) {
            const data = docReq.data();
            
            if (data.from === currentUid || data.to === currentUid) {
                const friendId = (data.from === currentUid) ? data.to : data.from;
                
                // Agar ye ID pehle map mein nahi hai, toh add karein
                if (!uniqueFriendsMap.has(friendId)) {
                    uniqueFriendsMap.set(friendId, true);
                }
            }
        }

        // Ab UI saaf karein aur sirf unique friends load karein
        friendsListDiv.innerHTML = "";
        
        if (uniqueFriendsMap.size === 0) {
            friendsListDiv.innerHTML = "<p style='padding:15px;'>No friends yet.</p>";
            return;
        }

        // Map se IDs nikaal kar unka data fetch karein
        uniqueFriendsMap.forEach(async (value, friendId) => {
            const friendSnap = await getDoc(doc(db, "users", friendId));
            if (friendSnap.exists()) {
                const friendData = friendSnap.data();
                
                const div = document.createElement("div");
                div.className = "friend-item";
                div.style.cursor = "pointer";
                div.innerHTML = `
                    <div class="user-info-wrapper" style="display:flex; align-items:center; gap:10px; padding:10px;">
                        <div class="avatar-circle" style="width:35px; height:35px; border-radius:50%; background:#e65100; color:white; display:flex; align-items:center; justify-content:center;">
                            ${friendData.name.charAt(0)}
                        </div>
                        <div>
                            <strong style="display:block;">${friendData.name}</strong>
                            <small style="color:gray;">${friendData.email}</small>
                        </div>
                    </div>
                `;
                div.onclick = () => startChat(friendId, friendData.name);
                friendsListDiv.appendChild(div);
            }
        });
    });
}

// 2. Start Chatting with a Friend
function startChat(friendId, friendName) {
    selectedFriendId = friendId;
    document.getElementById("chat-header").innerText = "Chatting with: " + friendName;
    document.getElementById("input-box").style.display = "flex";
    loadMessages(friendId);
}

// 3. Messages Load Karna (Real-time)
function loadMessages(friendId) {
    const msgContainer = document.getElementById("messages-container");
    const currentUid = auth.currentUser.uid;

    // Aise messages fetch karein jo aapke aur friend ke darmiyan hain
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));

    onSnapshot(q, (snapshot) => {
        msgContainer.innerHTML = "";
        snapshot.forEach((msgDoc) => {
            const msgData = msgDoc.data();
            
            // Filter: Sirf wo messages jo in do users ke hain
            if (
                (msgData.sender === currentUid && msgData.receiver === friendId) ||
                (msgData.sender === friendId && msgData.receiver === currentUid)
            ) {
                const div = document.createElement("div");
                div.className = msgData.sender === currentUid ? "my-msg" : "friend-msg";
                div.innerText = msgData.text;
                msgContainer.appendChild(div);
            }
        });
        msgContainer.scrollTop = msgContainer.scrollHeight;
    });
}

// 4. Message Send Karna
document.getElementById("send-btn").addEventListener("click", async () => {
    const input = document.getElementById("msg-input");
    const text = input.value.trim();

    if (text !== "" && selectedFriendId) {
        await addDoc(collection(db, "messages"), {
            sender: auth.currentUser.uid,
            receiver: selectedFriendId,
            text: text,
            timestamp: serverTimestamp()
        });
        input.value = "";
    }
});