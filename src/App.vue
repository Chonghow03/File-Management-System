<template>
  <div id="app">
    <h1>File Management System</h1>
    <FileUpload />
  </div>
</template>

<script>
import FileUpload from './components/FileUpload.vue';

export default {
  name: 'App',
  components: {
    FileUpload,
  },
};
</script>

<style scoped>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1 {
  font-size: 2.5em;
  color: #42b883;
  margin-bottom: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
