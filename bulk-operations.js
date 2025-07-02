/*
 * Copyright (c) 2025 Charm?
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 *
 * SPDX-License-Identifier: MIT
 *
 * This file contains helper functions for the website frontend.
 */


// bulk-operations.js
// This file handles multi-selection mode and bulk operations on assets.

// Global state variables
let isMultiSelectMode = false;
const selectedAssets = new Set(); // Stores references to asset objects (from allAssets array)

// DOM Elements
let toggleMultiSelectButton;
let multiSelectActionsContainer;
let selectedAssetsCountDisplay;
let openBulkEditButton; // NEW: Single button for bulk editing

let bulkOperationsModal;
let closeBulkModalButton;
let bulkSaturationSlider;
let bulkSaturationValueDisplay;
let applyBulkSaturationButton;
let bulkNewTextureWidthInput;
let bulkNewTextureHeightInput;
let bulkNewTextureColorInput;
let saveBulkNewTextureButton;

// New: DOM elements for the bulk upload texture section
let bulkUploadImageInput;
let bulkUploadImagePreview;
let applyBulkUploadTextureButton;
let bulkUploadPreviewPlaceholder;

// New: DOM elements for the bulk resize section
let resizeWidthInput;
let resizeHeightInput;
let maintainAspectCheckbox;
let applyBulkResizeButton;

// New: DOM element for exclude button
let toggleExcludeButton;

let uploadedImageBlob = null; // Stores the actual uploaded image blob for bulk application

document.addEventListener('DOMContentLoaded', () => {
    // Get multi-select DOM elements
    toggleMultiSelectButton = document.getElementById('toggle-multi-select-button');
    multiSelectActionsContainer = document.getElementById('multi-select-actions');
    selectedAssetsCountDisplay = document.getElementById('selected-assets-count');
    openBulkEditButton = document.getElementById('open-bulk-edit-button'); // NEW: Get reference to the single button
    
    if (!openBulkEditButton) console.error('ERROR: open-bulk-edit-button not found!');


    // Get bulk operations modal DOM elements
    bulkOperationsModal = document.getElementById('bulk-operations-modal');
    closeBulkModalButton = document.getElementById('close-bulk-modal');
    bulkSaturationSlider = document.getElementById('bulk-saturation-slider');
    bulkSaturationValueDisplay = document.getElementById('bulk-saturation-value');
    applyBulkSaturationButton = document.getElementById('apply-bulk-saturation');
    bulkNewTextureWidthInput = document.getElementById('bulk-new-texture-width');
    bulkNewTextureHeightInput = document.getElementById('bulk-new-texture-height');
    bulkNewTextureColorInput = document.getElementById('bulk-new-texture-color');
    saveBulkNewTextureButton = document.getElementById('save-bulk-new-texture');

    // Add robust error logging for bulk modal DOM elements
    if (!bulkOperationsModal) console.error('ERROR: bulk-operations-modal not found!');
    if (!closeBulkModalButton) console.error('ERROR: close-bulk-modal button not found!');
    if (!bulkSaturationSlider) console.error('ERROR: bulk-saturation-slider not found!');
    if (!bulkSaturationValueDisplay) console.error('ERROR: bulk-saturation-value not found!');
    if (!applyBulkSaturationButton) console.error('ERROR: apply-bulk-saturation button not found!');
    if (!bulkNewTextureWidthInput) console.error('ERROR: bulk-new-texture-width input not found!');
    if (!bulkNewTextureHeightInput) console.error('ERROR: bulk-new-texture-height input not found!');
    if (!bulkNewTextureColorInput) console.error('ERROR: bulk-new-texture-color input not found!');
    if (!saveBulkNewTextureButton) console.error('ERROR: save-bulk-new-texture button not found!');

    // New: Get references to the bulk upload image section elements
    bulkUploadImageInput = document.getElementById('bulk-upload-image-input');
    bulkUploadImagePreview = document.getElementById('bulk-upload-image-preview');
    applyBulkUploadTextureButton = document.getElementById('apply-bulk-upload-texture');
    bulkUploadPreviewPlaceholder = document.getElementById('bulk-upload-preview-placeholder');
    
    // Get reference to the exclude button
    toggleExcludeButton = document.getElementById('toggle-exclude-selected');

    if (!bulkUploadImageInput) console.error('ERROR: bulk-upload-image-input not found!');
    if (!bulkUploadImagePreview) console.error('ERROR: bulk-upload-image-preview not found!');
    if (!applyBulkUploadTextureButton) console.error('ERROR: apply-bulk-upload-texture button not found!');
    if (!bulkUploadPreviewPlaceholder) console.error('ERROR: bulk-upload-preview-placeholder not found!');


    // Add Event Listeners
    if (toggleMultiSelectButton) {
        toggleMultiSelectButton.addEventListener('click', toggleMultiSelectMode);
    }

    if (openBulkEditButton) {
        openBulkEditButton.addEventListener('click', openBulkOperationsModal);
    }

    if (closeBulkModalButton) {
        closeBulkModalButton.addEventListener('click', closeBulkOperationsModal);
    }

    if (bulkSaturationSlider) {
        bulkSaturationSlider.addEventListener('input', () => {
            bulkSaturationValueDisplay.textContent = `${bulkSaturationSlider.value}%`;
        });
    }

    if (applyBulkSaturationButton) {
        applyBulkSaturationButton.addEventListener('click', applyBulkSaturation);
    }

    if (saveBulkNewTextureButton) {
        saveBulkNewTextureButton.addEventListener('click', saveBulkNewTexture);
    }

    // New: Add event listeners for the bulk upload image section
    if (bulkUploadImageInput) {
        bulkUploadImageInput.addEventListener('change', handleBulkImageUpload);
    }
    if (applyBulkUploadTextureButton) {
        applyBulkUploadTextureButton.addEventListener('click', applyBulkUploadedTexture);
    }
    
    // Add event listener for the exclude button
    if (toggleExcludeButton) {
        toggleExcludeButton.addEventListener('click', toggleExcludeSelected);
    }


    // Export functions to global scope so asset-list-page.js can access them
    window.toggleAssetSelection = toggleAssetSelection;
    window.isMultiSelectModeActive = () => isMultiSelectMode;
    window.updateBulkActionButtonsState = updateBulkActionButtonsState;
    window.toggleMultiSelectMode = toggleMultiSelectMode;
});

/**
 * Toggles multi-select mode on and off.
 */
function toggleMultiSelectMode() {
    isMultiSelectMode = !isMultiSelectMode;
    document.body.classList.toggle('multi-select-active', isMultiSelectMode);
    
    // Show/hide the multi-select UI
    const multiSelectUI = document.querySelector('.multi-select-actions');
    const selectAllButton = document.getElementById('select-all-button');
    
    if (multiSelectUI) {
        multiSelectUI.style.display = isMultiSelectMode ? 'flex' : 'none';
    }
    
    // Show/hide the select all button
    if (selectAllButton) {
        selectAllButton.style.display = isMultiSelectMode ? 'inline-flex' : 'none';
    }
    
    // Clear selection when exiting multi-select mode
    if (!isMultiSelectMode) {
        clearSelectedAssets();
    }

    if (isMultiSelectMode) {
        toggleMultiSelectButton.textContent = 'Exit Selection';
        // Show bulk action buttons container
        if (multiSelectActionsContainer) {
            console.log('DEBUG (show): multiSelectActionsContainer before style change:', multiSelectActionsContainer.style.display);
            multiSelectActionsContainer.style.display = 'flex'; // Force to flex
            console.log('DEBUG (show): multiSelectActionsContainer AFTER style change to flex:', multiSelectActionsContainer.style.display);
        } else {
            console.error('DEBUG (show): multiSelectActionsContainer is null!');
        }
    } else {
        toggleMultiSelectButton.textContent = 'Select Assets';
        // Hide bulk action buttons container
        if (multiSelectActionsContainer) {
            console.log('DEBUG (hide): multiSelectActionsContainer before style change:', multiSelectActionsContainer.style.display);
            multiSelectActionsContainer.style.display = 'none'; // Force to none
            console.log('DEBUG (hide): multiSelectActionsContainer AFTER style change to none:', multiSelectActionsContainer.style.display);
        } else {
            console.error('DEBUG (hide): multiSelectActionsContainer is null!');
        }
        clearSelectedAssets(); // Clear all selections when exiting mode
    }

    // Update visibility/interactivity of individual card elements
    const editButtons = document.querySelectorAll('.edit-asset-button');
    editButtons.forEach(button => {
        const card = button.closest('.texture-card');
        if (card && !card.classList.contains('mp3')) {
            button.disabled = isMultiSelectMode;
            button.style.pointerEvents = isMultiSelectMode ? 'none' : 'auto';
            button.style.opacity = isMultiSelectMode ? '0.5' : '1';
        }
    });

    const imageCardButtons = document.querySelectorAll('.buttons-container .download-button, .buttons-container .copy-button');
    imageCardButtons.forEach(button => {
        button.disabled = isMultiSelectMode;
        button.style.pointerEvents = isMultiSelectMode ? 'none' : 'auto';
        button.style.opacity = isMultiSelectMode ? '0.5' : '1';
    });

    // Ensure initial button state is updated based on selected count
    updateBulkActionButtonsState();
}

/**
 * Toggles the selection state of an individual asset.
 * This function will be called from asset-list-page.js when a card is clicked in multi-select mode.
 * @param {Object} asset The asset object to select/deselect.
 * @param {HTMLElement} cardElement The DOM element of the asset card.
 */
function toggleAssetSelection(asset, cardElement) {
    // Only allow selection of PNG/JPG assets (exclude MP3s)
    if (asset.type.toLowerCase() === 'mp3') {
        console.log('Attempted to select MP3 file for bulk image operations. Skipping.');
        // Optionally provide a visible message to the user here instead of just console.log
        return;
    }

    if (selectedAssets.has(asset)) {
        selectedAssets.delete(asset);
        cardElement.classList.remove('selected-for-bulk');
        console.log(`Asset deselected: ${asset.filename}. Total selected: ${selectedAssets.size}`);
    } else {
        selectedAssets.add(asset);
        cardElement.classList.add('selected-for-bulk');
        console.log(`Asset selected: ${asset.filename}. Total selected: ${selectedAssets.size}`);
    }
    updateSelectedCountDisplay();
    updateBulkActionButtonsState(); // Crucial call to update button disabled state
}

/**
 * Clears all currently selected assets.
 */
function clearSelectedAssets() {
    selectedAssets.forEach(asset => {
        if (asset.cardElement) {
            asset.cardElement.classList.remove('selected-for-bulk');
        }
    });
    selectedAssets.clear();
    updateSelectedCountDisplay();
    updateBulkActionButtonsState();
    console.log('All selected assets cleared.');
}

/**
 * Updates the display of how many assets are selected.
 */
function updateSelectedCountDisplay() {
    if (selectedAssetsCountDisplay) {
        selectedAssetsCountDisplay.textContent = `${selectedAssets.size} Asset${selectedAssets.size === 1 ? '' : 's'} Selected`;
        console.log(`Updated selected count display: ${selectedAssets.size}`);
    }
}

/**
 * Enables or disables the single bulk edit button based on the number of selected assets.
 */
function updateBulkActionButtonsState() {
    const enableButton = selectedAssets.size >= 1; // Enable if at least one asset is selected
    console.log(`updateBulkActionButtonsState: Selected assets = ${selectedAssets.size}, enableButton = ${enableButton}`);

    if (openBulkEditButton) { // Check the new single button
        openBulkEditButton.disabled = !enableButton;
        openBulkEditButton.style.opacity = enableButton ? '1' : '0.5';
        openBulkEditButton.style.pointerEvents = enableButton ? 'auto' : 'none'; // Ensure clicks are enabled/disabled
        console.log(`DEBUG: openBulkEditButton disabled state: ${openBulkEditButton.disabled}, opacity: ${openBulkEditButton.style.opacity}`);
    } else {
        console.error('DEBUG: openBulkEditButton is null when trying to update its state!');
    }
}

/**
 * Opens the bulk operations modal.
 * The initialTab parameter is no longer needed as there are no tabs to pre-select.
 */
function openBulkOperationsModal() {
    if (!bulkOperationsModal) {
        console.error('Bulk operations modal not found!');
        return;
    }
    bulkOperationsModal.classList.add('active');
    console.log(`Bulk operations modal opened.`);

    // Reset slider and inputs to default values each time modal is opened
    if (bulkSaturationSlider) bulkSaturationSlider.value = 100;
    if (bulkSaturationValueDisplay) bulkSaturationValueDisplay.textContent = '100%';
    if (bulkNewTextureWidthInput) bulkNewTextureWidthInput.value = 512;
    if (bulkNewTextureHeightInput) bulkNewTextureHeightInput.value = 512;
    if (bulkNewTextureColorInput) bulkNewTextureColorInput.value = '#6c5ce7';

    // New: Reset bulk upload section
    if (bulkUploadImageInput) bulkUploadImageInput.value = ''; // Clear file input
    if (bulkUploadImagePreview) {
        bulkUploadImagePreview.src = '';
        bulkUploadImagePreview.style.display = 'none';
    }
    if (bulkUploadPreviewPlaceholder) bulkUploadPreviewPlaceholder.style.display = 'block';
    uploadedImageBlob = null; // Clear the stored blob
    if (applyBulkUploadTextureButton) applyBulkUploadTextureButton.disabled = true; // Disable apply button
}

/**
 * Applies saturation to all selected image assets.
 */
async function applyBulkSaturation() {
    const selectedCount = selectedAssets.size;
    if (selectedCount === 0) return;
    
    try {
        const result = await window.showBulkEditConfirm?.(selectedCount) || { shouldProceed: true, updateVisually: true };
        
        if (!result.shouldProceed) {
            console.log('Bulk saturation operation cancelled by user');
            return;
        }
        
        const updateVisually = result.updateVisually;
        
        // Show loading overlay for bulk operation
        window.showLoadingOverlay('Applying Saturation...');
        const totalAssets = selectedAssets.size;
        let processedCount = 0;

        const saturationFactor = bulkSaturationSlider.value / 100;
        console.log(`Starting bulk saturation for ${totalAssets} assets with factor: ${saturationFactor}`);

        for (const asset of selectedAssets) {
            if (asset.type.toLowerCase() === 'mp3') {
                continue; // Skip MP3s (should already be filtered by selection logic, but good double check)
            }

            try {
                window.updateConsoleLog(`Processing saturation for: ${asset.filename}`);
                let imageBlob = null;

                // Prioritize previously modified or original image blob
                if (asset.modifiedImageBlob) {
                    imageBlob = asset.modifiedImageBlob;
                    console.log(`Using cached modified blob for ${asset.filename}`);
                } else if (asset.originalImageBlob) {
                    imageBlob = asset.originalImageBlob;
                    console.log(`Using cached original blob for ${asset.filename}`);
                } else {
                    // If no blob is present, fetch the original image
                    console.log(`Fetching original image for ${asset.filename}`);
                    const response = await fetch(asset.mediaPath);
                    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
                    imageBlob = await response.blob();
                    asset.originalImageBlob = imageBlob; // Store original blob for future use
                }

                const img = new Image();
                const imgLoadPromise = new Promise((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = (e) => reject(new Error('Image load error for bulk processing: ' + e.type));
                    img.src = URL.createObjectURL(imageBlob);
                });
                await imgLoadPromise;

                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;

                tempCtx.drawImage(img, 0, 0); // Draw original image to get pixel data

                // Apply saturation directly to pixel data
                const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                const pixels = imageData.data;

                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];

                    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                    pixels[i] = luminance + (r - luminance) * saturationFactor;
                    pixels[i + 1] = luminance + (g - luminance) * saturationFactor;
                    pixels[i + 2] = luminance + (b - luminance) * saturationFactor;

                    pixels[i] = Math.min(255, Math.max(0, pixels[i]));
                    pixels[i + 1] = Math.min(255, Math.max(0, pixels[i + 1]));
                    pixels[i + 2] = Math.min(255, Math.max(0, pixels[i + 2]));
                }
                tempCtx.putImageData(imageData, 0, 0);

                const modifiedBlob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
                asset.modifiedImageBlob = modifiedBlob;
                asset.isModified = true;
                asset.isNew = false;

                window.updateCardVisualState(asset); // Update individual card visual state
                URL.revokeObjectURL(img.src); // Clean up blob URL

                processedCount++;
                window.updateLoadingProgress(processedCount, totalAssets, `Applied saturation to ${asset.filename}`);

            } catch (error) {
                console.error(`Error applying saturation to ${asset.filename}:`, error);
                window.updateConsoleLog(`[ERROR] Saturation failed for: ${asset.filename} - ${error.message}`);
            }
        }

        window.updateConsoleLog('\nBulk saturation complete.');
        window.hideLoadingOverlayWithDelay(3000, 'Bulk Saturation Complete!'); // Show message for 3 seconds
        closeBulkOperationsModal();
        toggleMultiSelectMode(); // Exit multi-select mode after operation
        console.log('Bulk saturation operation finished.');
    } catch (error) {
        console.error('Error during bulk saturation operation:', error);
        window.updateConsoleLog(`[FATAL ERROR] Bulk saturation operation failed: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Saturation Failed!');
    }
}

/**
 * Applies the uploaded image to all selected image assets,
 * converting formats if necessary.
 */
async function applyBulkUploadedTexture() {
    const selectedCount = selectedAssets.size;
    if (selectedCount === 0) {
        console.warn('No assets selected for bulk texture upload. Operation aborted.');
        return;
    }

    if (!uploadedImageBlob) {
        console.warn('No image has been uploaded for bulk texture application.');
        return;
    }
    
    try {
        const result = await window.showBulkEditConfirm?.(selectedCount) || { shouldProceed: true, updateVisually: true };
        
        if (!result.shouldProceed) {
            console.log('Bulk upload texture operation cancelled by user');
            return;
        }
        
        const updateVisually = result.updateVisually;

        // Ensure window.convertImageBlob is available
        if (typeof window.convertImageBlob !== 'function') {
            console.error('Image conversion utility (convertImageBlob) not found. Make sure image-converter.js is loaded.');
            window.updateConsoleLog('[FATAL ERROR] Image conversion utility missing. Cannot proceed with bulk upload.');
            window.hideLoadingOverlayWithDelay(3000, 'Error: Conversion Utility Missing!');
            return;
        }

        window.showLoadingOverlay('Applying Uploaded Texture...');
        const totalAssets = selectedAssets.size;
        let processedCount = 0;

        // Determine if conversion is needed based on selected assets and uploaded image type
        const uploadedMimeType = uploadedImageBlob.type; // e.g., 'image/png' or 'image/jpeg'
        const uploadedExtension = uploadedMimeType.split('/')[1]; // 'png' or 'jpeg'

        const targetMimeTypes = new Set();
        for (const asset of selectedAssets) {
            // Only consider image types for conversion needs
            if (asset.type.toLowerCase() === 'png' || asset.type.toLowerCase() === 'jpg') {
                targetMimeTypes.add(`image/${asset.type.toLowerCase()}`);
            }
        }

        // If targetMimeTypes contains both image/png and image/jpeg, or if any asset's type
        // doesn't match the uploaded type, conversion will be dynamic per asset.
        const needsDynamicConversion = targetMimeTypes.size > 1 || (targetMimeTypes.size === 1 && !targetMimeTypes.has(uploadedMimeType));

        console.log(`Starting bulk apply for ${totalAssets} assets. Dynamic conversion needed: ${needsDynamicConversion}`);
        window.updateConsoleLog(`Uploaded image type: ${uploadedMimeType}`);

        for (const asset of selectedAssets) {
            // Skip MP3s (should already be filtered by selection logic, but good double check)
            if (asset.type.toLowerCase() === 'mp3') {
                continue;
            }

            try {
                window.updateConsoleLog(`Processing: ${asset.filename}`);
                let finalBlob = uploadedImageBlob; // Start with the original uploaded blob

                const assetMimeType = `image/${asset.type.toLowerCase()}`;

                // Perform conversion if:
                // 1. Dynamic conversion is generally needed (mixed types or mismatch)
                // 2. The current asset's required MIME type does not match the uploaded image's MIME type
                if (needsDynamicConversion && assetMimeType !== uploadedMimeType) {
                    window.updateConsoleLog(`Converting ${uploadedExtension.toUpperCase()} to ${asset.type.toUpperCase()} for: ${asset.filename}`);
                    finalBlob = await window.convertImageBlob(uploadedImageBlob, assetMimeType);
                }

                if (finalBlob) {
                    asset.newImageBlob = finalBlob;
                    asset.isNew = true;
                    asset.isModified = false;
                    window.updateCardVisualState(asset); // Update individual card visual state
                    window.updateConsoleLog(`Applied new texture to ${asset.filename}`);
                } else {
                    throw new Error('Image conversion failed.');
                }

                processedCount++;
                window.updateLoadingProgress(processedCount, totalAssets, `Applied to ${asset.filename}`);

            } catch (error) {
                console.error(`Error applying uploaded texture to ${asset.filename}:`, error);
                window.updateConsoleLog(`[ERROR] Application failed for: ${asset.filename} - ${error.message}`);
            }
        }

        window.updateConsoleLog('\nBulk uploaded texture application complete.');
        window.hideLoadingOverlayWithDelay(3000, 'Bulk Upload Complete!');
        closeBulkOperationsModal();
        toggleMultiSelectMode(); // Exit multi-select mode after operation
        console.log('Bulk uploaded texture operation finished.');

        // Reset the upload form
        bulkUploadImageInput.value = '';
        bulkUploadImagePreview.src = '';
        bulkUploadImagePreview.style.display = 'none';
        bulkUploadPreviewPlaceholder.style.display = 'block';
        uploadedImageBlob = null;
        applyBulkUploadTextureButton.disabled = true;
    } catch (error) {
        console.error('Error during bulk uploaded texture operation:', error);
        window.updateConsoleLog(`[FATAL ERROR] Bulk uploaded texture operation failed: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Upload Failed!');
    }
}

/**
 * Creates new identical textures for all selected image assets.
 */
async function saveBulkNewTexture() {
    const selectedCount = selectedAssets.size;
    if (selectedCount === 0) {
        console.warn('No assets selected for bulk new texture creation. Operation aborted.');
        return;
    }
    
    try {
        const result = await window.showBulkEditConfirm?.(selectedCount) || { shouldProceed: true, updateVisually: true };
        
        if (!result.shouldProceed) {
            console.log('Bulk new texture creation cancelled by user');
            return;
        }
        
        const updateVisually = result.updateVisually;

        const newWidth = parseInt(resizeWidthInput.value, 10);
        const newHeight = parseInt(resizeHeightInput.value, 10);
        const maintainAspect = maintainAspectCheckbox.checked;
        
        if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
            alert('Please enter valid width and height values (greater than 0)');
            return;
        }
        
        if (selectedAssets.size === 0) {
            alert('No assets selected for resizing');
            return;
        }
        
        // Show loading overlay
        window.showLoadingOverlay(`Resizing ${selectedAssets.size} assets to ${newWidth}x${newHeight}...`);
        console.log(`Starting bulk resize operation on ${selectedAssets.size} assets to ${newWidth}x${newHeight}`);
        
        try {
            let successCount = 0;
            const totalAssets = selectedAssets.size;
            
            // Process each selected asset
            for (const asset of selectedAssets) {
                try {
                    // Skip non-image assets
                    if (asset.type && asset.type.toLowerCase() === 'mp3') {
                        console.log(`Skipping non-image asset: ${asset.filename}`);
                        continue;
                    }
                    
                    // Update progress
                    const progress = (successCount / totalAssets) * 100;
                    window.updateLoadingProgress(successCount, totalAssets, `Resizing ${asset.filename}...`);
                    
                    // Create a canvas to perform the resize
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set canvas dimensions to new size
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    
                    // Draw the image to the canvas with the new dimensions
                    const img = new Image();
                    
                    // Create a promise to handle the image loading
                    await new Promise((resolve, reject) => {
                        img.onload = async () => {
                            try {
                                // Draw the image with the new dimensions
                                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                                
                                // Convert the canvas back to a blob
                                canvas.toBlob((blob) => {
                                    if (!blob) {
                                        reject(new Error('Failed to create blob from canvas'));
                                        return;
                                    }
                                    
                                    // Update the asset's blob and dimensions
                                    asset.blob = blob;
                                    asset.width = newWidth;
                                    asset.height = newHeight;
                                    
                                    // Update the asset's preview
                                    if (asset.previewUrl) {
                                        URL.revokeObjectURL(asset.previewUrl);
                                    }
                                    asset.previewUrl = URL.createObjectURL(blob);
                                    
                                    // Update the card's thumbnail
                                    if (window.updateAssetCardThumbnail) {
                                        window.updateAssetCardThumbnail(asset);
                                    }
                                    
                                    successCount++;
                                    resolve();
                                }, 'image/png');
                            } catch (error) {
                                reject(error);
                            }
                        };
                        
                        img.onerror = () => {
                            reject(new Error('Failed to load image for resizing'));
                        };
                        
                        // Set the image source to the asset's blob URL
                        img.src = asset.previewUrl || URL.createObjectURL(asset.blob);
                    });
                    
                    console.log(`Successfully resized ${asset.filename} to ${newWidth}x${newHeight}`);
                    
                } catch (error) {
                    console.error(`Error resizing ${asset.filename}:`, error);
                    window.updateConsoleLog(`[ERROR] Failed to resize ${asset.filename}: ${error.message}`);
                }
            }
            
            // Show completion message
            const message = `Successfully resized ${successCount} of ${totalAssets} assets to ${newWidth}x${newHeight}`;
            console.log(message);
            window.updateConsoleLog(`\n${message}`);
            
            // Close the modal and reset the UI
            closeBulkOperationsModal();
            window.hideLoadingOverlayWithDelay(3000, 'Resize Complete!');
            
            // Exit multi-select mode after operation
            toggleMultiSelectMode();
            
        } catch (error) {
            console.error('Error during bulk resize operation:', error);
            window.updateConsoleLog(`[FATAL ERROR] Bulk resize operation failed: ${error.message}`);
            window.hideLoadingOverlayWithDelay(3000, 'Resize Failed!');
        }
    } catch (error) {
        console.error('Error during bulk new texture creation:', error);
        window.updateConsoleLog(`[FATAL ERROR] Bulk new texture creation failed: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Creation Failed!');
    }
}

/**
 * Applies resizing to all selected image assets.
 */
async function applyBulkResize() {
    const selectedCount = selectedAssets.size;
    if (selectedCount === 0) {
        console.warn('No assets selected for bulk resize. Operation aborted.');
        return;
    }

    // Get input values
    const newWidth = parseInt(resizeWidthInput.value, 10);
    const newHeight = parseInt(resizeHeightInput.value, 10);
    const maintainAspect = maintainAspectCheckbox.checked;
    
    if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
        alert('Please enter valid width and height values (greater than 0)');
        return;
    }
    
    try {
        const result = await window.showBulkEditConfirm?.(selectedCount) || { shouldProceed: true, updateVisually: true };
        
        if (!result.shouldProceed) {
            console.log('Bulk resize operation cancelled by user');
            return;
        }
        
        const updateVisually = result.updateVisually;
        
        if (selectedAssets.size === 0) {
            alert('No assets selected for resizing');
            return;
        }
        
        // Show loading overlay
        window.showLoadingOverlay(`Resizing ${selectedAssets.size} assets to ${newWidth}x${newHeight}...`);
        console.log(`Starting bulk resize operation on ${selectedAssets.size} assets to ${newWidth}x${newHeight}`);
        
        let successCount = 0;
        const totalAssets = selectedAssets.size;
        
        // Process each selected asset
        for (const asset of selectedAssets) {
            try {
                // Skip non-image assets
                if (asset.type && asset.type.toLowerCase() === 'mp3') {
                    console.log(`Skipping non-image asset: ${asset.filename}`);
                    continue;
                }
                
                // Update progress
                const progress = (successCount / totalAssets) * 100;
                window.updateLoadingProgress(successCount, totalAssets, `Resizing ${asset.filename}...`);
                
                // Create a canvas to perform the resize
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas dimensions to new size
                canvas.width = newWidth;
                canvas.height = newHeight;
                
                // Draw the image to the canvas with the new dimensions
                const img = new Image();
                
                // Create a promise to handle the image loading
                await new Promise((resolve, reject) => {
                    img.onload = async () => {
                        try {
                            // Draw the image with the new dimensions
                            ctx.drawImage(img, 0, 0, newWidth, newHeight);
                            
                            // Convert the canvas back to a blob
                            canvas.toBlob((blob) => {
                                if (!blob) {
                                    reject(new Error('Failed to create blob from canvas'));
                                    return;
                                }
                                
                                // Update the asset's blob and dimensions
                                asset.blob = blob;
                                asset.width = newWidth;
                                asset.height = newHeight;
                                
                                // Update the asset's preview
                                if (asset.previewUrl) {
                                    URL.revokeObjectURL(asset.previewUrl);
                                }
                                asset.previewUrl = URL.createObjectURL(blob);
                                
                                // Update the card's thumbnail
                                if (window.updateAssetCardThumbnail) {
                                    window.updateAssetCardThumbnail(asset);
                                }
                                
                                successCount++;
                                resolve();
                            }, 'image/png');
                        } catch (error) {
                            reject(error);
                        }
                    };
                    
                    img.onerror = () => {
                        reject(new Error('Failed to load image for resizing'));
                    };
                    
                    // Set the image source to the asset's blob URL
                    img.src = asset.previewUrl || URL.createObjectURL(asset.blob);
                });
                
                console.log(`Successfully resized ${asset.filename} to ${newWidth}x${newHeight}`);
                
            } catch (error) {
                console.error(`Error resizing ${asset.filename}:`, error);
                window.updateConsoleLog(`[ERROR] Failed to resize ${asset.filename}: ${error.message}`);
            }
        }
        
        // Show completion message
        const message = `Successfully resized ${successCount} of ${totalAssets} assets to ${newWidth}x${newHeight}`;
        console.log(message);
        window.updateConsoleLog(`\n${message}`);
        
        // Close the modal and reset the UI
        closeBulkOperationsModal();
        window.hideLoadingOverlayWithDelay(3000, 'Resize Complete!');
        
        // Exit multi-select mode after operation
        toggleMultiSelectMode();
        
    } catch (error) {
        console.error('Error during bulk resize operation:', error);
        window.updateConsoleLog(`[FATAL ERROR] Bulk resize operation failed: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Resize Failed!');
    }
}