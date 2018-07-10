<style lang="scss">

  .is-active {
    color: #2980b9;
  }

</style>
<template>
  <ul>
    <li :class="{'no-items': tag.children.length === 0}" @mousedown.prevent="onMouseDown({ event: $event, tag })" @mouseup="onMouseUp(tag)">
      <i v-if="tag.children.length !== 0" class="action material-icons" @click="expanded = !expanded">{{expanded ? 'chevron_right' : 'expand_more' }}</i>
      <a class="tag-name" :class="{'is-active': currentTag === tag}" @click="onTagClick(tag)">{{tag.Name}}</a>
      <span class="tag-actions">
        <i class="material-icons action" @click="$emit('settings', tag)">settings</i>
        <i class="material-icons action" @click="onEditClick">subdirectory_arrow_right</i>
        <i class="material-icons action-delete" @click="onDeleteClick">delete</i>
      </span>
    </li>
    <tag-branch v-show="!expanded" v-for="child in tag.children" :key="child.ID" :tag="child" :currentTag="currentTag" @click="onTagClick" @mouseup="onMouseUp" @mousedown="onMouseDown" @delete="onChildDelete" @settings="$emit('settings', $event)"/>
    <li v-if="editMode" >
      <add-new-tag @create="onCreateClick" @cancel="onCancelClick" v-model="newTagName" ref="input"></add-new-tag>
    </li>
  </ul>
</template>
<script>
  import AddNewTag from './addnewtag.vue'
  export default {
    props: ["tag", "currentTag"],
    data: () => ({
      editMode: false,
      newTagName: '',
      expanded: false
    }),
    name: "tag-branch",
    methods: {
      onEditClick () {
        this.editMode = !this.editMode
      },
      onChildDelete (tag) {
        const index = this.tag.children.indexOf(tag)
        if (index !== -1)
          this.tag.children.splice(this.tag.children.indexOf(tag), 1, ...tag.children)
        else
          this.$emit('delete', tag)
      },
      async onDeleteClick () {
        const response = await fetch(`/api/tags/${this.tag.ID}/delete`, {
          method: 'POST',
        })
        this.$emit('delete', this.tag)
      },
      async onCreateClick () {
        const response = await fetch(`/api/tags/${this.tag.ID}/addchild`, {
          method: 'POST',
          body: JSON.stringify({ name: this.newTagName }),
          headers: {
            "Content-Type": "application/json"
          }
        })
        const id = Number.parseInt(await response.text())
        this.tag.children.push({ ID: id, Name: this.newTagName, children: [] })
        this.editMode = false
        this.newTagName = ''
      },
      onCancelClick () {
        this.editMode = false;
      },
      onMouseDown ({event, tag}) {
        this.$emit('mousedown', { event, tag })
      },
      async onMouseUp (tag) {
        this.$emit("mouseup", tag)
      },
      onTagClick (tag) {
        this.$emit("click", tag)
      }
    },
    components: {
      AddNewTag
    }
  }
</script>
