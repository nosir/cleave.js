<template>
  <Cleave :options='cleaveOptions'></Cleave>
</template>

<script>
import Cleave from './components/cleave.vue'

export default {
  data() {
    return {
      cleaveOptions: {
        delimiter: '·'
      }
    }
  },
  components: {
    Cleave
  }
}

</script>

