<template>
  <section>
    <h2>Geral</h2>
    <ul>
      <li>Atividades da semana 1, 2 e 3 do AVA, matérias: Carreira Profissional, Redes de Computadores e Segurança da Informação na Nuvem e Processos de Desenvolvimento de Software e Metodologias ágeis (https://educacaoprofissional.educacao.sp.gov.br/). Fazer até o dia 08/03/2026</li>
    </ul>
    <h2>Lógica e Linguagem de Programação</h2>
    <ul>
      <li v-for="file in logica" :key="file.name">
        {{ file.name }} 
        <a :href="getFileUrl(file.path)" :download="file.name">
          [Baixar {{ file.type }}]
        </a>
      </li>
    </ul>
    <h2>Redes de Computadores e Segurança da Informação na Nuvem</h2>
    <ul>
      <li v-for="file in redes" :key="file.name">
        {{ file.name }} 
        <a :href="getFileUrl(file.path)" :download="file.name">
          [Baixar {{ file.type }}]
        </a>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const logica = ref([
  { name: 'Atividade Lógica e Algoritmos 1', type: 'docx', path: 'documents/Atividade Lógica e Algoritmos 1.docx' },
])

const redes = ref([
  { name: 'Atividade Redes de Computadores e Segurança da Informação na Nuvem 1', type: 'docx', path: 'documents/Atividade Redes de Computadores e Segurança da Informação na Nuvem 1.docx' },
])


const getFileUrl = (path) => {
  return `/${path}`
}
</script>

<style scoped>
ul { list-style: none; padding: 0; }
li { margin-bottom: 10px; padding: 10px; border: 1px solid #eee; }
a { color: #42b983; text-decoration: none; font-weight: bold; margin-left: 10px; }
</style>