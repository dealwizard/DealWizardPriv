import LoggerFactory from '../tools/logger.js';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/TOAST');
logger.info('Toast.js loaded');

class Toast {
  static activeToasts = [];

  constructor(message, styleClass = '') {
    this.message = message;
    this.styleClass = styleClass;
    this.popup = null;
  }

  static removeAll() {
    Toast.activeToasts.forEach(toast => {
      if (toast.popup) {
        toast.popup.style.opacity = "0";
        setTimeout(() => toast.popup.remove(), 300);
      }
    });
    Toast.activeToasts = [];
  }

  show() {
    // If this is a "Deal ready!" toast, remove all existing toasts first
    if (this.message === "Deal ready!") {
      Toast.removeAll();
    }

    this.popup = document.createElement("div");
    this.popup.textContent = this.message;
    this.popup.classList.add("toast");
    if (this.styleClass) {
      this.popup.classList.add(this.styleClass);
    }

    document.body.appendChild(this.popup);
    Toast.activeToasts.push(this);

    // Fade in
    requestAnimationFrame(() => {
      this.popup.style.opacity = "1";
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.popup.style.opacity = "0";
      setTimeout(() => {
        this.popup.remove();
        const index = Toast.activeToasts.indexOf(this);
        if (index > -1) {
          Toast.activeToasts.splice(index, 1);
        }
      }, 500);
    }, 5000);
  }
}

export { Toast as default }; 