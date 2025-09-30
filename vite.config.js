import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'
import path from 'path'

function getLastIPAddress() {
  const networkInterfaces = os.networkInterfaces()
  const addresses = []

  for (const interfaceName in networkInterfaces) {
    for (const net of networkInterfaces[interfaceName]) {
      // Filtrar direcciones IPv4 y no internas
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address)
      }
    }
  }

  // Retornar la última dirección IP o 'localhost'
  return addresses[addresses.length - 1] || 'localhost'
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: `http://${getLastIPAddress()}:3000`, // Abre en la última IP local
  },
})
