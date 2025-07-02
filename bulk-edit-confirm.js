/**
 * Bulk Edit Confirmation Dialog
 * Handles the confirmation dialog for bulk edit operations
 */

let resolvePromise;
let rejectPromise;
let isDialogOpen = false;

/**
 * Shows the bulk edit confirmation dialog
 * @param {number} itemCount - Number of items being edited
 * @returns {Promise<{shouldProceed: boolean, updateVisually: boolean}>}
 */
function showBulkEditConfirm(itemCount) {
    if (isDialogOpen) {
        return Promise.reject(new Error('Dialog already open'));
    }
    
    isDialogOpen = true;
    
    // Only show dialog if more than 20 items
    if (itemCount <= 20) {
        return Promise.resolve({ shouldProceed: true, updateVisually: true });
    }
    
    const dialog = document.getElementById('bulk-edit-confirm');
    const updateCheckbox = document.getElementById('update-cards-visually');
    
    // Default to not updating visually for large selections
    updateCheckbox.checked = false;
    
    // Show the dialog
    dialog.style.display = 'flex';
    
    return new Promise((resolve, reject) => {
        resolvePromise = (result) => {
            dialog.style.display = 'none';
            isDialogOpen = false;
            resolve(result);
        };
        
        rejectPromise = (error) => {
            dialog.style.display = 'none';
            isDialogOpen = false;
            reject(error);
        };
    });
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('bulk-edit-confirm');
    const confirmBtn = document.getElementById('confirm-bulk-edit');
    const cancelBtn = document.getElementById('cancel-bulk-edit');
    const updateCheckbox = document.getElementById('update-cards-visually');
    
    if (!dialog || !confirmBtn || !cancelBtn || !updateCheckbox) {
        console.error('Required elements for bulk edit confirmation not found');
        return;
    }
    
    // Handle confirm button click
    confirmBtn.addEventListener('click', () => {
        if (resolvePromise) {
            resolvePromise({
                shouldProceed: true,
                updateVisually: updateCheckbox.checked
            });
        }
    });
    
    // Handle cancel button click
    cancelBtn.addEventListener('click', () => {
        if (rejectPromise) {
            rejectPromise(new Error('User cancelled the operation'));
        }
    });
    
    // Handle Escape key to close the dialog
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isDialogOpen) {
            if (rejectPromise) {
                rejectPromise(new Error('User cancelled the operation'));
            }
        }
    });
    
    // Handle clicking outside the dialog to close it
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog && rejectPromise) {
            rejectPromise(new Error('User cancelled the operation'));
        }
    });
});

// Export the show function
window.showBulkEditConfirm = showBulkEditConfirm;
