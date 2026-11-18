import Swal from 'sweetalert2';

export const cafeAlert = Swal.mixin({
  background: '#FAF8F5',
  color: '#1E110A',
  confirmButtonColor: '#7B3F00',
  cancelButtonColor: '#8C7D73',
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar',
});