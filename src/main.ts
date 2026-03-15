import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import VueDOMPurifyHTML from 'vue-dompurify-html'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(VueDOMPurifyHTML)
app.mount('#app')
