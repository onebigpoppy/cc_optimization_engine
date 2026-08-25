import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { hydrateData } from '@/core/domain/services/dataProvider'
import './assets/main.css'

// Kick off a background refresh of card/merchant data (falls back to the
// bundled snapshot while the host-served JSON is unavailable).
void hydrateData()

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
