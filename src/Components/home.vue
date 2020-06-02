<template>
  <div>
    <page-title :heading="heading" :subheading="subheading" :icon="icon"></page-title>
    <div class="row mt-4">
      <div class="col-lg-6 col-xl-3" v-for="(namespace,index) in filteredNamespaces" :key="index">
        <router-link :to="`/namespaces/${namespace}`" style="text-decoration:none; color:inherit;">
          <div class="card mb-3 widget-content">
            <div class="widget-content-wrapper">
              <div class="widget-content-left">
                <div class="widget-superheading text-success">
                  <span>{{ namespace }}</span>
                </div>
              </div>
              <div class="widget-content-right"></div>
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
import { eventBus } from '../EventBus'
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faTrashAlt,
  faCheck,
  faCalendarAlt,
  faAngleDown,
  faAngleUp,
  faTh
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faTrashAlt, faCheck, faAngleDown, faAngleUp, faTh, faCalendarAlt);

export default {
  components: {
    PageTitle,
    "font-awesome-icon": FontAwesomeIcon
  },
  data() {
    return {
      heading: "Teleskope",
      subheading: "Select a Namspace to Start",
      icon: "pe-7s-helm icon-gradient bg-tempting-azure",
      apiService: new ApiService(),
      namespaces: [],
      filteredNamespaces: []
    };
  },
  async beforeMount() {
    this.namespaces = await this.apiService.listNamespace();
    this.filteredNamespaces = this.namespaces;
    eventBus.$on('search',this.onSearch)
  },
  methods: {
    onSearch(keyword) {
      console.log(keyword);
      this.filteredNamespaces = this.namespaces.filter(namespace => namespace.includes(keyword))
    }
  }

};
</script>
