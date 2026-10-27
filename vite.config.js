import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
server: {
  proxy: {
    "/api": {
      target: "https://ts.idicorp.ir",
      changeOrigin: true,
      secure: true,
      cookieDomainRewrite: "localhost",
    },
  },
},
});
