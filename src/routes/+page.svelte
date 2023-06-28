<script lang="ts">
	import { Grid, Column, Button } from 'carbon-components-svelte';
	import { Locked } from 'carbon-icons-svelte';

	export let data;
</script>

<Grid noGutter>
	{#if data.session}
		<h1>hello there</h1>
	{:else}
		<Column noGutterLeft>
			<h2>401</h2>
			<h1>Unauthorized</h1>
			<Button icon={Locked} href="/login">Login</Button>
		</Column>
	{/if}
</Grid>
