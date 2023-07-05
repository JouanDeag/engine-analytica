<script lang="ts">
	// Carbon components
	import { Grid, Row, Column, DataTable } from 'carbon-components-svelte';

	// Page data
	export let data;
</script>

<Grid noGutter padding>
	<Row>
		<Column>
			<h1>Audit log</h1>
		</Column>
	</Row>
	<Row>
		<Column>
			<DataTable
				sortable
				title="System audit log"
				headers={[
					{ key: 'id', value: 'Action ID' },
					{ key: 'User.username', value: 'Performer' },
					{ key: 'action', value: 'Action type' },
					{ key: 'target', value: 'Target' },
					{ key: 'targetType', value: 'Target type' },
					{ key: 'createdAt', value: 'Date' }
				]}
				rows={data.audit}
			>
				<svelte:fragment slot="cell" let:cell>
					{#if cell.key === 'createdAt'}
						{cell.value.toISOString().split('.')[0] + 'Z'}
					{:else}
						{cell.value}
					{/if}
				</svelte:fragment>
			</DataTable>
		</Column>
	</Row>
</Grid>

<style>
</style>
