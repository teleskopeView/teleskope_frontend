<template>
  <div>
    <router-link
      :to="`/namespaces/${$route.params.namespace}`"
      style="text-decoration:none; color:inherit;"
    >
      <page-title :heading="$route.params.namespace" :subheading="subheading" :icon="icon"></page-title>
    </router-link>
    <div class="row mt-4">
      <div
        class="col-lg-6 col-xl-6"
        v-for="(desc,deployment,index) in deployments"
        :key="index"
      >
        <router-link
          :to="`/namespaces/${$route.params.namespace}/deployments/${deployment}`"
          style="text-decoration:none; color:inherit;"
        >
          <div class="card mb-3 widget-content">
            <div class="widget-content-wrapper">
              <div class="widget-content-left">
                <div class="widget-superheading">
                  <span>{{ deployment }}</span>
                </div>
                <div class="widget-subheading">
                  <span>{{ desc.imageAndTag }}</span>
                </div>
              </div>
              <div class="widget-content-right">
                <doughnut :chartValues="desc.chartValues" style="width:50px; height:50px"></doughnut>
                <div class="widget-heading text-center">
                  <span>{{ desc.chartValues.exist }} / {{ parseInt(desc.chartValues.exist) + parseInt(desc.chartValues.toBeCreated) }}</span>
                </div>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import PageTitle from "../Layout/Components/PageTitle.vue";
import ApiService from "../Services/apiService";

import doughnut from "../DemoPages/Charts/Chartjs/Doughnut";

export default {
  components: {
    PageTitle,
    doughnut
  },
  data: () => ({
    apiService: new ApiService(),
    heading: "",
    subheading: "",
    icon: "pe-7s-helm icon-gradient bg-plum-plate",
    deployments: {}
  }),
  async beforeMount() {
    await this.createDeploymentsFeed();
    this.subheading = `${Object.keys(this.deployments).length ||
      0} Deployments:`;
    await this.createChartsFeed();
    this.apiService.connectToWebSocket(this.upadteFeed);
  },
  beforeDestroyed() {
    this.apiService.disconnectFromWebSocket();
  },
  methods: {
    upadteFeed(msg) {
      if (
        msg.Namespace === this.$route.params.namespace &&
        this.deployments[msg.Name]
      ) {
        const newChartvalues = {
          exist: msg.ReplicaCurrent,
          toBeCreated: Math.max(msg.ReplicaDesired - msg.ReplicaCurrent, 0)
        };
        this.deployments[msg.Name].chartValues = newChartvalues;
        this.deployments[msg.Name].imageAndTag = this.getImageAndTag(msg);
        this.$forceUpdate();
      }
    },
    async createDeploymentsFeed() {
      const deploymentsList = await this.apiService.listDeploymentsAt(
        this.$route.params.namespace
      );
      deploymentsList.forEach(dep => {
          this.deployments[dep] = {};
        this.deployments[dep].chartValues = {
          exist: 0,
          toBeCreated: 1
        };
      });
    },
    getMasterContainer(msg) {
      return (
        msg &&
        msg.Containers &&
        msg.Containers.find(container => container.Name == "master") || msg.Containers[0]
      );
    },
    getImage(container) {
        const fullImage = container && container.Image.split(":")[0];
        const lastPart = fullImage && fullImage.split('/')[1] 
        return lastPart || fullImage
    },
    getTag(container) {
        const tag = container && container.Image.split(":")[1] || ''
        const prefix = tag.length > 6 ? 'xxxxx' : '';
        return prefix + tag.slice(-6);
    },
    getImageAndTag(msg) {
        const master = this.getMasterContainer(msg);
        return this.getImage(master) && `${this.getImage(master)}:${this.getTag(master)}` || 'Image Not Avaliabe'
    },
    async createChartsFeed() {
      Object.keys(this.deployments).forEach(async dep => {
        const depDescription = await this.apiService.describeDeployment(
          this.$route.params.namespace,
          dep
        );
        this.upadteFeed(depDescription);
      });
    }
  }
};
</script>
