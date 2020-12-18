<template>
  <div>
    <img src="../assets/logo.png" id="spotifaille-logo" />
    <div class="container">
      <md-autocomplete
        v-model="value"
        :md-options="tracks"
        @md-changed="getTracks"
        @md-opened="getTracks"
        @md-selected="onSelected"
        md-input-placeholder="Tu veux mettre quoi?"
        md-layout="box"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      >
        <template slot="md-autocomplete-item" slot-scope="{ item }">
          <div class="row">
            <img class="album-cover" :src="item.image" />
            <div class="text-section">
              <div class="col-12">
                <strong>{{ item.name }}</strong>
              </div>
              <div class="col-12">{{ item.artists }}</div>
            </div>
          </div></template
        >
      </md-autocomplete>
    </div>

    <md-dialog-confirm
      :md-active.sync="showDialog"
      md-title="T sur?"
      :md-content="
        'Tu vas mettre <strong>' +
          selected.fullname +
          '</strong> de <strong>' +
          this.displayFirstArtist() +
          '</strong> dans la file d\'attente. <br/>C\'est parti tu nous mets bien?'
      "
      md-confirm-text="Bah allez"
      md-cancel-text="Bof"
      @md-cancel="showDialog = false"
      @md-confirm="onConfirm"
    />

    <md-snackbar
      md-position="center"
      :md-duration="4000"
      :md-active.sync="showSnackbar"
      md-persistent
    >
      <span>{{ snackbarText }}</span>
      <md-button class="md-primary" @click="showSnackbar = false">
        Fermer
      </md-button>
    </md-snackbar>
  </div>
</template>

<script>
import ky from "ky";
import SpotifyWebApi from "spotify-web-api-js";
import { getTokens } from "../services/auth.js";

export default {
  name: "Search",
  data: () => ({
    value: null,
    tracks: [],
    spotify: new SpotifyWebApi(),
    showDialog: false,
    showSnackbar: false,
    snackbarText: "",
    selected: "",
  }),
  props: {
    msg: String,
  },
  created: async function() {
    const store = this.$store;
    console.log(this.$properties.url);

    // wait to get access token before any call to spotify api
    await ky
      .get(this.$properties.url.node_server)
      .json()
      .then((res) => {
        store.commit("saveAccessToken", res.access_token);
        store.commit("saveRefreshToken", res.refresh_token);
      })
      .catch((err) => {
        console.log("error");
        console.log(err);
      });
  },
  methods: {
    getTracks(searchTerm) {
      if (searchTerm) {
        this.spotify.setAccessToken(this.$store.state.access_token);
        this.tracks = new Promise((resolve) => {
          this.spotify.searchTracks(searchTerm).then((res) => {
            let tracklist = res.tracks.items;
            let tracks = [];
            for (let i in tracklist) {
              let name =
                tracklist[i].name.length > 30
                  ? tracklist[i].name.substring(0, 30).concat("...")
                  : tracklist[i].name;
              tracks.push({
                name: name,
                fullname: tracklist[i].name,
                image: this.getAlbumFirstImageRef(tracklist[i].album),
                artists: this.getAllArtists(tracklist[i].artists),
                uri: tracklist[i].uri,
              });
            }
            resolve(tracks);
          });
        });
      }
    },
    getAlbumFirstImageRef(album) {
      return album.images[0].url;
    },
    getAllArtists(rawArtists) {
      let artists;
      for (let i in rawArtists) {
        if (!artists) {
          artists = rawArtists[i].name;
        } else {
          artists = artists.concat(", ").concat(rawArtists[i].name);
        }
      }
      return artists.length > 30
        ? artists.substring(0, 30).concat("...")
        : artists;
    },
    onSelected(selected) {
      this.selected = selected;
      this.value = selected.name;
      this.showDialog = true;
    },
    onConfirm() {
      const store = this.$store;

      this.spotify.setAccessToken(this.$store.state.access_token);
      this.spotify
        .queue(this.selected.uri)
        .then(() => {
          getTokens.bind(this)(true, null, store.state.refresh_token);
          this.snackbarText = "Merci à toi. Hâte de m'enjailler sur ton son!";
          this.showSnackbar = true;
        })
        .catch((err) => {
          console.log(err);
          let response = JSON.parse(err.response);
          if (
            response.error.status === 404 &&
            response.error.reason === "NO_ACTIVE_DEVICE"
          ) {
            this.snackbarText =
              "Aucun appareil dispo. Démarre une lecture Spotify d'abord frérot.";
            this.showSnackbar = true;
          } else if (response.error.status === 401) {
            this.snackbarText =
              "J'suis plus co à Spotify. Demande à Aubin. C'est relou";
            this.showSnackbar = true;
          }
        });
    },
    displayFirstArtist() {
      return this.selected.artists ? this.selected.artists.split(",")[0] : "";
    },
  },
};
</script>

<style lang="scss" scoped>
.md-autocomplete {
}

.album-cover {
  width: 50px;
  height: 50px !important;
  margin-left: 3px;
}

.text-section {
  margin-left: auto;
}

#spotifaille-logo {
  padding: 10px;
}
</style>
