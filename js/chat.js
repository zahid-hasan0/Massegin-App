// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDjjoalNZac2gyWXTGdjyjFMG7b6pDqpzI",
    authDomain: "emb-auto-massege.firebaseapp.com",
    databaseURL: "https://emb-auto-massege-default-rtdb.firebaseio.com",
    projectId: "emb-auto-massege",
    storageBucket: "emb-auto-massege.firebasestorage.app",
    messagingSenderId: "708428884410",
    appId: "1:708428884410:web:d280b85b5638e61f0e5583"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

let currentUser = null;
let selectedUserId = null;
let currentTab = 'friends';
let currentLang = 'bn';
let allUsersData = {};
let currentUserData = {};

// Initialize
const savedTheme = localStorage.getItem('theme') || 'light';
const savedLang = localStorage.getItem('lang') || 'bn';
if (savedTheme === 'dark') document.body.classList.add('dark-mode');
currentLang = savedLang;
updateLanguage();

// Load custom theme on page load
const customTheme = JSON.parse(localStorage.getItem('customTheme') || '{}');
if (Object.keys(customTheme).length > 0) {
    applyThemeColors(customTheme);
}

// Auth State Monitor
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        loadUserData();
        showPage('chatPage');
    } else {
        showPage('loginPage');
    }
});

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function toggleLanguage() {
    currentLang = currentLang === 'bn' ? 'en' : 'bn';
    localStorage.setItem('lang', currentLang);
    updateLanguage();
}

function updateLanguage() {
    const elements = document.querySelectorAll('[data-bn]');
    elements.forEach(el => {
        el.textContent = currentLang === 'bn' ? el.getAttribute('data-bn') : el.getAttribute('data-en');
    });
    const langBtns = document.querySelectorAll('[id^="langBtn"]');
    langBtns.forEach(btn => btn.textContent = currentLang === 'bn' ? 'English' : 'বাংলা');
}

// --- AUTH ---
async function register() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    if (!name || !email || !password) return alert('Fill all fields!');
    try {
        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        await database.ref('users/' + userCred.user.uid).set({ name, email, createdAt: Date.now() });
        showPage('loginPage');
    } catch (e) { alert(e.message); }
}

async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    try { await auth.signInWithEmailAndPassword(email, password); }
    catch (e) { alert(e.message); }
}

function logout() { if (confirm('Logout?')) auth.signOut(); }

// --- USER DATA & REQUESTS ---
async function loadUserData() {
    if (!currentUser) return;
    database.ref('users/' + currentUser.uid).on('value', snap => {
        currentUserData = snap.val() || {};
        const userName = currentUserData.name || 'User';
        document.getElementById('userNameCompact').textContent = userName;

        const avatarContainer = document.getElementById('userAvatarSmall');
        const avatarInitial = document.getElementById('avatarInitial');

        if (currentUserData.photoURL) {
            avatarContainer.style.backgroundImage = `url(${currentUserData.photoURL})`;
            avatarContainer.style.backgroundSize = 'cover';
            avatarContainer.style.backgroundPosition = 'center';
            avatarInitial.textContent = '';
        } else {
            avatarContainer.style.backgroundImage = 'none';
            avatarInitial.textContent = userName.charAt(0).toUpperCase();
        }
    });

    database.ref('friendRequests').on('value', () => { loadUsers(); updateRequestBadge(); });
    database.ref('friends/' + currentUser.uid).on('value', () => loadUsers());
}

async function updateRequestBadge() {
    const snap = await database.ref('friendRequests').once('value');
    const all = snap.val() || {};
    let count = 0;
    for (let key in all) if (all[key][currentUser.uid]) count++;
    const badge = document.getElementById('requestBadge');
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

function showTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    loadUsers();
}

async function loadUsers() {
    const uSnap = await database.ref('users').once('value');
    const users = uSnap.val() || {};
    allUsersData = users;
    const fSnap = await database.ref('friends/' + currentUser.uid).once('value');
    const friends = fSnap.val() || {};
    const rSnap = await database.ref('friendRequests').once('value');
    const allReqs = rSnap.val() || {};

    const list = document.getElementById('usersList');
    list.innerHTML = '';

    for (let uid in users) {
        if (uid === currentUser.uid) continue;
        const user = users[uid];
        const isFriend = friends[uid] === true;
        const received = allReqs[uid] && allReqs[uid][currentUser.uid];
        const sent = allReqs[currentUser.uid] && allReqs[currentUser.uid][uid];

        if (currentTab === 'friends' && !isFriend) continue;
        if (currentTab === 'requests' && !received) continue;

        const div = document.createElement('div');
        div.className = 'user-item';
        if (isFriend) div.onclick = () => openChat(uid, user.name, user.photoURL);

        let actionBtn = '';
        if (!isFriend) {
            if (received) {
                actionBtn = `<div class="mt-2">
                <button class="btn btn-sm btn-success me-2" onclick="event.stopPropagation(); acceptRequest('${uid}')">Accept</button>
                <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); rejectRequest('${uid}')">Reject</button>
            </div>`;
            } else if (sent) {
                actionBtn = `<button class="btn btn-sm btn-secondary mt-2" disabled>Sent</button>`;
            } else if (currentTab === 'all') {
                actionBtn = `<button class="btn btn-sm btn-primary mt-2" onclick="event.stopPropagation(); sendRequest('${uid}')">Add Friend</button>`;
            }
        }

        div.innerHTML = `
        <div class="user-item-avatar">${user.photoURL ? `<img src="${user.photoURL}">` : user.name.charAt(0)}</div>
        <div class="user-item-info">
            <div class="user-item-name">${user.name}</div>
            <div class="last-msg-container">
                ${isFriend ? `<div class="user-item-last-msg" id="last-msg-${uid}">...</div>` : `<div class="user-item-email">${user.email}</div>`}
                <div class="unread-badge" id="badge-${uid}" style="display:none;">0</div>
            </div>
            ${actionBtn}
        </div>`;
        list.appendChild(div);
        if (isFriend) updateLastMessageAndBadge(uid);
    }
}

// --- MESSAGING & DELETE ---
function updateLastMessageAndBadge(targetUid) {
    const chatId = [currentUser.uid, targetUid].sort().join('_');
    database.ref('messages/' + chatId).on('value', snap => {
        const msgs = snap.val();
        const lastEl = document.getElementById(`last-msg-${targetUid}`);
        const badgeEl = document.getElementById(`badge-${targetUid}`);

        if (msgs && lastEl) {
            const msgArray = Object.entries(msgs);
            const last = msgArray[msgArray.length - 1][1];
            lastEl.textContent = (last.senderId === currentUser.uid ? "You: " : "") + last.text;

            // Count unread messages
            let unreadCount = 0;
            msgArray.forEach(([id, msg]) => {
                if (msg.receiverId === currentUser.uid && !msg.seen) {
                    unreadCount++;
                }
            });

            if (badgeEl) {
                if (unreadCount > 0 && selectedUserId !== targetUid) {
                    badgeEl.textContent = unreadCount;
                    badgeEl.style.display = 'flex';
                } else {
                    badgeEl.style.display = 'none';
                }
            }
        }
    });
}

function openChat(uid, name, photo) {
    selectedUserId = uid;
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('chatArea').classList.add('active');
    document.getElementById('chatName').textContent = name;
    const avatar = document.getElementById('chatAvatar');
    avatar.innerHTML = photo ? `<img src="${photo}">` : name.charAt(0);

    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('mobile-hide');
        document.getElementById('chatMain').classList.add('mobile-show');
    }

    // Mark messages as seen
    const chatId = [currentUser.uid, selectedUserId].sort().join('_');
    database.ref('messages/' + chatId).once('value', snap => {
        const msgs = snap.val() || {};
        Object.keys(msgs).forEach(msgId => {
            if (msgs[msgId].receiverId === currentUser.uid && !msgs[msgId].seen) {
                database.ref(`messages/${chatId}/${msgId}`).update({ seen: true });
            }
        });
    });

    loadMessages();
}

function backToUsers() {
    document.getElementById('sidebar').classList.remove('mobile-hide');
    document.getElementById('chatMain').classList.remove('mobile-show');
}

function loadMessages() {
    const chatId = [currentUser.uid, selectedUserId].sort().join('_');
    database.ref('messages/' + chatId).on('value', snap => {
        const box = document.getElementById('chatMessages');
        box.innerHTML = '';
        const msgs = snap.val() || {};
        for (let id in msgs) {
            const m = msgs[id];
            const isSent = m.senderId === currentUser.uid;
            const div = document.createElement('div');
            div.className = 'message ' + (isSent ? 'sent' : 'received');

            div.innerHTML = `
            <div class="message-content">
                <div class="message-bubble">
                    <span>${m.text}</span>
                </div>
                <div class="message-footer">
                    <div class="message-time">${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    ${isSent ? `<button class="btn-delete-msg" onclick="deleteMsg('${chatId}','${id}')" title="Delete message"><i class="fas fa-trash-alt"></i></button>` : ''}
                </div>
            </div>`;
            box.appendChild(div);
        }
        box.scrollTop = box.scrollHeight;
    });
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input.value.trim() || !selectedUserId) return;
    const chatId = [currentUser.uid, selectedUserId].sort().join('_');
    await database.ref('messages/' + chatId).push({
        senderId: currentUser.uid, receiverId: selectedUserId,
        text: input.value.trim(), timestamp: Date.now(), seen: false
    });
    input.value = '';
}

async function deleteMsg(chatId, msgId) {
    if (confirm("Delete this message?")) {
        await database.ref(`messages/${chatId}/${msgId}`).remove();
    }
}

// --- REQUEST LOGIC ---
async function sendRequest(toId) {
    await database.ref(`friendRequests/${currentUser.uid}/${toId}`).set({ from: currentUser.uid, to: toId, timestamp: Date.now() });
    alert("Sent!");
}

async function acceptRequest(fromId) {
    await database.ref(`friends/${currentUser.uid}/${fromId}`).set(true);
    await database.ref(`friends/${fromId}/${currentUser.uid}`).set(true);
    await database.ref(`friendRequests/${fromId}/${currentUser.uid}`).remove();
}

async function rejectRequest(fromId) {
    await database.ref(`friendRequests/${fromId}/${currentUser.uid}`).remove();
}

function filterUsers() {
    const term = document.getElementById('searchUser').value.toLowerCase();
    document.querySelectorAll('.user-item').forEach(el => {
        const name = el.querySelector('.user-item-name').textContent.toLowerCase();
        el.style.display = name.includes(term) ? 'flex' : 'none';
    });
}

function uploadProfileImage() {
    document.getElementById('profileImageInput').click();
}

async function handleProfileImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            canvas.getContext('2d').drawImage(img, 0, 0, 200, 200);
            database.ref('users/' + currentUser.uid).update({
                photoURL: canvas.toDataURL('image/jpeg', 0.7)
            });
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Settings Modal Functions
function openSettings() {
    document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function openCustomizeModal() {
    closeSettings();
    document.getElementById('customizeModal').style.display = 'flex';
    loadCurrentTheme();
}

function closeCustomizeModal() {
    document.getElementById('customizeModal').style.display = 'none';
}

function loadCurrentTheme() {
    const savedTheme = JSON.parse(localStorage.getItem('customTheme') || '{}');
    document.getElementById('bgColor').value = savedTheme.bgPrimary || '#fdfeff';
    document.getElementById('secondaryBgColor').value = savedTheme.bgSecondary || '#fffcfc';
    document.getElementById('textColor').value = savedTheme.textPrimary || '#212529';
    document.getElementById('accentColor').value = savedTheme.accentColor || '#667eea';
    document.getElementById('msgReceivedColor').value = savedTheme.msgReceived || '#d8dce0';
    document.getElementById('msgSentColor').value = savedTheme.msgSent || '#667eea';
}

function applyTheme() {
    const theme = {
        bgPrimary: document.getElementById('bgColor').value,
        bgSecondary: document.getElementById('secondaryBgColor').value,
        textPrimary: document.getElementById('textColor').value,
        accentColor: document.getElementById('accentColor').value,
        msgReceived: document.getElementById('msgReceivedColor').value,
        msgSent: document.getElementById('msgSentColor').value
    };

    localStorage.setItem('customTheme', JSON.stringify(theme));
    applyThemeColors(theme);
    closeCustomizeModal();
}

function applyThemeColors(theme) {
    document.documentElement.style.setProperty('--bg-primary', theme.bgPrimary);
    document.documentElement.style.setProperty('--bg-secondary', theme.bgSecondary);
    document.documentElement.style.setProperty('--text-primary', theme.textPrimary);
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
    document.documentElement.style.setProperty('--message-received', theme.msgReceived);
    document.documentElement.style.setProperty('--message-sent', theme.msgSent);
}

function resetTheme() {
    localStorage.removeItem('customTheme');
    document.documentElement.style.removeProperty('--bg-primary');
    document.documentElement.style.removeProperty('--bg-secondary');
    document.documentElement.style.removeProperty('--text-primary');
    document.documentElement.style.removeProperty('--accent-color');
    document.documentElement.style.removeProperty('--message-received');
    document.documentElement.style.removeProperty('--message-sent');
    loadCurrentTheme();
    closeCustomizeModal();
}

// Close modal when clicking outside
window.onclick = function (event) {
    const settingsModal = document.getElementById('settingsModal');
    const customizeModal = document.getElementById('customizeModal');
    if (event.target === settingsModal) {
        closeSettings();
    }
    if (event.target === customizeModal) {
        closeCustomizeModal();
    }
}