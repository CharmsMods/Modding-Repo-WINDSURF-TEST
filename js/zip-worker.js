/*
 * Web Worker for handling ZIP compression in the background
 * This worker processes files and creates a ZIP archive with the specified compression level
 */

// Import JSZip library
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');

// Handle messages from the main thread
self.onmessage = async function(e) {
    const { files, compressionLevel, exportType } = e.data;
    const zip = new JSZip();
    
    // Track progress
    let processed = 0;
    const total = files.length;
    
    // Process files
    for (const file of files) {
        try {
            // Add file to zip
            zip.file(file.path, file.blob, { 
                binary: true,
                compression: "DEFLATE",
                compressionOptions: { level: compressionLevel }
            });
            
            // Update progress
            processed++;
            self.postMessage({ 
                type: 'progress', 
                processed, 
                total,
                currentFile: file.path 
            });
        } catch (error) {
            console.error('Error adding file to zip:', error);
            self.postMessage({ 
                type: 'error', 
                error: `Failed to add ${file.path}: ${error.message}` 
            });
        }
    }
    
    // Generate the zip file
    try {
        const content = await zip.generateAsync(
            { 
                type: 'blob', 
                compression: 'DEFLATE', 
                compressionOptions: { level: compressionLevel } 
            },
            (metadata) => {
                self.postMessage({
                    type: 'compression-progress',
                    percent: metadata.percent
                });
            }
        );
        
        // Send the result back
        self.postMessage({
            type: 'complete',
            content,
            fileName: exportType === 'client' ? 'mod-client-export.zip' : 'mod-browser-export.zip'
        });
    } catch (error) {
        self.postMessage({ 
            type: 'error', 
            error: `Failed to generate ZIP: ${error.message}` 
        });
    }
};

// Handle errors in the worker
self.onerror = function(error) {
    self.postMessage({
        type: 'error',
        error: `Worker error: ${error.message}`
    });
    return true; // Prevent default error handling
};
