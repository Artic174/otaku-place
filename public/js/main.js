// Main JavaScript untuk AnimeHub

// Global variables
let isLoading = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize application
function initializeApp() {
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize lazy loading
    initializeLazyLoading();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize watchlist functionality
    initializeWatchlist();
    
    // Initialize comment system
    initializeComments();
    
    // Initialize animations
    initializeAnimations();
}

// Initialize Bootstrap tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize lazy loading for images
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize search functionality
function initializeSearch() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    if (searchForm && searchInput) {
        // Auto-submit on Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
        
        // Search button click
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }
}

// Perform search
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
        showAlert('Masukkan minimal 2 karakter untuk pencarian', 'warning');
        return;
    }
    
    // Redirect to search page with query
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
}

// Initialize watchlist functionality
function initializeWatchlist() {
    // Add to watchlist buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-watchlist')) {
            e.preventDefault();
            const animeId = e.target.dataset.animeId;
            const animeTitle = e.target.dataset.animeTitle;
            const animeImage = e.target.dataset.animeImage;
            
            addToWatchlist(animeId, animeTitle, animeImage, e.target);
        }
        
        if (e.target.classList.contains('remove-from-watchlist')) {
            e.preventDefault();
            const animeId = e.target.dataset.animeId;
            removeFromWatchlist(animeId, e.target);
        }
    });
}

// Add anime to watchlist
async function addToWatchlist(animeId, animeTitle, animeImage, button) {
    if (isLoading) return;
    
    isLoading = true;
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading"></span> Menambahkan...';
    button.disabled = true;
    
    try {
        const response = await fetch('/api/watchlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                anime_id: animeId,
                anime_title: animeTitle,
                anime_image: animeImage
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Anime berhasil ditambahkan ke watchlist!', 'success');
            button.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i>Di Watchlist';
            button.classList.remove('btn-outline-primary', 'add-to-watchlist');
            button.classList.add('btn-success', 'remove-from-watchlist');
            button.dataset.animeId = animeId;
        } else {
            showAlert(result.error || 'Gagal menambahkan ke watchlist', 'danger');
            button.innerHTML = originalText;
            button.disabled = false;
        }
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        showAlert('Terjadi kesalahan sistem', 'danger');
        button.innerHTML = originalText;
        button.disabled = false;
    }
    
    isLoading = false;
}

// Remove anime from watchlist
async function removeFromWatchlist(animeId, button) {
    if (isLoading) return;
    
    isLoading = true;
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading"></span> Menghapus...';
    button.disabled = true;
    
    try {
        const response = await fetch(`/api/watchlist/${animeId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Anime berhasil dihapus dari watchlist!', 'success');
            
            // If on watchlist page, remove the card
            if (window.location.pathname === '/watchlist') {
                const card = button.closest('.anime-card, .card');
                if (card) {
                    card.remove();
                }
            } else {
                // Change button back to add
                button.innerHTML = '<i class="bi bi-bookmark-plus me-1"></i>Tambah ke Watchlist';
                button.classList.remove('btn-success', 'remove-from-watchlist');
                button.classList.add('btn-outline-primary', 'add-to-watchlist');
            }
        } else {
            showAlert(result.error || 'Gagal menghapus dari watchlist', 'danger');
            button.innerHTML = originalText;
            button.disabled = false;
        }
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        showAlert('Terjadi kesalahan sistem', 'danger');
        button.innerHTML = originalText;
        button.disabled = false;
    }
    
    isLoading = false;
}

// Initialize comment system
function initializeComments() {
    const commentForm = document.getElementById('commentForm');
    
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitComment();
        });
    }
    
    // Load more comments button
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('load-more-comments')) {
            e.preventDefault();
            loadMoreComments();
        }
    });
}

// Submit comment
async function submitComment() {
    if (isLoading) return;
    
    const form = document.getElementById('commentForm');
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validation
    const username = formData.get('username').trim();
    const comment = formData.get('comment').trim();
    
    if (!username || !comment) {
        showAlert('Nama dan komentar harus diisi', 'warning');
        return;
    }
    
    if (comment.length > 1000) {
        showAlert('Komentar terlalu panjang (maksimal 1000 karakter)', 'warning');
        return;
    }
    
    isLoading = true;
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="loading"></span> Mengirim...';
    submitButton.disabled = true;
    
    try {
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                anime_id: formData.get('anime_id'),
                username: username,
                comment: comment
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Komentar berhasil ditambahkan!', 'success');
            form.reset();
            
            // Reload comments section
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showAlert(result.error || 'Gagal menambahkan komentar', 'danger');
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        showAlert('Terjadi kesalahan sistem', 'danger');
    }
    
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
    isLoading = false;
}

// Initialize animations
function initializeAnimations() {
    // Fade in animation for cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe anime cards
    document.querySelectorAll('.anime-card, .card').forEach(card => {
        observer.observe(card);
    });
}

// Utility function to show alerts
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-floating');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show alert-floating`;
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Utility function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Export functions for use in other scripts
window.AnimeHub = {
    showAlert,
    formatDate,
    truncateText,
    addToWatchlist,
    removeFromWatchlist
};

