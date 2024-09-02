<template>
  <div class="container mt-5">
    <!-- Botón para agregar un nuevo usuario -->
    <button class="btn btn-success mb-3" @click="navigateToForm()">Agregar Usuario</button>

    <!-- Tabla para mostrar los usuarios -->
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <button class="btn btn-primary btn-sm me-2" @click="navigateToForm(user)">Editar</button>
            <button class="btn btn-danger btn-sm" @click="confirmDeleteUser(user.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Paginador -->
    <nav aria-label="Page navigation example">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Anterior</button>
        </li>
        <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
          <button class="page-link" @click="goToPage(page)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Siguiente</button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter, useRuntimeConfig } from '#app';

interface User {
  id: number;
  name: string;
  email: string;
}

const users = ref<User[]>([]);
const currentPage = ref(1);  // Página actual
const totalPages = ref(1);  // Total de páginas
const itemsPerPage = 10;  // Número de elementos por página
const totalUsers = ref(0);  // Total de usuarios en la base de datos
const router = useRouter();
const config = useRuntimeConfig(); // Obtener variables de entorno

// Función para obtener usuarios de la API con paginación
const fetchUsers = async (page: number = 1) => {
  try {
    const response = await axios.get(`${config.public.apiBaseUrl}/users?page=${page}&limit=${itemsPerPage}`, {
      headers: {
        Authorization: 'Basic ' + btoa(`${config.public.authUser}:${config.public.authPassword}`),
      },
    });

    users.value = response.data.data;
    totalUsers.value = response.data.total;
    totalPages.value = Math.ceil(totalUsers.value / itemsPerPage);
    currentPage.value = page;
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al obtener usuarios',
      text: error.message,
    });
  }
};

// Llamar a fetchUsers cuando el componente se monte
onMounted(() => fetchUsers(currentPage.value));

// Función para cambiar de página
const goToPage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    fetchUsers(page);
  }
};

// Función para redirigir al formulario de agregar o editar usuario
const navigateToForm = (user?: User) => {
  if (user) {
    router.push({ name: 'RegisterUser', path: "/RegisterUser", query: { id: user.id } });
  } else {
    router.push({ name: 'RegisterUser', path: "/RegisterUser" });
  }
};

// Función para eliminar un usuario con confirmación
const confirmDeleteUser = (userId: number) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esto!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteUser(userId);
    }
  });
};

// Función para eliminar un usuario
const deleteUser = async (userId: number) => {
  try {
    await axios.delete(`${config.public.apiBaseUrl}/users/${userId}`, {
      headers: {
        Authorization: 'Basic ' + btoa(`${config.public.authUser}:${config.public.authPassword}`),
      },
    });

    Swal.fire({
      icon: 'success',
      title: 'Eliminado',
      text: 'Usuario eliminado con éxito',
    });

    fetchUsers(currentPage.value);  // Actualizar la lista de usuarios después de eliminar
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar usuario',
      text: error.message,
    });
  }
};
</script>
