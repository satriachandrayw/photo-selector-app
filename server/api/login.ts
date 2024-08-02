import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  // Di sini Anda akan menambahkan logika autentikasi yang sebenarnya
  if (username === 'admin' && password === 'password') {
    return {
      status: 'success',
      message: 'Login berhasil',
      user: { id: 1, username: 'admin' }
    }
  } else {
    event.node.res.statusCode = 401
    return {
      status: 'error',
      message: 'Username atau password salah'
    }
  }
})
