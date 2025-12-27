
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

// Check if firebase is already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
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
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    const icon = document.querySelector('.btn-theme-toggle i');
    if (icon) icon.className = 'fas fa-sun';
}
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

    // Reset buttons if they were loading
    document.querySelectorAll('.btn-primary').forEach(btn => {
        if (btn.disabled) {
            btn.disabled = false;
            // Restore text based on page context (simplified)
            if (btn.closest('#loginPage')) btn.innerHTML = 'Login';
            if (btn.closest('#registerPage')) btn.innerHTML = 'Register';
        }
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Update Icon
    const icon = document.querySelector('.btn-theme-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
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
    const btn = document.querySelector('#registerPage .btn-primary');
    const originalText = btn.innerHTML;

    if (!name || !email || !password) return showToast('Fill all fields!', 'warning');

    try {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        btn.disabled = true;

        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        await database.ref('users/' + userCred.user.uid).set({ name, email, createdAt: Date.now() });
        // No need to redirect manually; onAuthStateChanged will handle it.
        showToast('Registration successful! Logging in...', 'success');
    } catch (e) {
        showToast(e.message, 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) return showToast('Fill all fields!', 'warning');

    const btn = document.querySelector('#loginPage .btn-primary');
    const originalText = btn.innerHTML;

    try {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        btn.disabled = true;

        await auth.signInWithEmailAndPassword(email, password);
        showToast('Login successful!', 'success');
        // Page switch handled by onAuthStateChanged
    } catch (e) {
        showToast(e.message, 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function logout() {
    showConfirm('Are you sure you want to logout?', () => auth.signOut());
}

// --- USER DATA & REQUESTS ---
async function loadUserData() {
    if (!currentUser) return;
    database.ref('users/' + currentUser.uid).on('value', snap => {
        currentUserData = snap.val() || {};
        document.getElementById('userNameCompact').textContent = currentUserData.name || '';
        const avatar = document.getElementById('userAvatarSmall');
        avatar.innerHTML = currentUserData.photoURL ? `<img src="${currentUserData.photoURL}">` : (currentUserData.name ? currentUserData.name.charAt(0) : 'U');
    });

    database.ref('friendRequests').on('value', () => { loadUsers(); updateRequestBadge(); });
    database.ref('friends/' + currentUser.uid).on('value', () => loadUsers());

    // Init Chat Agent listening
    if (window.ChatAgentInstance && typeof window.ChatAgentInstance.init === 'function') {
        window.ChatAgentInstance.init();
    }
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

// --- TABS & LISTS ---

function showTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    // Only set active class if tab exists (Find People removed from tabs)
    const tabEl = document.querySelector(`[data-tab="${tab}"]`);
    if (tabEl) tabEl.classList.add('active');

    // Safety check for dropdown if it was open
    const dd = document.getElementById('profileDropdown');
    if (dd) dd.style.display = 'none';

    // UI Logic: If Switching to Tabs, hide Find People Area and Show Empty State (or previously active chat)
    const findArea = document.getElementById('findPeopleArea');
    const chatArea = document.getElementById('chatArea');
    const emptyState = document.getElementById('emptyState');

    if (findArea) findArea.style.display = 'none';

    // Logic: if selectedUserId, show chatArea, else show emptyState
    // But since sidebar click usually implies just list change, we keep main area as is unless we force clear?
    // Let's assume standard behavior: if logic is simplified, show empty state unless chat active
    if (!selectedUserId) {
        if (chatArea) chatArea.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        if (chatArea) chatArea.style.display = 'flex';
    }

    loadUsers();
}

function showFindPeople() {
    // 1. Close Dropdown
    const dd = document.getElementById('profileDropdown');
    if (dd) dd.style.display = 'none';

    // 2. Hide Chat Areas / Empty State
    const chatArea = document.getElementById('chatArea');
    const emptyState = document.getElementById('emptyState');
    if (chatArea) chatArea.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';

    // 3. Show Find People Area
    const findArea = document.getElementById('findPeopleArea');
    if (findArea) findArea.style.display = 'flex';

    // 4. Deselect Tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    currentTab = 'all'; // Set mode to ALL for internal logic if needed

    // 5. Render Grid
    renderFindPeopleGrid();
}


// --- FULL PAGE FIND PEOPLE GRID ---
async function renderFindPeopleGrid() {
    // Should reuse `loadUsers` data logic but render DIFFERENTLY
    // Lets modify loadUsers or create new fetcher. Reuse is cleaner but UI is different.
    // We will create a standalone fetch for this to keep Logic clean and separate from Sidebar list.

    const uSnap = await database.ref('users').once('value');
    const users = uSnap.val() || {};
    const fSnap = await database.ref('friends/' + currentUser.uid).once('value');
    const friends = fSnap.val() || {};
    const rSnap = await database.ref('friendRequests').once('value');
    const allReqs = rSnap.val() || {};

    // We show ALL users (including hidden ones, as per previous requirement)

    const grid = document.getElementById('findPeopleGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const term = document.getElementById('findPeopleSearch') ? document.getElementById('findPeopleSearch').value.toLowerCase() : '';

    for (let uid in users) {
        if (uid === currentUser.uid) continue;
        const user = users[uid];

        // Filter by search
        if (term && !user.name.toLowerCase().includes(term) && !user.email.toLowerCase().includes(term)) continue;

        const isFriend = friends[uid] === true;
        const received = allReqs[uid] && allReqs[uid][currentUser.uid];
        const sent = allReqs[currentUser.uid] && allReqs[currentUser.uid][uid];

        // Card UI
        const card = document.createElement('div');
        card.className = 'user-card';

        let actions = '';
        let clickAction = '';

        if (isFriend) {
            // Add Message functionality
            actions = `
                <button class="btn-card-message" onclick="openChat('${uid}', '${user.name}', '${user.photoURL || ''}')">Message</button>
                <button class="btn-card-remove" onclick="deleteUser('${uid}')">Remove</button>
            `;
            // Make whole card clickable for chat if friend
            // clickAction = `onclick="openChat('${uid}', '${user.name}', '${user.photoURL || ''}')" style="cursor: pointer;"`;
            // Actually, keep it to buttons to avoid accidental clicks while trying to remove
        } else if (received) {
            actions = `
                <button class="btn-card-accept" onclick="acceptRequest('${uid}')">Accept</button>
                <button class="btn-card-reject" onclick="rejectRequest('${uid}')">Reject</button>
             `;
        } else if (sent) {
            actions = `<button class="btn-card-pending" disabled>Pending</button>`;
        } else {
            actions = `<button class="btn-card-add" onclick="sendRequest('${uid}')">Add Friend</button>`;
        }

        card.innerHTML = `
            <div class="user-card-avatar">
                ${user.photoURL ? `<img src="${user.photoURL}">` : user.name.charAt(0)}
            </div>
            <div class="user-card-name">${user.name}</div>
            <div class="user-card-email">${user.email}</div>
            <div class="user-card-actions">
                ${actions}
            </div>
        `;
        grid.appendChild(card);
    }
}

function filterFindPeople() {
    renderFindPeopleGrid();
}

async function loadUsers() {
    const uSnap = await database.ref('users').once('value');
    const users = uSnap.val() || {};
    allUsersData = users;
    const fSnap = await database.ref('friends/' + currentUser.uid).once('value');
    const friends = fSnap.val() || {};
    const rSnap = await database.ref('friendRequests').once('value');
    const allReqs = rSnap.val() || {};

    // Fetch Hidden Users
    const hSnap = await database.ref('users/' + currentUser.uid + '/hiddenUsers').once('value');
    const hiddenUsers = hSnap.val() || {};

    const list = document.getElementById('usersList');
    list.innerHTML = '';

    for (let uid in users) {
        if (uid === currentUser.uid) continue;

        // Skip hidden users EXCEPT if identifying "All Users" (Find People)
        // User requested: "all user a sob show korbe" (show all in 'all' tab)
        if (currentTab !== 'all' && hiddenUsers[uid]) continue;

        const user = users[uid];
        const isFriend = friends[uid] === true;
        const received = allReqs[uid] && allReqs[uid][currentUser.uid];
        const sent = allReqs[currentUser.uid] && allReqs[currentUser.uid][uid];

        if (currentTab === 'friends' && !isFriend) continue;
        if (currentTab === 'requests' && !received) continue;

        const div = document.createElement('div');
        div.className = 'user-item';
        // Only open chat if clicking the main div, NOT the options button or action button
        div.onclick = (e) => {
            if (!e.target.closest('.user-options-container') && !e.target.closest('button')) {
                if (isFriend) openChat(uid, user.name, user.photoURL);
            }
        };

        let actionBtn = '';
        // Sidebar only shows Friends or Requests now
        if (!isFriend) {
            if (received) {
                actionBtn = `<div class="mt-2">
                        <button class="btn btn-sm btn-success me-2" onclick="event.stopPropagation(); acceptRequest('${uid}')">Accept</button>
                        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); rejectRequest('${uid}')">Reject</button>
                    </div>`;
            } else if (sent) {
                // Should not appear in Requests tab (usually only Received), but safety fallback
                actionBtn = `<button class="btn btn-sm btn-secondary mt-2" disabled>Pending</button>`;
            }
        }

        // Options Menu (3 dots) - ONLY FOR FRIENDS TAB
        let optionsMenu = '';
        if (currentTab === 'friends') {
            optionsMenu = `
                <div class="user-options-container" id="opt-container-${uid}">
                    <button class="btn-user-options" onclick="toggleUserMenu(event, '${uid}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="user-options-menu" id="opt-menu-${uid}">
                        <div class="user-option-item" onclick="hideUser('${uid}')">
                            <i class="fas fa-eye-slash"></i> Hide User
                        </div>
                        <div class="user-option-item danger" onclick="deleteUser('${uid}')">
                            <i class="fas fa-trash-alt"></i> Delete User
                        </div>
                    </div>
                </div>`;
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
                </div>
                ${optionsMenu}`; // Add menu (empty if not friend tab)
        list.appendChild(div);
        if (isFriend) updateLastMessageAndBadge(uid);
    }
}

// --- MESSAGING & DELETE ---
function updateLastMessageAndBadge(targetUid) {
    const chatId = [currentUser.uid, targetUid].sort().join('_');
    database.ref('messages/' + chatId).limitToLast(1).on('value', snap => {
        const msgs = snap.val();
        const lastEl = document.getElementById(`last-msg-${targetUid}`);
        const badgeEl = document.getElementById(`badge-${targetUid}`);

        if (msgs && lastEl) {
            const msgArray = Object.entries(msgs);
            if (msgArray.length === 0) return;
            // Get strictly the last message
            const last = msgArray[msgArray.length - 1][1];

            // Check if last message was deleted by me
            if (last.deletedBy && last.deletedBy[currentUser.uid]) {
                lastEl.textContent = "Message deleted";
            } else {
                let preview = last.text;
                if (last.type === 'image') preview = '📷 Image';
                if (last.type === 'audio') preview = '🎵 Audio';
                if (last.type === 'file') preview = '📎 File';
                lastEl.textContent = (last.senderId === currentUser.uid ? "You: " : "") + preview;
            }

            // Count unread messages (fetch all for accurate count or just rely on last read for now - simple implementation stays)
            // Ideally we'd query unread count separately, but for minimal changes:
            // Just basic badge check if last message is unread and from them
            if (last.receiverId === currentUser.uid && !last.seen && selectedUserId !== targetUid) {
                if (badgeEl) {
                    badgeEl.textContent = "1+"; // Simplified since we are limiting to last 1
                    badgeEl.style.display = 'flex';
                }
            } else {
                if (badgeEl) badgeEl.style.display = 'none';
            }
        }
    });
}

function openAgentChat() {
    const botId = 'agent-bot';
    // Close dropdown
    const dd = document.getElementById('profileDropdown');
    if (dd) dd.style.display = 'none';

    // Open Chat
    openChat(botId, 'Chat Agent', null);
}

function openChat(uid, name, photoURL) {
    console.log("Opening chat with:", name); // Debug
    selectedUserId = uid;

    // UI Updates: Hide Empty State AND Find People Area
    document.getElementById('emptyState').style.display = 'none';
    const findArea = document.getElementById('findPeopleArea');
    if (findArea) findArea.style.display = 'none';

    const chatArea = document.getElementById('chatArea');
    chatArea.style.display = 'flex'; // Ensure Flex
    chatArea.classList.add('active'); // Keep existing active class for other styling

    // Update Header
    document.getElementById('chatName').textContent = name; // Keep existing chatName
    const avatar = document.getElementById('chatAvatar'); // Keep existing avatar logic
    avatar.innerHTML = photoURL ? `<img src="${photoURL}">` : (name === 'Chat Agent' ? '<i class="fas fa-robot"></i>' : name.charAt(0));

    // Mobile: Hide List
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('mobile-hide'); // Keep existing sidebar class
        document.getElementById('chatMain').classList.add('mobile-show'); // Keep existing chatMain class
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

// script.js এর loadMessages function replace করুন

function loadMessages() {
    if (!selectedUserId) return;

    const chatId = [currentUser.uid, selectedUserId].sort().join('_');
    database.ref('messages/' + chatId).on('value', snap => {
        const box = document.getElementById('chatMessages');
        if (!box) return;

        box.innerHTML = '';
        const msgs = snap.val() || {};

        for (let id in msgs) {
            const m = msgs[id];

            // Local Delete Check
            if (m.deletedBy && m.deletedBy[currentUser.uid]) continue;

            const isSent = m.senderId === currentUser.uid;
            const div = document.createElement('div');
            div.className = 'message ' + (isSent ? 'sent' : 'received');

            let contentHtml = '';

            // Handle different message types
            if (m.type === 'image' && m.content) {
                contentHtml = `
                    <img src="${m.content}" 
                         class="msg-image" 
                         onclick="window.open(this.src, '_blank')" 
                         style="max-width: 250px; max-height: 300px; border-radius: 10px; cursor: pointer; display: block;"
                         alt="Image"
                         onerror="this.style.display='none'; this.parentElement.innerHTML+='<p>❌ Image failed to load</p>'">
                `;
            } else if (m.type === 'audio' && m.content) {
                contentHtml = `
                    <audio controls src="${m.content}" style="max-width: 250px;">
                        Your browser does not support audio.
                    </audio>
                `;
            } else if (m.type === 'file' && m.content) {
                const fileName = m.fileName || 'Download File';
                contentHtml = `
                    <a href="${m.content}" 
                       download="${fileName}" 
                       class="msg-file" 
                       style="display: inline-flex; align-items: center; gap: 8px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; text-decoration: none; color: inherit;">
                        <i class="fas fa-file"></i> 
                        <span>${fileName}</span>
                    </a>
                `;
            }

            // Text content (caption or regular message)
            const textHtml = m.text ? `<div style="margin-top: ${contentHtml ? '8px' : '0'};">${m.text}</div>` : '';

            div.innerHTML = `
                <button class="btn-delete-msg-side" 
                        onclick="deleteMsg('${chatId}','${id}')" 
                        title="Delete for me">
                    <i class="fas fa-times-circle"></i>
                </button>
                <div class="message-content">
                    <div class="message-bubble">
                        ${contentHtml}
                        ${textHtml}
                    </div>
                    <div class="message-time">
                        ${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            `;
            box.appendChild(div);
        }

        // Auto scroll to bottom
        box.scrollTop = box.scrollHeight;
    });
}

// script.js এর মধ্যে এই sendMessage function replace করুন

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const messageText = input.value.trim();

    // Check if there's staged file or text
    if (!messageText && !window.stagedFile) return;
    if (!selectedUserId) return;

    const chatId = [currentUser.uid, selectedUserId].sort().join('_');

    // Prepare message object
    const messageData = {
        senderId: currentUser.uid,
        receiverId: selectedUserId,
        timestamp: Date.now(),
        seen: false
    };

    // If there's a staged file
    if (window.stagedFile) {
        const file = window.stagedFile;

        messageData.type = file.type; // image, audio, file
        messageData.content = file.content; // Base64 data
        messageData.fileName = file.name;
        messageData.fileSize = file.size;
        messageData.mimeType = file.mimeType;
        messageData.text = messageText || ''; // Caption (optional)

        // Show sending indicator
        const btn = document.querySelector('.btn-send');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }

        try {
            await database.ref('messages/' + chatId).push(messageData);

            // Clear input and staged file
            input.value = '';
            clearStagedFile();

            // Clear the hidden file input as well
            const fileInput = document.getElementById('hiddenFileInput');
            if (fileInput) fileInput.value = '';

            if (typeof showToast === 'function') {
                showToast('File sent!', 'success');
            }
        } catch (error) {
            console.error("Error sending file:", error);
            if (typeof showToast === 'function') {
                showToast('Failed to send file: ' + error.message, 'error');
            } else {
                alert('Failed to send file: ' + error.message);
            }
        } finally {
            // Restore button
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            }
        }
    } else {
        // Regular text message
        messageData.type = 'text';
        messageData.text = messageText;

        try {
            await database.ref('messages/' + chatId).push(messageData);
            input.value = '';
        } catch (error) {
            console.error("Error sending message:", error);
            if (typeof showToast === 'function') {
                showToast('Failed to send message', 'error');
            }
        }
    }
}

// Enter key support
function handleEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}
// Enter key support
function handleEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Helper to convert File to Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function clearStagedFile() {
    window.stagedFile = null;
    const previewArea = document.getElementById('filePreviewArea');
    const previewImg = document.getElementById('previewThumbnail');
    const previewInfo = document.getElementById('previewInfo');

    if (previewArea) previewArea.style.display = 'none';
    if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }
    if (previewInfo) previewInfo.textContent = '';
}

async function deleteMsg(chatId, msgId) {
    showConfirm("Delete this message for yourself? (It will remain for the other user)", async () => {
        // Soft delete: Mark as deleted for current user
        await database.ref(`messages/${chatId}/${msgId}/deletedBy/${currentUser.uid}`).set(true);
        showToast('Message deleted', 'success');
    });
}

// --- REQUEST LOGIC ---
async function sendRequest(toId) {
    await database.ref(`friendRequests/${currentUser.uid}/${toId}`).set({ from: currentUser.uid, to: toId, timestamp: Date.now() });
    showToast('Friend request sent!', 'success');
}

async function acceptRequest(fromId) {
    await database.ref(`friends/${currentUser.uid}/${fromId}`).set(true);
    await database.ref(`friends/${fromId}/${currentUser.uid}`).set(true);
    await database.ref(`friendRequests/${fromId}/${currentUser.uid}`).remove();
}

async function rejectRequest(fromId) {
    await database.ref(`friendRequests/${fromId}/${currentUser.uid}`).remove();
}

// --- USER OPTIONS LOGIC ---
function toggleUserMenu(event, uid) {
    event.stopPropagation();
    // Close others
    document.querySelectorAll('.user-options-menu').forEach(el => {
        if (el.id !== `opt-menu-${uid}`) el.classList.remove('active');
    });

    const menu = document.getElementById(`opt-menu-${uid}`);
    if (menu) menu.classList.toggle('active');
}

// Close menus when clicking elsewhere
window.addEventListener('click', () => {
    document.querySelectorAll('.user-options-menu').forEach(el => el.classList.remove('active'));
});

async function hideUser(uid) {
    await database.ref(`users/${currentUser.uid}/hiddenUsers/${uid}`).set(true);
    showToast('User hidden from list.', 'success');
    loadUsers();
}

async function deleteUser(uid) {
    showConfirm("Remove this user? They will be unfriended and hidden.", async () => {
        // 1. Unfriend (if friends)
        await database.ref(`friends/${currentUser.uid}/${uid}`).remove();

        // 2. Add to Hidden (to ensure they don't reappear in 'All Users' immediately if that's the goal, OR just unfriend is enough?)
        // User said "only user end theke...". If we just unfriend, they reappear in 'All Users' tab.
        // To "delete" them from view, we must hide them.
        await database.ref(`users/${currentUser.uid}/hiddenUsers/${uid}`).set(true);

        showToast('User removed.', 'success');
        loadUsers();

        // If currently chatting with them, close chat
        if (selectedUserId === uid) backToUsers();
    });
}

function filterUsers() {
    const term = document.getElementById('searchUser').value.toLowerCase();
    document.querySelectorAll('.user-item').forEach(el => {
        const name = el.querySelector('.user-item-name').textContent.toLowerCase();
        el.style.display = name.includes(term) ? 'flex' : 'none';
    });
}

function uploadProfileImage() { document.getElementById('profileImageInput').click(); }

async function handleProfileImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = 200; canvas.height = 200;
            canvas.getContext('2d').drawImage(img, 0, 0, 200, 200);
            database.ref('users/' + currentUser.uid).update({ photoURL: canvas.toDataURL('image/jpeg', 0.7) });
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
    if (document.getElementById('profileDropdown')) document.getElementById('profileDropdown').style.display = 'none';
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
    showToast('Theme Saved!', 'success');
}

// --- MEDIA INTEGRATION (Camera & Mic) ---

let cameraStream = null;
let mediaRecorder = null;
let audioChunks = [];

// CAMERA
async function openCameraModal() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraVideo');
    modal.style.display = 'block'; // Using block for center alignment handled by CSS .modal

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = cameraStream;
    } catch (err) {
        showToast("Error accessing camera: " + err.message, "error");
        closeCameraModal();
    }
}

function closeCameraModal() {
    const modal = document.getElementById('cameraModal');
    const video = document.getElementById('cameraVideo');
    modal.style.display = 'none';

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    video.srcObject = null;
}

// script.js এর capturePhoto function replace করুন

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');

    if (!cameraStream || !video || !canvas) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Convert to Base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);

    // Stage the image (same as file selection)
    window.stagedFile = {
        type: 'image',
        content: base64Image,
        name: `photo_${Date.now()}.jpg`,
        size: base64Image.length,
        mimeType: 'image/jpeg'
    };

    // Show preview
    const previewArea = document.getElementById('filePreviewArea');
    const previewImg = document.getElementById('previewThumbnail');
    const previewInfo = document.getElementById('previewInfo');

    if (previewArea && previewImg && previewInfo) {
        previewImg.src = base64Image;
        previewImg.style.display = 'block';
        previewImg.style.backgroundColor = 'transparent';
        previewInfo.textContent = "Captured Photo";
        previewArea.style.display = 'flex';
    }

    // Close camera modal
    closeCameraModal();

    // Focus message input
    const msgInput = document.getElementById('messageInput');
    if (msgInput) msgInput.focus();

    if (typeof showToast === 'function') {
        showToast('Photo captured! Add a caption and send.', 'success');
    }
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

// Dropdown Logic
function toggleProfileDropdown() {
    const dd = document.getElementById('profileDropdown');
    dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

// Close modal or dropdown when clicking outside
window.onclick = function (event) {
    const settingsModal = document.getElementById('settingsModal');
    const customizeModal = document.getElementById('customizeModal');
    const profileDropdown = document.getElementById('profileDropdown');
    const profileWrapper = document.querySelector('.user-profile-wrapper');
    const agentModal = document.getElementById('agentModal');

    if (event.target === settingsModal) closeSettings();
    if (event.target === customizeModal) closeCustomizeModal();
    if (agentModal && event.target === agentModal) closeAgentModal();

    // Close dropdown if clicked outside user profile wrapper
    if (profileDropdown && profileDropdown.style.display === 'block' && profileWrapper && !profileWrapper.contains(event.target)) {
        profileDropdown.style.display = 'none';
    }
}

// --- TOAST & CONFIRM HELPERS ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;

    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

let confirmCallback = null;

function showConfirm(message, callback) {
    document.getElementById('confirmMessage').innerText = message;
    document.getElementById('confirmationModal').style.display = 'flex';
    confirmCallback = callback;

    const yesBtn = document.getElementById('btnConfirmYes');
    // Remove old listeners to prevent multiple clicks
    const newBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newBtn, yesBtn);

    newBtn.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        closeConfirmModal();
    });
}

function closeConfirmModal() {
    document.getElementById('confirmationModal').style.display = 'none';
    confirmCallback = null;
}

// Override default window.alert (Optional, but safer to replace manually)
// window.alert = (msg) => showToast(msg, 'info'); 

