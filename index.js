// Remove the import line and use regular script
const { createClient } = supabase;

// Supabase credentials
const SUPABASE_URL = "https://webdmcvcbfeytwhzonem.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYmRtY3ZjYmZleXR3aHpvbmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMDc5ODYsImV4cCI6MjA3Nzg4Mzk4Nn0.QlZeRqYvbdqNfRKrq_MIB0VBSM4ZcyeVtD_9O9uFAI8";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Global state for loading and form management
let isSubmitting = false;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 DOM loaded - initializing form");
    initializeForm();
});

function initializeForm() {
    // Elements
    const clientDropdown = document.getElementById("clientDropdown");
    const subClientDropdown = document.getElementById("subClientDropdown");
    const categoryDropdown = document.getElementById("categoryDropdown");
    const documentDropdown = document.getElementById("documentDropdown");
    const notesInput = document.getElementById("notes");
    const dateInput = document.getElementById("date");
    const saveButton = document.getElementById("saveButton");
    const form = document.getElementById("requestForm");

    console.log("🔧 DOM elements found:", {
        clientDropdown: !!clientDropdown,
        subClientDropdown: !!subClientDropdown,
        categoryDropdown: !!categoryDropdown,
        documentDropdown: !!documentDropdown,
        form: !!form
    });

    // Load initial data
    loadClients();
    loadCategories();
    setDefaultDate();

    // Event Listeners
    clientDropdown.addEventListener("change", function() {
        console.log("🎯 Client dropdown changed, value:", this.value);
        const selectedClient = this.value;
        subClientDropdown.innerHTML = '<option value="">-- Select Sub-Client --</option>';
        subClientDropdown.disabled = true;
        
        if (selectedClient) {
            showLoading(subClientDropdown, "Loading sub-clients...");
            loadSubClients(selectedClient);
        } else {
            subClientDropdown.disabled = false;
        }
    });

    categoryDropdown.addEventListener("change", function() {
        console.log("🎯 Category dropdown changed, value:", this.value);
        const selectedCategory = this.value;
        documentDropdown.innerHTML = '<option value="">-- Select Document Type --</option>';
        documentDropdown.disabled = true;
        
        if (selectedCategory) {
            showLoading(documentDropdown, "Loading documents...");
            loadDocuments(selectedCategory);
        } else {
            documentDropdown.disabled = false;
        }
    });

    // Enhanced form submission
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            saveTask();
        });
    }

    // Real-time validation
    addRealTimeValidation();
}

// Enhanced loading functions with better UX
async function loadClients() {
    console.log("🔧 loadClients called");
    const clientDropdown = document.getElementById("clientDropdown");
    
    showLoading(clientDropdown, "Loading clients...");
    
    try {
        const { data, error } = await supabaseClient.from("sub_client").select("clientList");
        
        if (error) {
            console.error("Supabase error:", error);
            showError(clientDropdown, "Failed to load clients");
            return;
        }

        clientDropdown.innerHTML = '<option value="">-- Select Client --</option>';
        const uniqueClients = [...new Set(data.map((item) => item.clientList))];
        console.log("👥 Unique clients:", uniqueClients);

        uniqueClients.forEach((client) => {
            const option = document.createElement("option");
            option.value = client;
            option.textContent = client;
            clientDropdown.appendChild(option);
        });

        clientDropdown.disabled = false;
        console.log("✅ Clients loaded into dropdown");

    } catch (error) {
        console.error("Unexpected error:", error);
        showError(clientDropdown, "Unexpected error loading clients");
    }
}

async function loadSubClients(selectedClient) {
    console.log("🔧 loadSubClients called with:", selectedClient);
    const subClientDropdown = document.getElementById("subClientDropdown");
    
    try {
        const { data, error } = await supabaseClient
            .from("sub_client")
            .select("subClientList")
            .eq("clientList", selectedClient);
            
        if (error) {
            console.error("Supabase error:", error);
            showError(subClientDropdown, "Failed to load sub-clients");
            return;
        }

        subClientDropdown.innerHTML = '<option value="">-- Select Sub-Client --</option>';
        
        if (data && data.length > 0) {
            data.forEach((row) => {
                const option = document.createElement("option");
                option.value = row.subClientList;
                option.textContent = row.subClientList;
                subClientDropdown.appendChild(option);
            });
            console.log("✅ Sub-clients loaded");
        } else {
            subClientDropdown.innerHTML = '<option value="">-- No sub-clients available --</option>';
            console.log("ℹ️ No sub-clients found for this client");
        }
        
        subClientDropdown.disabled = false;
        
    } catch (error) {
        console.error("Unexpected error:", error);
        showError(subClientDropdown, "Unexpected error loading sub-clients");
    }
}

async function loadCategories() {
    console.log("🔧 loadCategories called");
    const categoryDropdown = document.getElementById("categoryDropdown");
    
    showLoading(categoryDropdown, "Loading categories...");
    
    try {
        const { data, error } = await supabaseClient.from("category").select("categoryList");
        
        if (error) {
            console.error("Supabase error:", error);
            showError(categoryDropdown, "Failed to load categories");
            return;
        }

        categoryDropdown.innerHTML = '<option value="">-- Select Category --</option>';
        const uniqueCategories = [...new Set(data.map((item) => item.categoryList))];
        console.log("📁 Unique categories:", uniqueCategories);

        uniqueCategories.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            categoryDropdown.appendChild(option);
        });

        categoryDropdown.disabled = false;
        console.log("✅ Categories loaded into dropdown");

    } catch (error) {
        console.error("Unexpected error:", error);
        showError(categoryDropdown, "Unexpected error loading categories");
    }
}

async function loadDocuments(selectedCategory) {
    console.log("🔧 loadDocuments called with:", selectedCategory);
    const documentDropdown = document.getElementById("documentDropdown");
    
    try {
        const { data, error } = await supabaseClient
            .from("category")
            .select("documents")
            .eq("categoryList", selectedCategory);
            
        if (error) {
            console.error("Supabase error:", error);
            showError(documentDropdown, "Failed to load documents");
            return;
        }

        documentDropdown.innerHTML = '<option value="">-- Select Document Type --</option>';

        if (data && data.length > 0) {
            data.forEach((row) => {
                if (row.documents) {
                    const option = document.createElement("option");
                    option.value = row.documents;
                    option.textContent = row.documents;
                    documentDropdown.appendChild(option);
                }
            });
            console.log("✅ Documents loaded");
        } else {
            documentDropdown.innerHTML = '<option value="">-- No documents available --</option>';
            console.log("ℹ️ No documents found for this category");
        }
        
        documentDropdown.disabled = false;
        
    } catch (error) {
        console.error("Unexpected error:", error);
        showError(documentDropdown, "Unexpected error loading documents");
    }
}

// Enhanced save function with better UX
async function saveTask() {
    if (isSubmitting) {
        console.log("⏳ Save already in progress...");
        return;
    }

    const saveButton = document.getElementById("saveButton");
    const originalButtonText = saveButton.innerHTML;
    
    const clientDropdown = document.getElementById("clientDropdown");
    const subClientDropdown = document.getElementById("subClientDropdown");
    const categoryDropdown = document.getElementById("categoryDropdown");
    const documentDropdown = document.getElementById("documentDropdown");
    const notesInput = document.getElementById("notes");
    const dateInput = document.getElementById("date");

    const client = clientDropdown.value;
    const subClient = subClientDropdown.value;
    const category = categoryDropdown.value;
    const documentType = documentDropdown.value;
    const notes = notesInput.value;
    const date = dateInput.value;

    // Enhanced validation
    if (!client || !category || !documentType || !date) {
        showNotification("Please fill in all required fields before saving.", "error");
        highlightEmptyFields([clientDropdown, categoryDropdown, documentDropdown, dateInput]);
        return;
    }

    const taskData = {
        client,
        subClient: subClient || null,
        category,
        documentType,
        notes: notes || null,
        date,
        status: 'pending', // Default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    console.log("💾 Saving data:", taskData);

    // Show loading state
    isSubmitting = true;
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
    saveButton.classList.add('opacity-50');

    try {
        const { data, error } = await supabaseClient.from("tasks_database").insert([taskData]);

        if (error) {
            console.error("Save error:", error);
            throw error;
        }

        console.log("✅ Task saved successfully:", data);
        showNotification("Task saved successfully!", "success");
        resetForm();
        
        // Optional: Redirect to monitoring page after successful save
        setTimeout(() => {
            window.location.href = "monitoring.html";
        }, 1500);

    } catch (error) {
        console.error("Save error:", error);
        showNotification("Error saving task: " + error.message, "error");
    } finally {
        // Reset button state
        isSubmitting = false;
        saveButton.disabled = false;
        saveButton.innerHTML = originalButtonText;
        saveButton.classList.remove('opacity-50');
    }
}

// Enhanced reset function
function resetForm() {
    const clientDropdown = document.getElementById("clientDropdown");
    const subClientDropdown = document.getElementById("subClientDropdown");
    const categoryDropdown = document.getElementById("categoryDropdown");
    const documentDropdown = document.getElementById("documentDropdown");
    const notesInput = document.getElementById("notes");
    const dateInput = document.getElementById("date");

    clientDropdown.value = '';
    subClientDropdown.innerHTML = '<option value="">-- Select Sub-Client --</option>';
    subClientDropdown.disabled = true;
    categoryDropdown.value = '';
    documentDropdown.innerHTML = '<option value="">-- Select Document Type --</option>';
    documentDropdown.disabled = true;
    notesInput.value = '';
    setDefaultDate();

    // Remove any validation highlights
    removeValidationHighlights();
    
    console.log("🔄 Form reset successfully");
}

function setDefaultDate() {
    const dateInput = document.getElementById("date");
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    dateInput.value = formattedDate;
}

// UI Helper Functions
function showLoading(element, message = "Loading...") {
    element.innerHTML = `<option value="" disabled>${message}</option>`;
    element.disabled = true;
}

function showError(element, message) {
    element.innerHTML = `<option value="">${message}</option>`;
    element.disabled = false;
}

function showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `custom-notification fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg border-l-4 transform transition-all duration-300 ${
        type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-400' 
            : type === 'error'
            ? 'bg-red-50 text-red-800 border-red-400'
            : 'bg-blue-50 text-blue-800 border-blue-400'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle'
            } mr-3"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.add('translate-x-0', 'opacity-100');
    }, 10);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('translate-x-0', 'opacity-100');
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function highlightEmptyFields(fields) {
    fields.forEach(field => {
        if (!field.value) {
            field.classList.add('border-red-500', 'ring-2', 'ring-red-200');
            field.addEventListener('input', function clearHighlight() {
                field.classList.remove('border-red-500', 'ring-2', 'ring-red-200');
                field.removeEventListener('input', clearHighlight);
            });
        }
    });
}

function removeValidationHighlights() {
    const highlightedFields = document.querySelectorAll('.border-red-500');
    highlightedFields.forEach(field => {
        field.classList.remove('border-red-500', 'ring-2', 'ring-red-200');
    });
}

function addRealTimeValidation() {
    const requiredFields = [
        'clientDropdown',
        'categoryDropdown', 
        'documentDropdown',
        'date'
    ];

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', validateForm);
        }
    });
}

function validateForm() {
    const saveButton = document.getElementById('saveButton');
    const client = document.getElementById('clientDropdown').value;
    const category = document.getElementById('categoryDropdown').value;
    const documentType = document.getElementById('documentDropdown').value;
    const date = document.getElementById('date').value;

    const isValid = client && category && documentType && date;
    
    if (saveButton) {
        saveButton.disabled = !isValid;
        saveButton.classList.toggle('opacity-50', !isValid);
        saveButton.classList.toggle('cursor-not-allowed', !isValid);
    }
}

// Initialize form validation on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(validateForm, 100);
});