<template>
  <div>
    <page-title
      :heading="$route.params.deployment"
      :subheading="subheading"
      :icon="icon"
      :containers="containersList"
    ></page-title>
    <div class="content">
      <b-row>
        <b-col md="6">
          <b-card title="Running Pods:" v-if="chartValues" class="main-card mb-3">
            <doughnut :chartValues="chartValues"></doughnut>
          </b-card>
        </b-col>
        <div class="col-lg-6 col-xl-6">
          <div class="card mb-3 widget-content">
            <div class="widget-content-wrapper">
              <div class="widget-content-left">
                <div class="widget-heading text-success">Image</div>
                <div class="widget-heading">{{ image }}</div>
              </div>
              <div class="widget-content-right"></div>
            </div>
          </div>

          <div class="divider mt-0" style="margin-bottom: 17px;"></div>
          <div class="card mb-3 widget-content">
            <div class="widget-content-wrapper">
              <div class="widget-content-left">
                <div class="widget-heading text-success">Tag</div>
                <div class="widget-heading">{{ tag }}</div>
              </div>
              <div class="widget-content-right"></div>
            </div>
          </div>

          <div class="divider mt-0" style="margin-bottom: 17px;"></div>
          <div class="card mb-3 widget-content">
            <div class="widget-content-wrapper">
              <div class="widget-content-left">
                <div class="widget-heading">Age</div>
              </div>
              <div class="widget-content-right">
                <div class="widget-numbers text-success">
                  <span>{{ age }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="divider mt-0" style="margin-bottom: 17px;"></div>
          <div class="card mb-3 widget-content">
            <div class="widget-content-wrapper">
              <div class="widget-content-left">
                <div class="widget-heading">Pods Count</div>
              </div>
              <div class="widget-content-right" v-if="podCount">
                <div class="widget-numbers text-success">
                  <span>{{ podCount.current }} / {{ podCount.desired }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-row>

      <b-card v-if="envVars" title="Environment Variables" class="main-card mb-4">
        <div class="scroll-area-lg">
          <VuePerfectScrollbar class="scrollbar-container" v-once>
            <b-table
              :striped="true"
              :bordered="false"
              :outlined="false"
              :small="false"
              :hover="true"
              :dark="false"
              :fixed="false"
              :foot-clone="false"
              :items="envVars"
              :fields="fields"
            ></b-table>
          </VuePerfectScrollbar>
        </div>
      </b-card>

      <div class="main-card mb-4" v-if="log.length">
        <div class="card-hover-shadow-2x card">
          <div class="card-header-tab card-header">
            <div class="card-header-title font-size-lg text-capitalize font-weight-normal">
              <i class="header-icon lnr-lighter icon-gradient bg-amy-crisp"></i>
              Recent Log
            </div>
          </div>
          <div class="scroll-area-lg">
            <VuePerfectScrollbar class="scrollbar-container" v-once>
              <div class="p-4">
                <div
                  class="vertical-time-simple vertical-without-time vertical-timeline vertical-timeline--animate vertical-timeline--one-column"
                >
                  <div
                    class="dot-info vertical-timeline-element"
                    v-for="(line,index) in log"
                    :key="index"
                  >
                    <div>
                      <span class="vertical-timeline-element-icon bounce-in"></span>
                      <div class="vertical-timeline-element-content bounce-in">
                        <h4 class="timeline-title">{{ line }}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </VuePerfectScrollbar>
          </div>
          <!-- <div class="d-block text-center card-footer">
                        <button class="btn-shadow btn-wide btn-pill btn btn-focus">
                            View All Messages
                        </button>
          </div>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PageTitle from "../Layout/Components/PageTitle.vue";
import { eventBus } from "../EventBus";
import doughnut from "../DemoPages/Charts/Chartjs/Doughnut";
import ApiService from "../Services/apiService";
import VuePerfectScrollbar from "vue-perfect-scrollbar";
export default {
  components: {
    PageTitle,
    doughnut,
    VuePerfectScrollbar,
  },
  data: () => ({
    apiService: new ApiService(),
    ws: null,
    subheading: null,
    image: null,
    tag: null,
    age: null,
    chartValues: null,
    fields: ["name", "value"],
    envVars: null,
    podCount: null,
    icon: "pe-7s-helm icon-gradient bg-amy-crisp",
    containerName: "master",
    containersList: [],
    message: {},
    log: [],
  }),
  async mounted() {
    eventBus.$on("containerChanged", this.onContainerChange);
    this.apiService.connectToWebSocket(this.onmessage);
    await this.setInitialFeed();
  },
  beforeDestroyed() {
    this.apiService.disconnectFromWebSocket();
  },
  computed: {},
  methods: {
    getEnvVars(container) {
      return (
        container &&
        container.Envs.map((pair) => {
          const [name, ...valueArray] = pair.split(":");
          return {
            name,
            value: valueArray.join(":"),
          };
        })
      );
    },
    getImage(container) {
      return container && container.Image.split(":")[0];
    },
    getTag(container) {
      return container && container.Image.split(":")[1];
    },
    getAge(msg) {
      return (msg && msg.Age) || "Not Available";
    },
    getSubheading(container) {
      return (container && container.Status) || "Unknown Status";
    },
    getChartValues(msg) {
      return (
        msg && {
          exist: msg.ReplicaCurrent,
          toBeCreated: Math.max(msg.ReplicaDesired - msg.ReplicaCurrent, 0),
          toBeDeleted: Math.max(msg.ReplicaCurrent - msg.ReplicaDesired, 0),
        }
      );
    },
    getPodCount(msg) {
      return (
        msg && {
          current: msg.ReplicaCurrent,
          desired: msg.ReplicaDesired,
        }
      );
    },
    getMasterContainer() {
      return (
        (this.message &&
          this.message.Containers &&
          this.message.Containers.find(
            (container) => container.Name == this.containerName
          )) ||
        this.message.Containers[0]
      );
    },
    getContainersList(msg) {
      return (
        msg &&
        msg.Containers &&
        msg.Containers.map((container) => container.Name)
      );
    },
    async setInitialFeed() {
      const message = await this.apiService.describeDeployment(
        this.$route.params.namespace,
        this.$route.params.deployment
      );
      this.updateFeed(message);
      await this.setLog(this.getMasterContainer());
    },
    updateFeed(message) {
      console.log(message);
      this.message = message;
      this.chartValues = this.getChartValues(message);
      this.podCount = this.getPodCount(message);
      this.containersList = this.getContainersList(message);
      this.age = this.getAge(message);
      const container = this.getMasterContainer(message);
      this.updateContainerAttrs(container);
    },
    async setLog(container) {
      const logString = await this.apiService.getLog(
        this.$route.params.namespace,
        this.$route.params.deployment,
        container.Name
      );
      this.log = logString.split("\n");
    },
    updateContainerAttrs(container) {
      this.image = this.getImage(container);
      this.tag = this.getTag(container);
      this.subheading = this.getSubheading(container);
      this.envVars = this.getEnvVars(container);
    },
    onmessage(message) {
      message.Name === this.$route.params.deployment &&
        this.updateFeed(message);
    },
    onContainerChange(newContainer) {
      this.containerName = newContainer;
      this.updateContainerAttrs(this.getMasterContainer());
      this.setLog(this.getMasterContainer());
    },
  },
};
</script>
