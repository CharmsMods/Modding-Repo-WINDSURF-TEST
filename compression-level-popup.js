/*
 * Copyright (c) 2025 Charm?
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 *
 * SPDX-License-Identifier: MIT
 *
 * This file handles the compression level selection popup for ZIP exports.
 */

// DOM Elements
let compressionLevelPopup;
let compressionLevelSlider;
let compressionLevelValue;
let confirmCompressionButton;
let cancelCompressionButton;

// Store the selected export type between popups
let pendingExportType = null;

// Initialize the popup when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded: Initializing compression level popup');
    
    // Get DOM elements
    compressionLevelPopup = document.getElementById('compression-level-popup');
    compressionLevelSlider = document.getElementById('compression-level-slider');
    compressionLevelValue = document.getElementById('compression-level-value');
    confirmCompressionButton = document.getElementById('confirm-compression');
    cancelCompressionButton = document.getElementById('cancel-compression');
    
    // Debug: Log all found elements
    console.log('compressionLevelPopup:', compressionLevelPopup);
    console.log('compressionLevelSlider:', compressionLevelSlider);
    console.log('compressionLevelValue:', compressionLevelValue);
    console.log('confirmCompressionButton:', confirmCompressionButton);
    console.log('cancelCompressionButton:', cancelCompressionButton);

    // Set up event listeners
    if (compressionLevelSlider && compressionLevelValue) {
        // Update the displayed value when slider changes
        compressionLevelSlider.addEventListener('input', () => {
            compressionLevelValue.textContent = `${compressionLevelSlider.value}%`;
        });
        
        // Set initial value
        compressionLevelValue.textContent = `${compressionLevelSlider.value}%`;
    }

    // Set up button click handlers
    if (confirmCompressionButton) {
        confirmCompressionButton.addEventListener('click', confirmCompression);
    }

    if (cancelCompressionButton) {
        cancelCompressionButton.addEventListener('click', hideCompressionLevelPopup);
    }

    // Close popup when clicking outside the content
    if (compressionLevelPopup) {
        compressionLevelPopup.addEventListener('click', (e) => {
            if (e.target === compressionLevelPopup) {
                hideCompressionLevelPopup();
            }
        });
    }
});

/**
 * Shows the compression level popup and stores the export type for later use.
 * @param {string} exportType - The type of export ('client' or 'browser').
 */
window.showCompressionLevelPopup = (exportType) => {
    console.log('showCompressionLevelPopup called with type:', exportType);
    
    // Re-find the popup element in case it wasn't found during initial load
    if (!compressionLevelPopup) {
        compressionLevelPopup = document.getElementById('compression-level-popup');
        console.log('Re-queried compressionLevelPopup:', compressionLevelPopup);
    }
    
    if (!compressionLevelPopup) {
        console.error('Compression level popup element not found');
        // Fall back to direct export with default compression
        if (typeof window.initiateZipDownload === 'function') {
            console.warn('Falling back to default compression level (5)');
            window.initiateZipDownload(exportType, 5);
        }
        return;
    }

    // Store the export type for when the user confirms
    pendingExportType = exportType;
    
    // Show the popup
    console.log('Showing compression level popup');
    compressionLevelPopup.style.display = 'flex';
    compressionLevelPopup.classList.add('active');
    
    // Debug: Log the current state
    console.log('compressionLevelPopup classList:', compressionLevelPopup.classList);
    console.log('compressionLevelPopup style.display:', window.getComputedStyle(compressionLevelPopup).display);
};

/**
 * Hides the compression level popup.
 */
function hideCompressionLevelPopup() {
    if (!compressionLevelPopup) return;
    compressionLevelPopup.classList.remove('active');
    pendingExportType = null;
}

/**
 * Handles the confirm button click in the compression level popup.
 * Initiates the ZIP download with the selected compression level.
 */
async function confirmCompression() {
    if (!pendingExportType) {
        console.error('No export type selected');
        return;
    }

    // Get the selected compression level (0-9, where 0 is no compression, 9 is maximum)
    const compressionLevel = parseInt(compressionLevelSlider.value, 10);
    
    // Map the 0-100 slider value to 0-9 for JSZip
    const jsZipCompressionLevel = Math.round((compressionLevel / 100) * 9);
    
    // Hide the popup
    hideCompressionLevelPopup();
    
    // Log the selected compression level
    if (window.updateConsoleLog) {
        window.updateConsoleLog(`Using compression level: ${jsZipCompressionLevel} (${compressionLevel}%)`);
    }
    
    // Call the export function with the selected compression level
    if (typeof window.initiateZipDownload === 'function') {
        try {
            await window.initiateZipDownload(pendingExportType, jsZipCompressionLevel);
        } catch (error) {
            console.error('Error during export:', error);
            if (window.updateConsoleLog) {
                window.updateConsoleLog(`[ERROR] Export failed: ${error.message}`);
            }
            if (window.hideLoadingOverlayWithDelay) {
                window.hideLoadingOverlayWithDelay(3000, 'Export failed!');
            }
        }
    } else {
        console.error('initiateZipDownload function not found');
    }
}

// Make the hide function available globally
window.hideCompressionLevelPopup = hideCompressionLevelPopup;
