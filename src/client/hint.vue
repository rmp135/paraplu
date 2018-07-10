<style>
#hint {
  position: absolute;
  background-color: aliceblue;
  padding: 10px;
  max-width: 200px;
  word-wrap: break-word;
  box-shadow: 3px 3px 3px grey;
  border: 1px solid grey;
  z-index: 1;
}
</style>

<template>
  <div>
    <div id="hint" :style="{'left': pos.x + 'px', 'top': pos.y + 'px' }">{{text}}</div>
  </div>
</template>
<script>
  export default {
    props: ["pos", "text"],
  }
</script>
