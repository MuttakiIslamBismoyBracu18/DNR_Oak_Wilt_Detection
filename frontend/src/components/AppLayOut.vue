<template>
  <div class="app-container">
    <header class="app-header">
      <h1><strong>Oak Wilt Detection</strong></h1>
    </header>

    <div class="row">
      <div class="column">
        <section class="image-upload">
          <h1 class="row">{{ heading }}</h1>
          <div class="custom-file-upload">
            <div class="file-upload-wrapper">
              <input
                type="file"
                id="images"
                class="select-images-button"
                ref="images"
                multiple
                accept=".jpg,.jpeg,.png,.gif"
                @change="handleUploadImages"
              />
              <input
                type="text"
                class="file-upload-input"
                :title="imageNames"
                v-model="imageNames"
                readonly
              />
            </div>
            <button class="file-upload-button button" @click="submitImages">
              SUBMIT IMAGES
            </button>
          </div>
          <div v-if="notificationMessage">
            <a :href="downloadLinkCsv" class="file-download-button" download>
              Download CSV Results
            </a>
            <br />
            <a
              :href="downloadLinkGeoJson"
              class="file-download-button"
              download
            >
              Download GeoJSON Results
            </a>
            <button @click="redirectToGeoJSON">Go to GeoJSON.io</button>
          </div>
        </section>
        <div class="row">
          <div class="full-width-column">
            <p>Classification Results</p>
            <select v-model="selectedFilter" class="filter-dropdown">
              <option value="">All</option>
              <option value="THIS PICTURE HAS OAK WILT">
                THIS PICTURE HAS OAK WILT
              </option>
              <option value="THERE'S A HIGH CHANCE OF OAK WILTS">
                THERE'S A HIGH CHANCE OF OAK WILTS
              </option>
              <option value="CHANGES OF COLORS ON TREE LEAVES">
                CHANGES OF COLORS ON TREE LEAVES
              </option>
              <option value="Not an Oak Wilt">Not an Oak Wilt</option>
            </select>
            <div v-if="isLoading" class="loading-overlay">
              <div class="loading-message">
                Generating Results, please wait...
              </div>
            </div>
          </div>
        </div>
        <section class="classification-results">
          <div class="grid-container">
            <div
              v-for="result in filteredResults"
              :key="result.filename"
              class="grid-item"
            >
              <img
                :src="`http://localhost:5000/images/${result.filename}`"
                alt="Image preview"
                class="image-preview"
              />
              <div>
                <p>
                  <strong>File:</strong>
                  <a
                    :href="`http://localhost:5000/images/${result.filename}`"
                    target="_blank"
                    >{{ result.filename }}</a
                  >
                </p>
                <p><strong>Prediction:</strong> {{ result.prediction }}</p>
                <p :style="{ color: getCategoryColor(result.classification) }">
                  <strong>Category:</strong> {{ result.classification }}
                </p>
                <p><strong>Latitude:</strong> {{ result.latitude }}</p>
                <p><strong>Longitude:</strong> {{ result.longitude }}</p>
                <div>
                  <button
                    @click="sendFeedback(result.filename, false)"
                    class="feedback-button"
                  >
                    Oak Wilt
                  </button>
                  <button
                    @click="sendFeedback(result.filename, true)"
                    class="feedback-button"
                  >
                    Healthy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div class="column">
        <p>Location</p>
        <div id="mapid" class="map-full-width"></div>
      </div>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

var vm = null;

export default {
  name: "AppLayout",
  data() {
    return {
      images: [],
      heading: "Upload Images Here",
      selectedFiles: [],
      classificationResults: [],
      isLoading: false,
      selectedFilter: "",
      notificationMessage: "",
      downloadLinkCsv: "",
      downloadLinkGeoJson: "",
      map: null,
    };
  },
  watch: {
    selectedFilter() {
      this.updateMapWithResults(this.filteredResults);
    },
  },
  mounted() {
    vm = this;
    this.initMap();
    window.feedback = (filename, isCorrect) =>
      this.feedback(filename, isCorrect);
  },
  computed: {
    filteredResults() {
      if (!this.selectedFilter) {
        return this.classificationResults;
      }
      return this.classificationResults.filter(
        (result) => result.classification === this.selectedFilter
      );
    },
    imagesSelected() {
      return this.images.length > 0;
    },
    imageNames() {
      return this.imagesSelected
        ? Array.from(this.images)
            .map((image) => image.name)
            .join("; ")
        : "";
    },
  },
  methods: {
    handleUploadImages() {
      this.images = this.$refs.images.files;
    },
    async submitImages() {
      this.isLoading = true;
      let formData = new FormData();

      for (let i = 0; i < this.images.length; i++) {
        formData.append("file", this.images[i]);
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/upload-images",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        this.classificationResults = Object.values(
          response.data.results
        ).flat();
        this.isLoading = false;
        this.notificationMessage = response.data.message;
        this.downloadLinkCsv = `http://localhost:5000/results.csv`;
        this.downloadLinkGeoJson = `http://localhost:5000/results.geojson`;
        this.updateMapWithResults(this.classificationResults);
      } catch (error) {
        console.error("Error uploading files:", error);
        this.notificationMessage = "Error generating results files";
        this.isLoading = false;
      }
    },
    getCategoryColor(category) {
      switch (category) {
        case "THIS PICTURE HAS OAK WILT":
          return "red";
        case "THERE'S A HIGH CHANCE OF OAK WILTS":
          return "orange";
        case "CHANGES OF COLORS ON TREE LEAVES":
          return "#ffdb58"; // Mustard Yellow
        case "Not an Oak Wilt":
          return "green";
        default:
          return "#333";
      }
    },
    updateMapWithResults(results) {
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });

      const markerColors = {
        "THIS PICTURE HAS OAK WILT": "red",
        "THERE'S A HIGH CHANCE OF OAK WILTS": "orange",
        "CHANGES OF COLORS ON TREE LEAVES": "green",
      };
      const filtered = !this.selectedFilter
        ? results
        : results.filter(
            (result) => result.classification === this.selectedFilter
          );

      filtered.forEach((result) => {
        if (
          result.classification !== "Not an Oak Wilt" &&
          result.latitude &&
          result.longitude
        ) {
          const markerColor = markerColors[result.classification] || "green";
          const popupContent = `
            <div>
              <img src="http://localhost:5000/images/${result.filename}" style="width:100px;"><br>
              <strong>File:</strong> <a href="http://localhost:5000/images/${result.filename}" target="_blank">${result.filename}</a><br>
              <strong>Prediction:</strong> ${result.prediction}<br>
              <strong>Category:</strong> ${result.classification}<br>
              <strong>Latitude:</strong> ${result.latitude}<br>
              <strong>Longitude:</strong> ${result.longitude}<br>
        </div>
          `;

          const markerIcon = L.icon({
            iconUrl: require(`@/assets/${markerColor}.png`),
            iconSize: [25, 38],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          });

          L.marker([result.latitude, result.longitude], { icon: markerIcon })
            .addTo(this.map)
            .bindPopup(popupContent);
        }
      });

      if (filtered.length > 0) {
        const group = new L.featureGroup(
          filtered.map(
            (result) => new L.LatLng(result.latitude, result.longitude)
          )
        );
        this.map.fitBounds(group.getBounds());
      }
    },
    initMap() {
      this.map = L.map("mapid").setView([43.0514, -86.23699], 14.5); // Save map instance to this.map
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Oak Wilts will be shown here",
      }).addTo(this.map);
    },
    sendFeedback(filename, isCorrect) {
      axios
        .post("http://localhost:5000/submit-feedback", {
          filename,
          isCorrect,
        })
        .then((response) => {
          console.log("Feedback submitted:", response.data);
        })
        .catch((error) => {
          console.error("Error submitting feedback:", error);
        });
    },
    downloadCSV() {
      const link = document.createElement("a");
      link.href = this.downloadLinkCsv;
      link.download = "results.csv";
      link.click();
    },
    downloadGeoJSON() {
      const link = document.createElement("a");
      link.href = this.downloadLinkGeoJson;
      link.download = "results.geojson";
      link.click();
    },
    redirectToGeoJSON() {
      window.location.href = 'https://geojson.io/';
    },
  },
};

// eslint-disable-next-line no-unused-vars
function submitMapFeedback(filename, isCorrect) {
  if (vm) {
    vm.sendFeedback(filename, isCorrect);
  }
}
</script>

<style scoped>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.app-container {
  min-height: 100vh;
  text-align: center;
  color: rgb(7, 0, 0);
  background-color: rgb(248, 247, 188);
}

.app-header h1 {
  font-size: 48px;
  font-weight: bold;
}

.row {
  display: flex;
  font-size: 32px;
  font-weight: bold;
  margin: 20px 0;
  text-align: left;
}

.buttoncol {
  flex: 1;
  padding: 10px;
  box-sizing: border-box;
  font-size: 32px;
  border: 4px dashed #575656;
  text-align: center;
}

.column {
  flex: auto;
  padding: 10px;
  box-sizing: border-box;
}

#mapid {
  height: calc(100vh - 120px);
  width: 100%;
}

.full-width-column {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  font-weight: bold;
  font-size: 36px;
}

.classification-row {
  text-align: left;
  margin: 10px 0;
  font-size: 24px;
  font-weight: bold;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.grid-item img {
  width: 100%;
  height: auto;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.image-preview {
  width: 100%;
  max-width: 130px;
  height: auto;
  margin-bottom: 5px;
}

.classification-results {
  font-size: 14px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 5px;
  text-overflow: ellipsis;
  overflow: hidden;
}

.grid-item {
  border: 1px solid #ccc;
  padding: 5px;
  text-overflow: ellipsis;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  max-width: 130px;
  height: auto;
  margin-bottom: 5px;
}

.loading-message {
  font-size: 2em;
  color: #333;
}

.filter-dropdown {
  margin: 10px 0;
  padding: 5px 10px;
  font-size: 16px;
}

.file-upload-button {
  padding: 10px 60px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  background-color: #6fc5e7;
  color: rgb(8, 0, 0);
  border: none;
  border-radius: 4px;
  margin-top: 40px;
}

.file-upload-button:hover {
  background-color: #4cae4c;
}

.mustard-yellow {
  color: #ffdb58;
}

.select-images-button {
  padding: 6px 12px;
  font-size: 14px;
  font-weight: bold;
  background-color: #4cae4c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.select-images-button:hover {
  background-color: #45a049;
}

.file-download-button {
  display: inline-block;
  padding: 10px 60px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  background-color: #4cae4c;
  color: white;
  border: none;
  border-radius: 4px;
  margin-top: 10px;
  text-decoration: none;
  text-align: center;
}

.file-download-button:hover {
  background-color: #45a049;
}

.feedback-button {
  margin-top: 10px;
  margin-right: 5px;
  padding: 5px 15px;
  font-size: 14px;
  cursor: pointer;
  font-weight: bold;
  background-color: #f55c5cce;
  color: white;
  border: none;
  border-radius: 4px;
}

.feedback-button:hover {
  background-color: #f75656;
}
</style>
