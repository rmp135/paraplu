<style lang="scss">
  .settings {
    p {
      word-break: break-all;
    }
    .tag {
      display: inline-flex;
      padding: 0.5rem;
      border-radius: 0.3rem;
      background-color: #2980b9;
      margin-right: 0.2rem;
      margin-bottom: 0.2rem;
      align-items: center;
      a {
        color: white;
      }
    }
  .confirm-delete {
    background-color: red;
    color: white;
  }
  .warning {
    color: red;
  }
}
</style>
<template>
  <div class="settings">
    <h3 class="settings-title">File Settings</h3>
    <h4 class="settings-subtitle">Path</h4>
    <p>{{file.FilePath}}</p>
    <h4 class="settings-subtitle">Tags</h4>
    <div class="tag" v-for="tag in tags" :key="tag.id">{{tag.name}}<a class="material-icons action action-delete" @click="onRemoveTag(tag)">remove_circle</a></div>
    <div>
      <button @click="onDeleteFile" :class="{ 'confirm-delete': confirmDelete }">{{deleteText}}</button>
      <span v-show="confirmDelete" class="warning">Warning: This will delete the file on disk.</span>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['file'],
    data: () => ({
      saved: false,
      confirmDelete: false,
      tags: []
    }),
    computed: {
      deleteText () {
        return this.confirmDelete ? 'Confirm Delete' : 'Delete File'
      }
    },
    async mounted () {
      const response = await fetch(`/api/file/${this.file.ID}`)
      this.tags = await response.json()
    },
    methods: {
      async onRemoveTag (tag) {
        await fetch(`/api/tags/${tag.id}/removefiles`, {
          method: 'POST',
          body: JSON.stringify([this.file.ID]),
          headers: {
            "Content-Type": "application/json"
          }
        })
        this.tags = this.tags.filter(t => t.id !== tag.id)
      },
      async onDeleteFile () {
        if (this.confirmDelete) {
          await fetch(`/api/file/${this.file.ID}/delete`, {
            method: 'POST'
          })
          this.$emit('delete', this.file)
        }
        else {
          this.confirmDelete = true;
        }
      }
    }
  }
</script>
