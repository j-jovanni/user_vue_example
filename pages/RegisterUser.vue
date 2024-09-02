<template>
  <div class="container mt-5">
    <form @submit.prevent="submitForm">
      <div class="mb-3">
        <label for="name" class="form-label">Nombre</label>
        <input 
          type="text" 
          class="form-control" 
          id="name" 
          v-model="user.name" 
          required 
        />
        <div v-if="errors.name" class="text-danger">{{ errors.name }}</div>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input 
          type="email" 
          class="form-control" 
          id="email" 
          v-model="user.email" 
          required 
        />
        <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input 
          type="password" 
          class="form-control" 
          id="password" 
          v-model="user.password" 
          required 
        />
        <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="!isFormValid">{{ isEditMode ? 'Actualizar' : 'Registrar' }}</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from '#app';
import axios from 'axios';
import Swal from 'sweetalert2';
const config = useRuntimeConfig(); // Obtener variables de entorno


interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
}

const user = ref<User>({ name: '', email: '', password: '' });
const isEditMode = ref(false);
const router = useRouter();
const route = useRoute();
const errors = ref<{ name?: string; email?: string; password?: string }>({});

// Validaciones del formulario
const validateName = () => {
  if (!user.value.name) {
    errors.value.name = 'El nombre es requerido.';
  } else if (user.value.name.length < 3) {
    errors.value.name = 'El nombre debe tener al menos 3 caracteres.';
  } else {
    errors.value.name = '';
  }
};

const validateEmail = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!user.value.email) {
    errors.value.email = 'El correo electrónico es requerido.';
  } else if (!emailPattern.test(user.value.email)) {
    errors.value.email = 'El correo electrónico no es válido.';
  } else {
    errors.value.email = '';
  }
};

const validatePassword = () => {
  if (!user.value.password) {
    errors.value.password = 'La contraseña es requerida.';
  } else if (user.value.password.length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres.';
  } else {
    errors.value.password = '';
  }
};

// Computed property to check form validity
const isFormValid = computed(() => {
  validateName();
  validateEmail();
  validatePassword();
  return !errors.value.name && !errors.value.email && !errors.value.password;
});

const submitForm = async () => {
  validateName();
  validateEmail();
  validatePassword();

  if (!isFormValid.value) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, corrige los errores en el formulario.',
    });
    return;
  }

  try {
    const method = isEditMode.value ? 'PATCH' : 'POST';
    const url = isEditMode.value
      ? `${config.public.apiBaseUrl}/users/${user.value.id}`
      : `${config.public.apiBaseUrl}/users/`;
    const response = await axios({
      method,
      url,
      data: user.value,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${config.public.authUser}:${config.public.authPassword}`),
      },
    });
    
    Swal.fire({
      icon: 'success',
      title: 'Operación exitosa',
      text: `El usuario ha sido ${isEditMode.value ? 'actualizado' : 'registrado'} correctamente.`,
    });

    router.push({ path: '/UsersTable' });  // Redirigir a la lista de usuarios
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message,
    });
  }
};

const fetchUser = async (id: number) => {
  try {
    const response = await axios.get(`${config.public.apiBaseUrl}/users/${id}`, {
      headers: {
        Authorization: 'Basic ' + btoa(`${config.public.authUser}:${config.public.authPassword}`),
      },
    });
    user.value = response.data;
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message,
    });
  }
};

// Cargar los datos del usuario para edición si hay un id en la consulta
onMounted(() => {
  const id = route.query.id as string;
  if (id) {
    isEditMode.value = true;
    fetchUser(Number(id));
  }
});
</script>
