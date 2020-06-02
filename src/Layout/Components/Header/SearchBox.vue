<template>
    <div>
        <div class="search-wrapper" v-bind:class="{ active: searchOpen }">
            <div class="input-holder">
                <input type="text" class="search-input" placeholder="Type to search" @keyup="onChange"/>
                <button class="search-icon" v-on:click="searchOpen = !searchOpen"><span/></button>
            </div>
            <button class="close" v-on:click="searchOpen = !searchOpen"/>
        </div>
    </div>
</template>

<script>
import { eventBus } from '../../../EventBus'
    export default {
        data() {
            return {
                searchOpen: false,
            }
        },
        methods: {
            onChange(evt) {
                eventBus.$emit('search', evt.target.value);
            }
        }
    }
</script>

