import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "https://scverse-api-dev-stable.own4.aganitha.ai:8443",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        // configure: (proxy, options) => {
        //   proxy.on("proxyReq", (proxyReq, req, res) => {
        //     const username = "pranjal";
        //     const password = "sachin11";
        //     const auth =
        //       "Basic " +
        //       Buffer.from(`${username}:${password}`).toString("base64");
        //     proxyReq.setHeader("Authorization", auth);
        //   });
        // },
      },
    },
  },
});
