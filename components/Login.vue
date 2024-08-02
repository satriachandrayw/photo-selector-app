<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const credentials = ref({ username: '', password: '' });
const error = ref('');
const router = useRouter();

async function handleLogin() {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials.value),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Selamat datang, ${data.user.username}!`);
      router.push('/'); // Arahkan ke halaman utama setelah login berhasil
    } else {
      error.value = data.message;
    }
  } catch (err) {
    error.value = 'Terjadi kesalahan saat login';
  }
}
</script>

<template>
  <div class="container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input type="text" v-model.trim="credentials.username" placeholder="Username" required />
      <input type="password" v-model.trim="credentials.password" placeholder="Password" required />
      <button type="submit">Log In</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.container {
  max-width: 400px;
  margin: 40px auto;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>