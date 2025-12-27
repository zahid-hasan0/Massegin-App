// File Sharing Logic (Base64)

function triggerFileSelect(type) {
    const input = document.getElementById('hiddenFileInput');
    if (!input) return;

    // Set accept attribute based on type
    if (type === 'image') input.accept = "image/*";
    else if (type === 'audio') input.accept = "audio/*";
    else input.accept = "*/*";

    input.setAttribute('data-type', type);
    // Label will trigger the input automatically, no need for input.click()
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const input = event.target;

    if (!file) return;

    // Clear any existing staged file first
    if (window.stagedFile) {
        clearStagedFile();
    }

    // Size Limit: 2MB
    if (file.size > 2 * 1024 * 1024) {
        if (typeof showToast === 'function') {
            showToast("File too large! Max 2MB.", 'error');
        } else {
            alert("File too large! Max 2MB.");
        }
        event.target.value = '';
        return;
    }

    const type = event.target.getAttribute('data-type') || 'file';

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;

        // Stage the file
        window.stagedFile = {
            type: type,
            content: base64,
            name: file.name,
            size: file.size,
            mimeType: file.type
        };

        renderFilePreview(file.name, type, base64);

        // Hide attachment menu
        const menu = document.getElementById('attachmentMenu');
        if (menu) menu.style.display = 'none';

        // Focus input
        const msgInput = document.getElementById('messageInput');
        if (msgInput) msgInput.focus();
    };

    reader.onerror = function () {
        if (typeof showToast === 'function') {
            showToast("Error reading file!", 'error');
        } else {
            alert("Error reading file!");
        }
        input.value = ''; // Clear input
    };

    reader.readAsDataURL(file);

    // IMPORTANT: Clear input after reading so same file can be selected again
    setTimeout(() => {
        input.value = '';
    }, 100);
}

function renderFilePreview(name, type, base64) {
    const area = document.getElementById('filePreviewArea');
    const thumb = document.getElementById('previewThumbnail');
    const info = document.getElementById('previewInfo');

    if (!area || !thumb || !info) return;

    thumb.style.display = 'block';

    if (type === 'image') {
        thumb.src = base64;
        thumb.style.backgroundColor = 'transparent';
    } else if (type === 'audio') {
        thumb.src = '';
        thumb.style.backgroundColor = '#667eea';
        thumb.alt = '🎵 Audio';
    } else {
        thumb.src = '';
        thumb.style.backgroundColor = '#ccc';
        thumb.alt = '📎 File';
    }

    info.textContent = name;
    area.style.display = 'flex';
}

function clearStagedFile() {
    window.stagedFile = null;
    const area = document.getElementById('filePreviewArea');
    const input = document.getElementById('hiddenFileInput');
    const thumb = document.getElementById('previewThumbnail');

    if (area) area.style.display = 'none';
    if (input) input.value = '';
    if (thumb) {
        thumb.src = '';
        thumb.style.display = 'none';
    }
}

function toggleAttachmentMenu() {
    const menu = document.getElementById('attachmentMenu');
    if (!menu) return;

    const isVisible = menu.style.display === 'flex';
    menu.style.display = isVisible ? 'none' : 'flex';
}

// Close menu on outside click
document.addEventListener('click', function (e) {
    const menu = document.getElementById('attachmentMenu');
    const btn = document.getElementById('btnAttachment');

    if (!menu || !btn) return;

    if (menu.style.display === 'flex' &&
        !menu.contains(e.target) &&
        !btn.contains(e.target)) {
        menu.style.display = 'none';
    }
});