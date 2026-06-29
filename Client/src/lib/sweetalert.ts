import Swal from 'sweetalert2'

const baseStyle = {
  fontFamily: 'inherit',
  borderRadius: '16px',
  padding: '0',
}

export const SwalToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: 'swal-toast-popup',
    title: 'swal-toast-title',
    timerProgressBar: 'swal-timer-bar',
  },
})

const style = document.createElement('style')
style.textContent = `
  .swal-toast-popup {
    border-radius: 16px !important;
    padding: 16px 20px !important;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.08) !important;
    backdrop-filter: blur(20px) !important;
  }
  .swal-toast-title {
    font-size: 14px !important;
    font-weight: 600 !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .swal-timer-bar {
    background: linear-gradient(90deg, #49b8a7, #fc8a80) !important;
    height: 3px !important;
  }
  .swal-confirm-popup {
    border-radius: 24px !important;
    padding: 32px !important;
    box-shadow: 0 30px 80px rgba(0,0,0,0.2) !important;
  }
  .swal-confirm-title {
    font-size: 20px !important;
    font-weight: 700 !important;
    color: #1f2937 !important;
    margin-top: 8px !important;
  }
  .swal-confirm-text {
    font-size: 14px !important;
    color: #6b7280 !important;
    margin-top: 4px !important;
  }
  .swal-confirm-confirm-btn {
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    padding: 10px 28px !important;
    transition: all 0.3s ease !important;
  }
  .swal-confirm-cancel-btn {
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    padding: 10px 28px !important;
    border: 2px solid #e5e7eb !important;
    color: #6b7280 !important;
    background: white !important;
    transition: all 0.3s ease !important;
  }
  .swal-confirm-cancel-btn:hover {
    border-color: #d1d5db !important;
    background: #f9fafb !important;
  }
  .swal-delete-btn {
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    padding: 10px 28px !important;
    background: #ef4444 !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 14px rgba(239,68,68,0.3) !important;
  }
  .swal-delete-btn:hover {
    background: #dc2626 !important;
    box-shadow: 0 6px 20px rgba(239,68,68,0.4) !important;
  }
  .swal-icon-success {
    color: #49b8a7 !important;
  }
  .swal-icon-error {
    color: #fc8a80 !important;
  }
  .swal-icon-warning {
    color: #f8e694 !important;
  }
  .swal-icon-info {
    color: #49b8a7 !important;
  }
  .swal-loading-popup {
    border-radius: 24px !important;
    padding: 40px !important;
    box-shadow: 0 30px 80px rgba(0,0,0,0.15) !important;
  }
  .swal-loading-text {
    font-size: 15px !important;
    font-weight: 500 !important;
    color: #6b7280 !important;
    margin-top: 4px !important;
  }
`
document.head.appendChild(style)

export function showToast(icon: 'success' | 'error' | 'info' | 'warning', title: string) {
  const colors: Record<string, string> = {
    success: '#49b8a7',
    error: '#fc8a80',
    info: '#49b8a7',
    warning: '#f8e694',
  }
  return SwalToast.fire({
    icon,
    title,
    color: colors[icon],
    iconColor: colors[icon],
    background: '#ffffff',
  })
}

export function showConfirm(options: {
  title: string
  text?: string
  icon?: 'warning' | 'question' | 'error'
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  reverseButtons?: boolean
}) {
  return Swal.fire({
    title: options.title,
    text: options.text || '',
    icon: options.icon || 'warning',
    iconColor: options.icon === 'error' ? '#fc8a80' : '#f8e694',
    showCancelButton: true,
    confirmButtonText: options.confirmText || 'Sí, eliminar',
    cancelButtonText: options.cancelText || 'Cancelar',
    confirmButtonColor: options.confirmColor || '#ef4444',
    cancelButtonColor: 'transparent',
    reverseButtons: options.reverseButtons !== false,
    customClass: {
      popup: 'swal-confirm-popup',
      title: 'swal-confirm-title',
      htmlContainer: 'swal-confirm-text',
      confirmButton: options.confirmColor === '#ef4444' ? 'swal-delete-btn' : 'swal-confirm-confirm-btn',
      cancelButton: 'swal-confirm-cancel-btn',
    },
    buttonsStyling: true,
  })
}

export function showLoading(title: string) {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
    customClass: {
      popup: 'swal-loading-popup',
      title: 'swal-loading-text',
    },
  })
}
