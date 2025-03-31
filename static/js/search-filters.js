document.addEventListener('DOMContentLoaded', function() {
    // Filter options click handler
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', function() {
            const field = this.dataset.field;
            const value = this.dataset.value;
            
            if (field) {
                // For options with a specific field (like in_stock, featured)
                const input = document.getElementById(`${field}-input`);
                if (input) {
                    if (this.classList.contains('active')) {
                        // If already active, deactivate
                        this.classList.remove('active');
                        input.value = '';
                    } else {
                        // Activate this option
                        this.classList.add('active');
                        input.value = value;
                    }
                }
            } else {
                // For category options
                const categoryInput = document.getElementById('category-input');
                const value = this.dataset.value;
                
                // Remove active class from all category options
                document.querySelectorAll('.filter-option:not([data-field])').forEach(opt => {
                    opt.classList.remove('active');
                });
                
                if (categoryInput.value === value) {
                    // If clicking on already selected category, deselect it
                    categoryInput.value = '';
                } else {
                    // Select this category
                    this.classList.add('active');
                    categoryInput.value = value;
                }
            }
        });
    });
    
    // Sort dropdown change handler
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortInput = document.getElementById('sort-input');
            if (sortInput) {
                sortInput.value = this.value;
                // Submit the form
                document.getElementById('filter-form').submit();
            }
        });
    }
    
    // Popular search suggestion click handler
    const searchSuggestions = document.querySelectorAll('.search-suggestion');
    searchSuggestions.forEach(suggestion => {
        suggestion.addEventListener('click', function() {
            const text = this.textContent.trim().replace(/^\S+\s+/, ''); // Remove the icon text
            const searchInput = document.querySelector('input[name="q"]');
            if (searchInput) {
                searchInput.value = text;
                searchInput.closest('form').submit();
            }
        });
    });
});