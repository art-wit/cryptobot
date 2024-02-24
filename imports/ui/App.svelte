<script>
  import { Meteor } from "meteor/meteor";
  
  let counter = 0;
  const addToCounter = () => {
    counter += 1;
  }
  
  let subIsReady = true;

</script>


<div class="container">
  <h1>Welcome to Meteor!</h1>

  <button on:click={addToCounter}>Click Me</button>
  <p>You've pressed the button {counter} times.</p>

  <h2>Learn Meteor!</h2>
  {#if subIsReady}
    <ul>
        <li>Test</li>
    </ul>
  {:else}
    <div>Loading ...</div>
  {/if}
  <h2>Typescript ready</h2>
  <p>Just add lang="ts" to .svelte components.</p>
</div>
