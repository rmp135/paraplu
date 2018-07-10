<style lang="scss">

</style>
<template>
    <div class="settings">
      <h3 class="settings-title">Settings</h3>
      <h4 class="settings-subtitle">Folders to scan</h4>
      <div v-for="(folder, index) in availableFolders" :key="`f${index}`">
        <div class="input-group">
          <input v-model="folder.Path" />
          <div class="action-group">
            <i class="action material-icons" @click="onRemoveClick(folder)">remove</i>
            <i class="action material-icons" @click="onQueueScan(folder)">refresh</i>
          </div>
        </div>
        <div v-if="folder.ScanQueued">Scan has been queued.</div>
      </div>
      <button @click="onFolderAddNewClick">Add</button>
      <h4 class="settings-subtitle">IP Filtering</h4>
      <div class="check-group">
        <input id="mode-check" type="checkbox" v-model="blacklistMode" />
        <label for="mode-check">Blacklist Mode?</label>
        <p v-if="blacklistMode">All IP addresses will be allowed to connect <i>except</i> the following.</p>
        <p v-else>Only the following IP addresses will be allowed to connect.</p>
      </div>
      <div v-for="(ip, index) in availableIPs" :key="`i${index}`">
        <div class="input-group ip-input-group" :class="{'blacklist': blacklistMode}">
          <input v-model="ip.Address" />
          <div class="action-group">
            <i class="action material-icons" @click="onRemoveClick(ip)">remove</i>
          </div>
        </div>
      </div>
      <button @click="onIPAddNewClick">Add</button>
      <div class="actions">
        <span>{{saved ? 'Saved' : ''}}</span>
        <button @click="onSave">Save</button>
      </div>
    </div>
</template>
<script>
  export default {
    data: () => ({
      blacklistMode: false,
      folders: [],
      ips: [],
      saved: false
    }),
    computed: {
      availableFolders () {
        return this.folders.filter(f => !f.Deleted)
      },
      availableIPs () {
        return this.ips.filter(ip => !ip.Deleted)
      }
    },
    async mounted () {
      const response = await fetch('/api/settings')
      const settings = await response.json()
      this.blacklistMode = settings.blacklistMode
      this.folders = settings.folders.map(f => ({ ScanQueued: false, Deleted: false, ...f}))
      this.ips = settings.ips.map(ip => ({ Deleted: false, ...ip}))
    },
    methods: {
      async onSave () {
        this.saved = false
        const response = await fetch('/api/settings', {
          method: 'POST',
          body: JSON.stringify({
            folders: this.folders.filter(f => !(f.ID === undefined && f.Deleted)),
            ips: this.ips.filter(ip => !(ip.ID === undefined && ip.Deleted)),
            blacklistMode: this.blacklistMode
          }),
          headers: {
            "Content-Type": "application/json"
          }
        })
        const settings = await response.json()
        this.folders = settings.folders.map(f => ({ ScanQueued: false, Deleted: false, ...f}))
        this.ips = settings.ips.map(ip => ({ Deleted: false, ...ip}))
        this.blacklistMode = settings.blacklistMode
        this.saved = true
      },
      async onQueueScan (folder) {
        await fetch('/api/requestscan', {
          method: 'POST',
          body: JSON.stringify({ ID: folder.ID }),
          headers: {
            "Content-Type": "application/json"
          }
        })
        folder.ScanQueued = true
      },
      onFolderAddNewClick () {
        this.folders.push({
          Path: "",
          ScanQueued: false,
          Deleted: false
        })
      },
      onIPAddNewClick () {
        this.ips.push({
          Address: "",
          Deleted: false
        })
      },
      onRemoveClick (entity) {
        entity.Deleted = true
      }
    }
  }
</script>
