
// File Sharing Logic

function triggerFileSelect(type) {
    const input = document.getElementById('fileInput');
    // Set accept attribute based on type
    if (type === 'image') input.accept = "image/*";
    else if (type === 'audio') input.accept = "audio/*";
    else input.accept = "*/*";

    input.setAttribute('data-type', type);
    input.click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Size Limit: 500KB (example) to prevent large DB payloads
    if (file.size > 500 * 1024) {
        showToast("File too large! Max 500KB.", 'error');
        document.getElementById('fileInput').value = ''; // Reset
        return;
    }

    const type = document.getElementById('fileInput').getAttribute('data-type') || 'file'; // image, audio, file

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;

        // STAGING: Do NOT send immediately. Store and Preview.
        window.stagedFile = {
            type: type,
            content: base64,
            name: file.name
        };

        renderFilePreview(file.name, type, base64);

        // Hide attachment menu
        const menu = document.getElementById('attachmentMenu');
        if (menu) menu.style.display = 'none';

        // Focus input so user can just hit enter
        document.getElementById('messageInput').focus();
    };
    reader.readAsDataURL(file);
}

function renderFilePreview(name, type, base64) {
    const area = document.getElementById('filePreviewArea');
    const thumb = document.getElementById('previewThumbnail');
    const info = document.getElementById('previewInfo');

    if (!area) return; // Should be in DOM

    if (type === 'image') {
        thumb.src = base64;
    } else if (type === 'audio') {
        thumb.src = ''; // Placeholder or icon?
        thumb.style.backgroundColor = '#667eea';
        // We could set a dummy icon here if needed via CSS or JS, but let's keep it simple
    } else {
        thumb.src = '';
        thumb.style.backgroundColor = '#ccc';
    }

    info.textContent = name;
    area.classList.add('active');
}

function clearStagedFile() {
    window.stagedFile = null;
    const area = document.getElementById('filePreviewArea');
    if (area) area.classList.remove('active');
    document.getElementById('fileInput').value = '';
}

// Toggle attachment menu
function toggleAttachmentMenu() {
    const menu = document.getElementById('attachmentMenu');
    menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
}

// Close menu on outside click
window.addEventListener('click', (e) => {
    const menu = document.getElementById('attachmentMenu');
    const btn = document.getElementById('btnAttachment');
    if (menu && menu.style.display === 'flex' && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.style.display = 'none';
    }
});
