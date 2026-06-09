<script lang="ts">
  import '../app.css';
</script>

<main>
  <h1 class="title"><a href="/">Cantar Ball</a></h1>
  <slot />
</main>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #1a1a2e;
    color: #e0e0e0;
    min-height: 100vh;
  }

  main {
    max-width: 960px;
    margin: 0 auto;
    padding: 1rem;
  }

  .title {
    text-align: center;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    letter-spacing: 0.1em;
  }

  .title a {
    color: #e94560;
    text-decoration: none;
  }

  .title a:hover {
    color: #ff6b81;
  }
</style>
