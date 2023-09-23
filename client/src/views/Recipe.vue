<template>
    <div id="card">
        <div class="main">
            <img class="thumbnail" v-bind:src='thumbnail' alt="Thumbnail Image">
            <div class="title">{{ title }}</div>
            <div class="tags" v-for="tag in tags" v-bind:key="tag">
                <div class="tag">{{ tag }}</div>
            </div>
        </div>
    </div>
</template>

<style>
.main{
    min-height: 30vw;
    height: auto;
    width: 20vw;
    margin-left: 10%;
    margin-right: 10%;
    margin-top: 5%;
    background-color: antiquewhite;
    outline-width: 2px;
    outline-color: rgb(159, 159, 159);
    outline-style:solid;
    border-radius: 5px;
    position: relative;
}

.main:hover {
    outline-color: rgb(8, 8, 8);
}

.title {
    text-align: left;
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
    font-weight: bold;
    font-size: 2vw;
    margin-left: 3%;
    margin-right: 5%;
}

.title:hover {
    text-decoration: underline black;
}

.thumbnail {
    width: 70%;
    aspect-ratio: 1/1;
    object-fit: cover;
    object-position: center;
    border-radius: 0.65vw;
}

.thumbnail:hover{
    outline-width: 2px;
    outline-color: rgb(27, 18, 21);
    outline-style: inset;
}

.tag {
    text-align: left;
}

.tags {
    display: inline-block;
    overflow-wrap: break-word;
    background-color: rgb(145, 145, 239);
    font-size: 1.5vw;
    padding: 0.325vw;
    margin-left: 1vw;
    margin-right: 0.65vw;
    margin-bottom: 1vw;
    border-radius: 1rem;
    cursor: pointer;
    outline-width: 2px;
    outline-color: rgb(27, 18, 21);
    outline-style: solid;
}
.tags:hover {
    background-color: rgb(98, 98, 221);
}

</style>

<script>
export default {
    el: '#card',
    methods: {
        onHover() {
        }
    },
    data() {
        return {
            title: 'Kitsune Chan',
            thumbnail: 'https://mangadex.org/covers/a914a65b-27ed-4665-9767-87396a00ea6b/9298804f-54e7-495e-afcb-70fdd7d25bf0.jpg',
            description: 'df',
            tags: ['tag1', 'tag22', 'tag333', 'tag4444', 'tag55555']
        }
    }
}
</script>
