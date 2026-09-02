import Swal from 'sweetalert2';

export const useSwal = () => {
  function toast(title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') {
    if (!process.client) return;
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'swal2-toast-custom'
      }
    });
  }

  async function confirm(title: string, text: string, confirmButtonText = 'Ya, Lanjutkan', cancelButtonText = 'Batal'): Promise<boolean> {
    if (!process.client) return false;
    const res = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#64748B',
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      reverseButtons: true,
      customClass: {
        popup: 'swal2-modal-custom'
      }
    });
    return res.isConfirmed;
  }

  async function prompt(title: string, text: string, inputPlaceholder = '', defaultValue = '', icon: 'question' | 'info' | 'warning' = 'question'): Promise<string | null> {
    if (!process.client) return null;
    const res = await Swal.fire({
      title: title,
      text: text,
      input: 'text',
      inputValue: defaultValue,
      inputPlaceholder: inputPlaceholder,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: '#00AED6',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Kirim',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      customClass: {
        popup: 'swal2-modal-custom'
      }
    });
    if (res.isConfirmed && res.value !== undefined) {
      return String(res.value);
    }
    return null;
  }

  function success(title: string, text = '') {
    if (!process.client) return;
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonColor: '#00AED6',
      customClass: {
        popup: 'swal2-modal-custom'
      }
    });
  }

  function error(title: string, text = '') {
    if (!process.client) return;
    Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonColor: '#DC2626',
      customClass: {
        popup: 'swal2-modal-custom'
      }
    });
  }

  function info(title: string, text = '') {
    if (!process.client) return;
    Swal.fire({
      title: title,
      text: text,
      icon: 'info',
      confirmButtonColor: '#00AED6',
      customClass: {
        popup: 'swal2-modal-custom'
      }
    });
  }

  function warning(title: string, text = '') {
    if (!process.client) return;
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      confirmButtonColor: '#D97706',
      customClass: {
        popup: 'swal2-modal-custom'
      }
    });
  }

  function showLoading(title = 'Sedang Memproses Data...', text = 'Mohon tunggu sebentar...') {
    if (!process.client) return;
    Swal.fire({
      title: title,
      text: text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'swal2-modal-custom'
      }
    });
  }

  function hideLoading() {
    if (!process.client) return;
    if (Swal.isVisible()) {
      Swal.close();
    }
  }

  return {
    toast,
    confirm,
    prompt,
    success,
    error,
    info,
    warning,
    showLoading,
    hideLoading
  };
};
