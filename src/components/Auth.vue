<template>
  <div>
    auth
  </div>
</template>

<script>
export default {
  name: "Auth",
  props: {
    msg: String,
  },
  created: function() {
    let params = new URLSearchParams();
    params.append("client_id", this.$properties.app_credentials.id);
    params.append("response_type", "code");
    params.append("scope", "user-modify-playback-state");
    params.append("redirect_uri", this.$properties.url.callback);

    let url = this.$properties.url.spotify.authorize.concat(params.toString());
    document.location.href = url;
  },
};
</script>
