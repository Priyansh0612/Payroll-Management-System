class Toast {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = this.getIcon(type);

        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icon}</span>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        `;

        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.remove(toast);
        });

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }
    }

    remove(toast) {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            if (toast.parentElement) {
                toast.remove();
            }
        });
    }

    getIcon(type) {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'info': return 'ℹ';
            default: return '';
        }
    }
}

// Initialize global instance
window.toast = new Toast();
