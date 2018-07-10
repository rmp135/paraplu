<style lang="scss">
  .add-new-input {
    margin-left: 1.5rem;
    input {
      outline:none;
      border-radius: 2px;
      border: 1px solid black;
      flex-grow: 1;
      &:focus {
        border-color:#2980b9;
      }
    }
  }
</style>
<template>
  <ul>
    <li>
      <input class="add-new-input" ref="input" :value="tagName" @keydown.enter="onCreate" @input="$emit('input', $event.target.value)"/>
      <span class="add-new-actions">
        <i class="material-icons action-confirm" @click="onCreate">check_circle</i>
        <i class="material-icons action-delete"  @click="$emit('cancel')">cancel</i>
      </span>
    </li>
  </ul>
</template>
<script>
  export default {
    props: ["tagName"],
    mounted () {
      this.$refs.input.focus()
    },
    methods: {
      onCreate () {
        this.$emit('create')
      }
    }
  }
</script>
