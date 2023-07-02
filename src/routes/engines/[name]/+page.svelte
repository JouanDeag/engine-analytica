<script lang="ts">
	import { Grid, Row, Column, DataTable, Button } from 'carbon-components-svelte';
	import { Undo } from 'carbon-icons-svelte';

	export let data;

	const tests = data.tests.map((test) => {
		return {
			id: test.id,
			name: test.name,
			author: test.authorName,
			testBranch: test.testBranch,
			elo: `${test.elo} +/- ${test.eloMargin}`,
			llr: test.llr,
			games: test.wonGames + test.tiedGames + test.lostGames,
			bounds: `${test.eloBounds} ${test.llrBounds}`,
			createdAt: test.createdAt.toISOString().split('.')[0] + 'Z'
		};
	});
</script>

<Grid noGutter padding>
	<Row>
		<Column>
			<div>
				<h1>Viewing {data.engine.name}</h1>
				<p>Developer: {data.engine.developer}</p>
			</div>
		</Column>
	</Row>
	<Row>
		<Column>
			<DataTable
				sortable
				title="Tests for {data.engine.name}"
				headers={[
					{ key: 'name', value: 'Name', sort: false },
					{ key: 'author', value: 'Author' },
					{ key: 'testBranch', value: 'Branch', sort: false },
					{ key: 'elo', value: 'Elo' },
					{ key: 'llr', value: 'LLR' },
					{ key: 'games', value: 'Games run' },
					{ key: 'bounds', value: 'Bounds ' },
					{ key: 'createdAt', value: 'Date' }
				]}
				rows={tests}
			/>
		</Column>
	</Row>
	<Row>
		<Column>
			<Button href="/engines" icon={Undo}>Back to engines</Button>
		</Column>
	</Row>
</Grid>

<style>
</style>
