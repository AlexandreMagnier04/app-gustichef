<script lang="ts">
	let { children, data } = $props();
</script>

<header>
	<nav>
		<a href="/">Accueil</a>
		<span>Connecté en tant que {data.user.email}</span>
	</nav>
</header>

<main>
	{@render children()}
</main>
