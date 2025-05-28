// Get DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const originalImage = document.getElementById('originalImage');
const originalInfo = document.getElementById('originalInfo');
const convertBtn = document.getElementById('convertBtn');
const newFileBtn = document.getElementById('newFileBtn');

let currentFile = null;

// Event handlers for file upload
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

// Event handlers for preview area (new functionality)
originalImage.addEventListener('click', () => fileInput.click());
originalImage.addEventListener('dragover', handlePreviewDragOver);
originalImage.addEventListener('dragleave', handlePreviewDragLeave);
originalImage.addEventListener('drop', handlePreviewDrop);

// Convert button handler
convertBtn.addEventListener('click', convertAndDownload);

// New file button handler
newFileBtn.addEventListener('click', resetState);

// Drag & drop functions for upload area
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// Drag & drop functions for preview area (new functionality)
function handlePreviewDragOver(e) {
    e.preventDefault();
    originalImage.style.opacity = '0.7';
    originalImage.style.transform = 'scale(0.95)';
}

function handlePreviewDragLeave(e) {
    e.preventDefault();
    originalImage.style.opacity = '1';
    originalImage.style.transform = 'scale(1)';
}

function handlePreviewDrop(e) {
    e.preventDefault();
    originalImage.style.opacity = '1';
    originalImage.style.transform = 'scale(1)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// Main file handling function
function handleFile(file) {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Track file upload event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'file_upload', {
            'event_category': 'engagement',
            'event_label': file.type,
            'value': Math.round(file.size / 1024) // file size in KB
        });
    }
    
    // Track file upload event in Yandex.Metrika
    if (typeof ym !== 'undefined') {
        ym(102230986, 'reachGoal', 'file_upload', {
            file_type: file.type,
            file_size_kb: Math.round(file.size / 1024)
        });
    }

    currentFile = file;
    
    // Create URL for preview
    const imageUrl = URL.createObjectURL(file);
    originalImage.src = imageUrl;
    
    // Show file information
    showImageInfo(file, originalInfo);
    
    // Show preview section
    previewSection.style.display = 'block';
    
    // Hide upload area
    uploadArea.style.display = 'none';
}

// Function to display image information
function showImageInfo(file, infoElement) {
    infoElement.innerHTML = `File: ${file.name}`;
}

// Convert and download function
function convertAndDownload() {
    if (!currentFile) return;
    
    // Track conversion start
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion_start', {
            'event_category': 'engagement',
            'event_label': currentFile.type
        });
    }
    
    // Track conversion start in Yandex.Metrika
    if (typeof ym !== 'undefined') {
        ym(102230986, 'reachGoal', 'conversion_start', {
            file_type: currentFile.type
        });
    }
    
    convertBtn.textContent = 'Converting...';
    convertBtn.disabled = true;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert to JPG with fixed quality of 90%
        canvas.toBlob(function(blob) {
            // Track successful conversion
            if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion_complete', {
                    'event_category': 'engagement',
                    'event_label': currentFile.type,
                    'value': Math.round(blob.size / 1024) // output size in KB
                });
            }
            
            // Track successful conversion in Yandex.Metrika
            if (typeof ym !== 'undefined') {
                ym(102230986, 'reachGoal', 'conversion_complete', {
                    file_type: currentFile.type,
                    output_size_kb: Math.round(blob.size / 1024)
                });
            }
            
            // Create filename based on original
            const originalName = currentFile.name;
            const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
            const fileName = `${nameWithoutExt}.jpg`;
            
            // Create download link and trigger download
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            
            // Programmatically click the link
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Free memory
            URL.revokeObjectURL(downloadUrl);
            
            // Update UI
            convertBtn.textContent = 'Converted & Downloaded!';
            convertBtn.style.background = '#28a745';
            
            // Show success message
            setTimeout(() => {
                convertBtn.textContent = 'Convert & Download JPG';
                convertBtn.style.background = '';
                convertBtn.disabled = false;
            }, 2000);
            
        }, 'image/jpeg', 0.9);
        
        URL.revokeObjectURL(img.src);
    };
    
    img.src = URL.createObjectURL(currentFile);
}

// Reset state function
function resetState() {
    // Track new file button click
    if (typeof gtag !== 'undefined') {
        gtag('event', 'new_file_click', {
            'event_category': 'engagement'
        });
    }
    
    // Track new file button click in Yandex.Metrika
    if (typeof ym !== 'undefined') {
        ym(102230986, 'reachGoal', 'new_file_click');
    }
    
    currentFile = null;
    previewSection.style.display = 'none';
    uploadArea.style.display = 'block';
    fileInput.value = '';
    convertBtn.textContent = 'Convert & Download JPG';
    convertBtn.style.background = '';
    convertBtn.disabled = false;
}

// Error handling
window.addEventListener('error', function(e) {
    // Filter anonymous "Script error" (usually from browser/Custom Tabs system scripts)
    if (e.message === 'Script error.' && !e.filename && !e.lineno) {
        console.warn('Ignoring anonymous script error (likely browser/system related)');
        return;
    }
    
    // Show alert only for real errors
    console.error('An error occurred:', e.error);
    alert('An error occurred while processing the image. Please try again.');
    resetState();
});

// Prevent default drag & drop behavior for the entire page
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault()); 