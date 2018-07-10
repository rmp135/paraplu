<style lang="scss">

</style>
<template>
  <div class="settings">
    <h3 class="settings-title">Tag Settings</h3>
    <h4 class="settings-subtitle">Name</h4>
    <div class="input-group">
      <input v-model="tempTag.Name" />
    </div>
    <h4 class="settings-subtitle">Additional Options</h4>
    <div class="check-group">
      <input id="check" type="checkbox" v-model="tempTag.IncludeChildItems" />
      <label for="check">Include child items?</label>
    </div>
  <div class="actions">
    <span>{{saved ? 'Saved' : ''}}</span>
    <button @click="onSaveClick">Save</button>
  </div>
  </div>
</template>
<script>
  export default {
    props: ['tag'],
    data: () => ({
      saved: false,
      tempTag: {
        Name: '',
        IncludeChildItems: false
      }
    }),
    mounted () {
      this.tempTag = { ...this.tag }
    },
    computed: {
    },
    methods: {
      async onSaveClick () {
        this.saved = false
        await fetch(`/api/tags/${this.tag.ID}/update`, {
          method: 'POST',
          body: JSON.stringify({ ...this.tempTag }),
          headers: {
            "Content-Type": "application/json"
          }
        })
        this.saved = true
        this.tag.Name = this.tempTag.Name
      }
    }
  }
</script>
