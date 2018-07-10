<style lang="scss">
  body, html { 
    height: 100%;
  }
  .container {
    height: 100%;
    position: relative;
  }
  * {
    box-sizing: border-box;
    font-family: 'Roboto';
    padding: 0;
    margin: 0;
  }
  .overlay {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: transparentize($color: grey, $amount: 0.1);
    z-index: 1;
  }
    .settings {
    width: 30rem;
    background-color: white;
    padding: 2rem;
    border-radius: 0.6rem;
    .input-group {
      display: flex;
      input {
        height: 1.5rem;
        flex-grow: 1;
      }
    }
    button {
      background-color: white;
      border: 1px #2c3e50 solid;
      border-radius: 0.3rem;
      height: 1.5rem;
      width: 4rem;
      align-self: flex-end;
      outline: none;
      &:hover {
        background-color: #2c3e50;
        color: white;
      }
    }
    .settings-subtitle {
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
    .check-group {
      padding-bottom: 0.5rem;
    }
    .ip-input-group {
      &.blacklist {
        input {
          background-color: black;
          color: white;
          outline: none;
          border-color: black;
        }
      }
    }
    .actions {
      display: flex;
      padding-top: 1rem;
      justify-content: space-between;
    }
  }
  .navigation {
    width: 300px;
    position: fixed;
    height: 100%;
    ul {
      padding-left: 0;
      list-style:none;
      &:not(.root) {
        margin-left: 1rem;
      }
    }
    li {
      padding: 0.2rem;
      border-radius: 3px;
      display: flex;
      cursor: pointer;
      height: 2rem;
      user-select:none;
      &.is-active {
        color: #2980b9;
      }
    }
    .tag-name {
      flex-grow: 1;
      align-self: center;
    }
    .tag-actions {
      visibility: hidden;
      * {
        margin-left: 5px;
        text-align: center;
      }
    }
    .action {
      cursor: pointer;
    }
    .no-items {
      padding-left:1.5rem;
    }
    .tag-title {
      font-weight: 500;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      line-height: 2.5rem;
      height: 3rem;
      text-align: center;
      justify-content: center;
      &:hover {
        background-color: initial;
        color: initial;
        cursor: initial;
      }
    }
    li:hover {
      .tag-actions {
        visibility: visible;
      }
    }
  }
  .action:hover,
  .tag-name:hover {
    cursor: pointer;
    color: #2980b9;
  }
  .action-delete:hover,
  .action-remove:hover {
    color: #c0392b;
  }
  .action-confirm:hover {
    color: #27ae60;
  }
  .action-disabled {
    color: #7f8c8d !important;
    cursor: initial !important;
  }
  .main {
    margin-left: 305px;
    .files {
      display: flex;
      flex-wrap: wrap;
      .file-body {
        user-select: none;
        margin: 0.5rem;
        width: 320px;
        height: 200px;
        background-color: green;
        border-radius: 0.6rem;
        background-size: cover;
        background-repeat: no-repeat;
        &.selected {
          box-shadow: #087ef5 0 0 5px 2px;
        }
      }
      .file-title {
        height: 2rem;
        padding: 0.2rem;
      }
      .file-details {
        display: flex;
        flex-direction:column;
        height: inherit;
        justify-content: space-between;
        &:hover {
          .bottom {
            display: flex;
          }
        }
        .bottom {
          display: flex;
          justify-content: space-between;
        }
        span {
          align-self: center;
        }
        .action:not(.action-remove):hover {
          color: #3498db;
        }
        .bottom {
          display: none;
          border-bottom-right-radius: 0.6rem;
          border-bottom-left-radius: 0.6rem;
        }
        .top {
          border-top-right-radius: 0.6rem;
          border-top-left-radius: 0.6rem;
        }
        .bottom, .top {
          color: white;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.5);
        }
      }
    }
  }
  .header {
    position: sticky;
    top: 0;
    background-color: white;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    height: 3rem;
    .header-title {
      flex-grow: 1;
      font-weight: 500;
    }
    .header-actions {
      margin: 0.5rem;
    }
  }
  .overlay {
    .video {
      box-shadow: black 0px 0px 30px;
      max-width: 75%;
    }
  }
  .tag-new {
    text-align: center;
  }
  .add-new-form {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }
</style>
<template>
  <div class="container" @mousemove="onMouseMove" @mouseup="onGlobalMouseUp">
    <div class="overlay" v-if="showMainSettings" @click.self="showMainSettings = false">
      <settings />
    </div>
    <div class="overlay" v-if="tagSettings !== null" @click.self="tagSettings = null">
      <tag-settings :tag="tagSettings" />
    </div>
    <div class="overlay" v-if="fileSettings !== null" @click.self="fileSettings = null">
      <file-settings :file="fileSettings" />
    </div>
    <div v-if="previewVideo !== null" class="overlay" @click.self="closePreview">
      <video class="video" :src="`/file/${previewVideo.ID}`" controls="true" />
    </div>
    <hint v-if="showHint" :pos="pos" :text="selected.text"></hint>
    <div class="navigation">
      <ul class="root">
        <li class="tag-title">Tags</li>
        <ul class="root">
          <li class="tag-name no-items" :class="{'is-active': currentTag === null}" @click="onUntaggedClick">Untagged</li>
        </ul>
        <tag-branch class="root" v-for="tag in tags" :key="tag.ID" :tag="tag" :currentTag="currentTag" @mouseup="onTagMouseUp" @click="onTagClick" @mousedown="onTagMouseDown" @delete="onDeleteTag" @settings="tagSettings = $event"></tag-branch>
        <add-new-tag class="root" v-if="addNewMode" @cancel="onCancelClick" @create="onCreateClick" v-model="newTagName"></add-new-tag>
        <li class="add-new-form" v-else>
          <span class="tag-name tag-new" @click="addNewMode = true">Add New</span>
        </li>
      </ul>
    </div>
    <div class="main">
      <div class="header">
        <p class="header-title">paraplu</p>
        <span class="header-actions">
          <i class="action material-icons" @click="showMainSettings = true">settings</i>
        </span>
      </div>
      <div class="files">
        <div class="file-body" v-for="file in files" :key="file.ID" :style="{'background-image':'url(/thumbs/'+file.ID+'.jpg)'}" :class="{'selected': file.selected}" @mouseup.stop="onFileMouseUp($event, file)" @mousedown.prevent="onFileMouseDown($event, file)">
          <div class="file-details">
            <div class="top">{{GetName(file.FilePath)}}</div>
            <div class="bottom">
              <span class="action" @click="previewVideo = file">Preview</span>
              <span class="actions">
                <i class="action material-icons" @click="fileSettings = file">settings</i>
                <i class="action-remove action material-icons" :class="{'action-disabled': currentTag === null}" @click="onRemoveFileClick(file)">remove_circle</i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Hint from './hint.vue'
  import TagBranch from './tagbranch.vue'
  import AddNewTag from './addnewtag.vue'
  import Settings from './settings.vue'
  import TagSettings from './tag-settings.vue'
  import FileSettings from './file-settings.vue'
  export default {
    data: () => ({
      lastMousePos: {
        x:0,
        y:0
      },
      addNewMode: false,
      files: [],
      selectedFile: null,
      selectedTag: null,
      newTagName: "",
      showMainSettings: false,
      previewVideo: null,
      currentTag: null,
      selected: null,
      tagSettings: null,
      fileSettings: null,
      tags: [],
      pos: {
        x: 0,
        y: 0
      }
    }),
    async mounted () {
      const response = await fetch('/api/tagged/untagged')
      this.files = (await response.json()).map(f => ({ selected: false, ...f}))
      const tagResponse = await fetch('/api/tags')
      this.tags = await tagResponse.json()
    },
    computed: {
      showHint () {
        return this.selected !== null
      },
      previewVideoURL () {
        return `/file/${this.previewVideo.ID}`
      },
      selectedFilesCount () {
        return this.files.filter(f => f.selected === true).length
      }
    },
    methods: {
      onDeleteTag (tag) {
        const index = this.tags.indexOf(tag)
        if (index !== -1)
          this.tags.splice(this.tags.indexOf(tag), 1, ...tag.children)
      },
      async onRemoveFileClick (file) {
        if (this.currentTag === null) return;
        const response = await fetch(`/api/tags/${this.currentTag.ID}/removefiles`, {
          method: 'POST',
          body: JSON.stringify([file.ID]),
          headers: {
            "Content-Type": "application/json"
          }
        })
        this.files = this.files.filter(f => f.ID !== file.ID)
      },
      async onCreateClick () {
        const response = await fetch(`/api/tags/addchild`, {
          method: 'POST',
          body: JSON.stringify({ name: this.newTagName }),
          headers: {
            "Content-Type": "application/json"
          }
        })
        const id = Number.parseInt(await response.text())
        this.tags.push({ ID: id, Name: this.newTagName, children: [] })
        this.addNewMode = false
        this.newTagName = ""
      },
      onCancelClick () {
        this.newTagName = ""
        this.addNewMode = false
      },
      GetName (filePath) {
        const split = filePath.split("/")
        return split[split.length-1]
      },
      onGlobalMouseUp () {
        this.selectedFile = null
        this.selectedTag = null
        if (this.selected !== null)
          this.selected = null
      },
      async onFileMouseUp (e, file) {
        if (
          e.pageX === this.lastMousePos.x &&
          e.pageY === this.lastMousePos.y
        ) {
          file.selected = !file.selected
        }
        if (this.selectedTag !== null) {
          await fetch(`/api/file/${file.ID}/addtag`, {
            method: 'POST',
            body: JSON.stringify({ ID: this.selectedTag.ID }),
            headers: {
              "Content-Type": "application/json"
            }
          })
        }
        this.selectedFile = null
        this.selectedTag = null
        this.selected = null
      },
      onFileMouseDown (e, file) {
        this.lastMousePos = {
          x: e.pageX,
          y: e.pageY
        }
        this.selectedFile = file
      },
      async onUntaggedClick ()  {
        this.currentTag = null
        const response = await fetch('/api/tagged/untagged')
        this.files = await this.transformTagsResponse(response)
      },
      async onTagMouseUp (tag) {
        if (this.selected !== null && this.selected.type === "file") {
          const IDs = this.files.filter(f => f.selected).map(f => f.ID)
          await fetch(`/api/tags/${tag.ID}/addfiles`, {
            method: 'POST',
            body: JSON.stringify(IDs),
            headers: {
              "Content-Type": "application/json"
            }
          })
          this.files = this.files.filter(f => !IDs.includes(f.ID))
        }
      },
      async transformTagsResponse (response) {
        return (await response.json()).map(f => ({ selected: false, ...f}))
      },
      onMouseMove (e)  {
        if (
          this.selectedFile !== null &&
          e.pageX !== this.lastMousePos.x &&
          e.pageY !== this.lastMousePos.y
        ) {
          this.pos.x = e.pageX + 10
          this.pos.y = e.pageY + 10
          this.selectedFile.selected = true
          this.selected = { type: "file", text: `Move ${this.selectedFilesCount} file${this.selectedFilesCount > 1 ? 's' : ''}.` }
        }
        if (
          this.selectedTag !== null &&
          e.pageX !== this.lastMousePos.x &&
          e.pageY !== this.lastMousePos.y
        ) {
          this.pos.x = e.pageX + 10
          this.pos.y = e.pageY + 10
          this.selected = { type: "tag", text: this.selectedTag.Name }
        }
      },
      onTagMouseDown ({ event, tag }) {
        this.lastMousePos = {
          x: event.pageX,
          y: event.pageY
        }
        this.selectedTag = tag
      },
      async onTagClick (tag) {
        this.currentTag = tag
        const response = await fetch(`/api/tagged/${tag.ID}`)
        this.files = await this.transformTagsResponse(response)
      },
      closePreview () {
        this.previewVideo = null
      }
    },
    components: {
      Hint,
      TagBranch,
      AddNewTag,
      Settings,
      TagSettings,
      FileSettings
    }
  }
</script>
