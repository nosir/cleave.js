# Cleave-Vue
CleaveJS as a component of VueJS

## Usage
```
npm install

npm run dev
```

## VueJS component usage
Find the main file in `./src/App.vue` and `./components/cleave.vue`.
```
<template>
  <Cleave :options='cleaveOptions'></Cleave>
</template>

<script>
import Cleave from './components/cleave.vue'

export default {
  data() {
    return {
      cleaveOptions: {  // custom options
        date: true,
        datePattern: ['Y', 'm', 'd']
      }
    }
  },
  components: {
    Cleave
  }
}

</script>

```
By using `cleave.vue` as a component, there are three things for you to do:

1. Import `cleave.vue` and set as a component of the parent.

2. Pass in the custom `cleaveOptions` prop.

3. Simply use `<Cleave></Cleave>` as a normal `<input/>` field.