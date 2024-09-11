<!-- eslint-disable prettier/prettier -->
<template>
  <div id = "app">
    <AppLayOut/>
  </div>
</template>

<!-- eslint-disable prettier/prettier -->
<script>
import AppLayOut from './components/AppLayOut.vue'

export default {
  name: 'App',
  components: {
    AppLayOut
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #a0c5eb;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

.image-icon {
  max-width: 8em;
  margin-top: 2em;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
