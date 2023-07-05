<script lang="ts">
	// Carbon components
	import {
		Grid,
		Row,
		Column,
		DataTable,
		Toolbar,
		ToolbarContent,
		ToolbarSearch
	} from 'carbon-components-svelte';

	// Page data
	export let data;

	// State
	let searchString = '';

	$: auditEvents = data.audit.filter((entry) => {
		if (
			entry.id.includes(searchString) ||
			entry.action.includes(searchString) ||
			entry.target.includes(searchString) ||
			entry.performer.includes(searchString)
		) {
			return true;
		}

		return false;
	});
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
				sortKey="createdAt"
				sortDirection="descending"
				title="System audit log"
				headers={[
					{ key: 'id', value: 'Action ID' },
					{ key: 'performer', value: 'Performer' },
					{ key: 'action', value: 'Action type' },
					{ key: 'target', value: 'Target' },
					{ key: 'targetType', value: 'Target type' },
					{ key: 'actionResult', value: 'Result' },
					{ key: 'clientAddress', value: 'IP' },
					{
						key: 'createdAt',
						value: 'Date',
						display: (date) => date.toISOString().split('.')[0] + 'Z'
					}
				]}
				rows={auditEvents}
			>
				<Toolbar>
					<ToolbarContent>
						<ToolbarSearch bind:value={searchString} />
					</ToolbarContent>
				</Toolbar>
			</DataTable>
		</Column>
	</Row>
</Grid>

<style>
</style>
