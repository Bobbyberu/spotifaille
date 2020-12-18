<template>
  <div>callback</div>
</template>

<script>
import { getTokens } from "../services/auth";

export default {
  name: "Callback",
  props: {
    msg: String,
  },
  created: function() {
    let params = new URLSearchParams(window.location.search);
    let code = params.get("code");

    getTokens.bind(this)(false, code);
  },
};
</script>
