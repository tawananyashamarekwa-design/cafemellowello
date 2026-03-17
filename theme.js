// theme.js - Theme switching logic for Cafe Mello Wello

const themeToggle = {
    init() {
        this.html = document.documentElement;
        this.toggleBtn = document.getElementById('theme-toggle');

        // Apply saved theme immediately
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(savedTheme, false); // false = no transition on initial load

        // Setup listener
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
    },

    applyTheme(theme, animate = true) {
        this.html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateIcon(theme);

        if (!animate) {
            // Temporarily disable transitions to prevent flash
            this.html.classList.add('no-transition');
            setTimeout(() => {
                this.html.classList.remove('no-transition');
            }, 100);
        }
    },

    toggle() {
        const currentTheme = this.html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    },

    updateIcon(theme) {
        if (!this.toggleBtn) return;
        const icon = this.toggleBtn.querySelector('i');
        if (icon && window.lucide) {
            const iconName = theme === 'dark' ? 'sun' : 'moon';
            icon.setAttribute('data-lucide', iconName);
            lucide.createIcons();
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    themeToggle.init();
});

// Immediate hit to prevent flash
(function () {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();
