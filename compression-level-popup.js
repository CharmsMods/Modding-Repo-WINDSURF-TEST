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
    console.log('=== compression-level-popup.js: DOMContentLoaded ===');
    
    // Get DOM elements
    console.log('Querying for popup elements...');
    compressionLevelPopup = document.getElementById('compression-level-popup');
    compressionLevelSlider = document.getElementById('compression-level-slider');
    compressionLevelValue = document.getElementById('compression-level-value');
    confirmCompressionButton = document.getElementById('confirm-compression');
    cancelCompressionButton = document.getElementById('cancel-compression');
    
    // Ensure the popup is hidden by default
    if (compressionLevelPopup) {
        compressionLevelPopup.style.display = 'none';
        compressionLevelPopup.classList.remove('active');
    }
    
    // Debug: Log all found elements
    console.log('Found elements:', {
        compressionLevelPopup: compressionLevelPopup ? 'Found' : 'Not found',
        compressionLevelSlider: compressionLevelSlider ? 'Found' : 'Not found',
        compressionLevelValue: compressionLevelValue ? 'Found' : 'Not found',
        confirmCompressionButton: confirmCompressionButton ? 'Found' : 'Not found',
        cancelCompressionButton: cancelCompressionButton ? 'Found' : 'Not found'
    });
    
    // Check if the popup is in the DOM
    if (!compressionLevelPopup) {
        console.error('CRITICAL: compression-level-popup element not found in DOM!');
        console.log('Searching for any element with id containing "compression"...');
        const allElements = document.querySelectorAll('*');
        const compressionElements = [];
        allElements.forEach(el => {
            if (el.id && el.id.includes('compression')) {
                compressionElements.push({
                    id: el.id,
                    tagName: el.tagName,
                    className: el.className
                });
            }
        });
        console.log('Elements with "compression" in ID:', compressionElements);
    }

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
    console.log('=== showCompressionLevelPopup START ===');
    console.log('Export type:', exportType);
    
    // Debug: Log the current state of the window object
    console.log('Window object has showCompressionLevelPopup:', 'showCompressionLevelPopup' in window);
    
    // Re-find the popup element in case it wasn't found during initial load
    if (!compressionLevelPopup) {
        console.log('Popup element not found in memory, querying DOM...');
        compressionLevelPopup = document.getElementById('compression-level-popup');
        console.log('Re-queried compressionLevelPopup:', compressionLevelPopup ? 'Found' : 'Not found');
        
        // If still not found, search the entire document
        if (!compressionLevelPopup) {
            console.log('Searching for any element with id containing "compression"...');
            const allElements = document.querySelectorAll('*');
            const compressionElements = [];
            allElements.forEach(el => {
                if (el.id && el.id.includes('compression')) {
                    compressionElements.push({
                        id: el.id,
                        tagName: el.tagName,
                        className: el.className
                    });
                }
            });
            console.log('Elements with "compression" in ID:', compressionElements);
        }
    }
    
    if (!compressionLevelPopup) {
        const errorMsg = 'Compression level popup element not found in DOM';
        console.error(errorMsg);
        // Fall back to direct export with default compression
        if (typeof window.initiateZipDownload === 'function') {
            console.warn('Falling back to default compression level (5)');
            window.initiateZipDownload(exportType, 5);
        } else {
            console.error('initiateZipDownload function not found!');
        }
        console.log('=== showCompressionLevelPopup END (error) ===');
        return;
    }

    // Store the export type for when the user confirms
    pendingExportType = exportType;
    console.log('Stored export type:', pendingExportType);
    
    // Show the popup
    console.log('=== DEBUG: Showing compression level popup ===');
    
    // Debug: Check current state before showing
    console.log('Before showing popup:');
    console.log('- compressionLevelPopup element exists:', !!compressionLevelPopup);
    if (compressionLevelPopup) {
        console.log('- Current classList:', compressionLevelPopup.className);
        console.log('- Current display style:', window.getComputedStyle(compressionLevelPopup).display);
        console.log('- Current visibility:', window.getComputedStyle(compressionLevelPopup).visibility);
        console.log('- Current opacity:', window.getComputedStyle(compressionLevelPopup).opacity);
        console.log('- Current z-index:', window.getComputedStyle(compressionLevelPopup).zIndex);
        
        // Check if any parent elements are hidden
        let parent = compressionLevelPopup.parentElement;
        let parentLevel = 0;
        while (parent && parentLevel < 10) { // Check up to 10 levels up
            const display = window.getComputedStyle(parent).display;
            const visibility = window.getComputedStyle(parent).visibility;
            const opacity = window.getComputedStyle(parent).opacity;
            if (display === 'none' || visibility === 'hidden' || opacity === '0') {
                console.warn(`Hidden parent element at level ${parentLevel}:`, {
                    tag: parent.tagName,
                    id: parent.id,
                    class: parent.className,
                    display,
                    visibility,
                    opacity
                });
            }
            parent = parent.parentElement;
            parentLevel++;
        }
    }
    
    // Try to force show the popup
    try {
        console.log('Attempting to show popup...');
        
        // First approach: Use the active class
        console.log('Adding active class and setting display:flex...');
        compressionLevelPopup.style.display = 'flex';
        compressionLevelPopup.classList.add('active');
        
        // Force reflow/repaint
        void compressionLevelPopup.offsetHeight;
        
        // Log state after first attempt
        console.log('After first show attempt:');
        console.log('- classList:', compressionLevelPopup.className);
        console.log('- display:', window.getComputedStyle(compressionLevelPopup).display);
        console.log('- visibility:', window.getComputedStyle(compressionLevelPopup).visibility);
        console.log('- opacity:', window.getComputedStyle(compressionLevelPopup).opacity);
        
        // Check if the popup is actually visible
        const isVisible = window.getComputedStyle(compressionLevelPopup).display !== 'none' && 
                         window.getComputedStyle(compressionLevelPopup).visibility !== 'hidden' &&
                         window.getComputedStyle(compressionLevelPopup).opacity !== '0';
        
        console.log('Popup visibility check:', {
            display: window.getComputedStyle(compressionLevelPopup).display,
            visibility: window.getComputedStyle(compressionLevelPopup).visibility,
            opacity: window.getComputedStyle(compressionLevelPopup).opacity,
            isVisible: isVisible
        });
        
        // If still not visible, try a more aggressive approach
        if (!isVisible) {
            console.warn('Popup not visible after first attempt, trying alternative method...');
            
            // Try setting all possible visibility properties
            compressionLevelPopup.style.display = 'flex';
            compressionLevelPopup.style.visibility = 'visible';
            compressionLevelPopup.style.opacity = '1';
            compressionLevelPopup.style.pointerEvents = 'auto';
            compressionLevelPopup.style.position = 'fixed';
            compressionLevelPopup.style.top = '0';
            compressionLevelPopup.style.left = '0';
            compressionLevelPopup.style.width = '100%';
            compressionLevelPopup.style.height = '100%';
            compressionLevelPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            compressionLevelPopup.style.zIndex = '9999';
            
            // Force reflow/repaint again
            void compressionLevelPopup.offsetHeight;
            
            console.log('After second show attempt:');
            console.log('- display:', window.getComputedStyle(compressionLevelPopup).display);
            console.log('- visibility:', window.getComputedStyle(compressionLevelPopup).visibility);
            console.log('- opacity:', window.getComputedStyle(compressionLevelPopup).opacity);
            
            // Add a temporary red border to help with debugging
            compressionLevelPopup.style.border = '4px solid red';
            console.warn('Added red border to popup for debugging');
        }
        
        // Final state check
        const finalState = {
            display: window.getComputedStyle(compressionLevelPopup).display,
            visibility: window.getComputedStyle(compressionLevelPopup).visibility,
            opacity: window.getComputedStyle(compressionLevelPopup).opacity,
            position: window.getComputedStyle(compressionLevelPopup).position,
            zIndex: window.getComputedStyle(compressionLevelPopup).zIndex,
            classList: [...compressionLevelPopup.classList],
            computedStyle: window.getComputedStyle(compressionLevelPopup)
        };
        
        console.log('Final popup state:', finalState);
        
        // If still not visible, show an alert with debug info
        const finalVisibility = window.getComputedStyle(compressionLevelPopup).display !== 'none' && 
                              window.getComputedStyle(compressionLevelPopup).visibility !== 'hidden' &&
                              window.getComputedStyle(compressionLevelPopup).opacity !== '0';
        
        if (!finalVisibility) {
            console.error('Popup is still not visible after all attempts!');
            alert('Debug: Popup is not visible. Check console for details.\n\n' +
                  `Display: ${finalState.display}\n` +
                  `Visibility: ${finalState.visibility}\n` +
                  `Opacity: ${finalState.opacity}\n` +
                  `Position: ${finalState.position}\n` +
                  `z-index: ${finalState.zIndex}`);
        } else {
            console.log('Popup should now be visible!');
        }
        
    } catch (error) {
        console.error('Error while trying to show popup:', error);
        alert('Error showing popup: ' + error.message);
    }
    
    console.log('=== showCompressionLevelPopup END ===');
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
    console.log('Confirm compression button clicked');
    
    if (!pendingExportType) {
        const errorMsg = 'No export type selected. Please try again.';
        console.error(errorMsg);
        alert(errorMsg);
        hideCompressionLevelPopup();
        return;
    }

    // Get the selected compression level (0-100 from slider)
    const compressionLevel = parseInt(compressionLevelSlider.value, 10);
    console.log('Selected compression level:', compressionLevel, '%');
    
    // Map the 0-100 slider value to 0-9 for JSZip
    const jsZipCompressionLevel = Math.round((compressionLevel / 100) * 9);
    console.log('Mapped to JSZip compression level:', jsZipCompressionLevel);
    
    // Hide the popup
    console.log('Hiding compression level popup');
    hideCompressionLevelPopup();
    
    // Show loading overlay
    if (window.showLoadingOverlay) {
        window.showLoadingOverlay(`Preparing ${pendingExportType} export with compression level ${jsZipCompressionLevel}...`);
    }
    
    // Log the selected compression level
    if (window.updateConsoleLog) {
        window.updateConsoleLog(`Starting export with compression level: ${jsZipCompressionLevel} (${compressionLevel}%)`);
    }
    
    // Call the export function with the selected compression level
    if (typeof window.initiateZipDownload === 'function') {
        try {
            console.log('Calling initiateZipDownload with:', { 
                exportType: pendingExportType, 
                compressionLevel: jsZipCompressionLevel 
            });
            
            await window.initiateZipDownload(pendingExportType, jsZipCompressionLevel);
            
            console.log('Export completed successfully');
        } catch (error) {
            const errorMsg = `Error during export: ${error.message}`;
            console.error(errorMsg, error);
            
            if (window.updateConsoleLog) {
                window.updateConsoleLog(`[ERROR] ${errorMsg}`);
            }
            
            if (window.hideLoadingOverlayWithDelay) {
                window.hideLoadingOverlayWithDelay(3000, 'Export failed!');
            }
            
            alert('Export failed: ' + error.message);
        }
    } else {
        const errorMsg = 'Error: Export functionality not available. Please refresh the page and try again.';
        console.error(errorMsg);
        alert(errorMsg);
    }
}

// Make the hide function available globally
window.hideCompressionLevelPopup = hideCompressionLevelPopup;
