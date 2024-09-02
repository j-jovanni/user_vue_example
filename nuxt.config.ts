// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  css: ['~/assets/main.scss'],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
      authUser: process.env.VUE_APP_AUTH_USER,
      authPassword: process.env.VUE_APP_AUTH_PASSWORD
    }
  }
});
