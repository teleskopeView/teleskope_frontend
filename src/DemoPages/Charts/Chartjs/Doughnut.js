import {Doughnut} from 'vue-chartjs'

export default {
  extends: Doughnut,
  props: {
    chartValues: {
      type: Object,
      required: true
    }
  },
  watch: { 
    chartValues: function(newVal, oldVal) { // watch it
      this.render(newVal)
    }
  },
  methods: {
    getColor(toBeCreated) {
      const warn = '#ef869e';
      const ok = '#4dd6a7';
      return toBeCreated ? warn : ok;
    },
render(chartValues) {
  this.renderChart({
    labels: Object.keys(chartValues),
    datasets: [{
      data: Object.values(chartValues),
      backgroundColor: [
        // '#8dace7',
        this.getColor(chartValues.toBeCreated),
        '#eeeeee',
        // '#ef869e'
      ],
      hoverBackgroundColor: [
        '#4dd6a7',
        // '#7097e1',
        '#eeeeee',
        // '#eb6886'
      ]
    }]
},{responsive: true, maintainAspectRatio: false,animation:false, legend: false})
}
  },
  mounted() {
    this.render(this.chartValues)

  }
}
