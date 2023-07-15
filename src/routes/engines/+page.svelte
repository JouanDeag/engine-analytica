<script lang="ts">
	// Form enhancer
	import { enhance } from '$app/forms';

	// Carbon components
	import {
		Grid,
		Row,
		Column,
		DataTable,
		Toolbar,
		ToolbarContent,
		Button,
		ToolbarSearch,
		OutboundLink,
		Modal,
		InlineNotification,
		FormGroup,
		TextInput,
		Select,
		SelectItem
	} from 'carbon-components-svelte';

	// Icons
	import { Add, ArrowRight } from 'carbon-icons-svelte';

	// Data
	export let data;
	export let form;

	// Search bar
	let search = '';

	// Results
	$: results = data.engines
		.filter((engine) => engine.name.toLowerCase().includes(search.toLowerCase()))
		.map((engine) => {
			return {
				id: engine.id,
				name: engine.name,
				developer: engine.developer,
				tests: engine.Tests.length,
				games: engine.Tests.map((test) => {
					return test.wonGames + test.tiedGames + test.lostGames;
				}).reduce((partialSum, a) => partialSum + a, 0)
			};
		});

	// State for modal
	let addModalOpen = false;

	// Form enhancer
	$: if (form && form.success) {
		addModalOpen = false;
	}
</script>

<Grid noGutter>
	<Row>
		<Column>
			{#if form && form.success}
				<InlineNotification kind="success" title="Success:" subtitle={form.message} />
			{/if}
			<h1>Engines</h1>
			<br />
			<DataTable
				sortable
				title="Engines"
				description="All engines added"
				headers={[
					{ key: 'name', value: 'Name' },
					{ key: 'developer', value: 'Developer' },
					{ key: 'tests', value: 'Tests run' },
					{ key: 'games', value: 'Games run' },
					{ key: 'delete', empty: true }
				]}
				rows={results}
			>
				<Toolbar>
					<ToolbarContent>
						<ToolbarSearch bind:value={search} />
						<Button icon={Add} on:click={() => (addModalOpen = true)}>Add engine</Button>
					</ToolbarContent>
				</Toolbar>
				<svelte:fragment slot="cell" let:cell let:row>
					{#if cell.key === 'developer'}
						<OutboundLink href="https://github.com/{cell.value}">{cell.value}</OutboundLink>
					{:else if cell.key === 'delete'}
						<Button
							kind="tertiary"
							iconDescription="Delete"
							icon={ArrowRight}
							size="small"
							href="/engines/{row.name}"
						>
							View
						</Button>
					{:else}
						{cell.value}
					{/if}
				</svelte:fragment>
			</DataTable>
		</Column>
	</Row>
</Grid>

<Modal
	modalHeading="Add engine"
	open={addModalOpen}
	on:close={() => (addModalOpen = false)}
	hasForm
	passiveModal
>
	{#if form}
		<InlineNotification
			kind={form.success ? 'success' : 'error'}
			title={form.success ? 'Success' : 'Error:'}
			subtitle={form.message}
		/>
	{/if}

	<form method="POST" use:enhance>
		<TextInput
			name="name"
			labelText="Name"
			placeholder="MyEngine"
			helperText="Display name of the engine"
		/>
		<TextInput
			name="developer"
			labelText="Developer"
			placeholder="JouanDeag"
			helperText="GitHub username of the primary developer"
		/>
		<Select name="user" labelText="User" selected="none" helperText="You can add more users later">
			<SelectItem value="none" text="None" />
			{#each data.users as user}
				<SelectItem value={user.username} text={user.username} />
			{/each}
		</Select>
		<FormGroup noMargin>
			<Button kind="secondary">Cancel</Button>
			<Button type="submit" kind="primary" icon={Add}>Add engine</Button>
		</FormGroup>
	</form>
</Modal>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
