import { createRouter, createWebHistory } from 'vue-router'
import DirectoryView from '../views/DirectoryView.vue'

const routes = [
  {
    path: '/',
    name: 'diretorio',
    component: DirectoryView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router