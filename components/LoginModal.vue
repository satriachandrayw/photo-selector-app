<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="pin">Enter 4-digit PIN:</label>
          <div class="pin-input">
            <input
              v-for="(digit, index) in 4"
              :key="index"
              type="text"
              :id="`pin-${index}`"
              v-model="pinDigits[index]"
              maxlength="1"
              @input="onInput(index)"
              @keydown="onKeyDown($event, index)"
              pattern="\d"
              required
            >
          </div>
        </div>
      </form>
      <button @click="$emit('close')">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const pinDigits = ref(['', '', '', '']);
const pin = computed(() => pinDigits.value.join(''));

const onInput = (index) => {
  if (pinDigits.value[index].length === 1 && index < 3) {
    document.getElementById(`pin-${index + 1}`).focus();
  }
};

const onKeyDown = (event, index) => {
  if (event.key === 'Backspace' && index > 0 && pinDigits.value[index] === '') {
    document.getElementById(`pin-${index - 1}`).focus();
  }
};

watch(pin, (newPin) => {
  if (newPin.length === 4) {
    handleLogin();
  }
});

const handleLogin = () => {
  console.log('Login attempted', pin.value);
  // Add your login logic here
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

h2 {
  margin-top: 0;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

.pin-input {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.pin-input input {
  width: 50px;
  height: 50px;
  font-size: 24px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.pin-input input:focus {
  outline: none;
  border-color: #007bff;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>