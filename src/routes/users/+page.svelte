<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Grid,
		Row,
		Column,
		DataTable,
		OverflowMenu,
		OverflowMenuItem,
		Modal,
		Select,
		SelectItem,
		TextInput,
		Button,
		FormGroup,
		InlineNotification
	} from 'carbon-components-svelte';
	import type { DataTableRow } from 'carbon-components-svelte/types/DataTable/DataTable.svelte.js';
	import { CheckmarkOutline, TrashCan, Warning } from 'carbon-icons-svelte';

	export let data;
	export let form;

	let deleteModalOpen = false;
	let editModalOpen = false;
	let disableModalOpen = false;

	let selectedUser = data.user;

	$: if (form && form.success) {
		deleteModalOpen = false;
		editModalOpen = false;
		disableModalOpen = false;
	}

	const handleGenericModalOpen = (row: DataTableRow) => {
		form = null;
		selectedUser = row;
	};
</script>

<Grid noGutter>
	<Row>
		<Column>
			<h1>Administrate users</h1>
			<br />

			<DataTable
				title="Users"
				description="All users in the system"
				sortable
				headers={[
					{ key: 'username', value: 'Username' },
					{ key: 'email', value: 'Email' },
					{ key: 'role', value: 'Role' },
					{ key: 'engineName', value: 'Engine' },
					{ key: 'disabled', value: 'Disabled', sort: false },
					{ key: 'overflow', empty: true }
				]}
				rows={data.users}
			>
				<svelte:fragment slot="cell" let:cell let:row>
					{#if cell.key === 'overflow'}
						<OverflowMenu flipped>
							<OverflowMenuItem
								text="Edit"
								on:click={() => {
									handleGenericModalOpen(row);
									editModalOpen = true;
								}}
							/>
							<OverflowMenuItem
								text={row.disabled ? 'Enable' : 'Disable'}
								on:click={() => {
									handleGenericModalOpen(row);
									disableModalOpen = true;
								}}
							/>
							<OverflowMenuItem
								danger
								text="Delete"
								on:click={() => {
									handleGenericModalOpen(row);
									deleteModalOpen = true;
								}}
							/>
						</OverflowMenu>
					{:else if cell.key === 'disabled'}
						<Button
							disabled
							kind="ghost"
							size="small"
							icon={cell.value ? Warning : CheckmarkOutline}
							iconDescription={cell.value ? 'Disabled' : 'Enabled'}
						/>
					{:else}
						{cell.value}
					{/if}
				</svelte:fragment>
			</DataTable>
		</Column>
	</Row>
</Grid>

<Modal
	danger
	modalHeading="{selectedUser.disabled ? 'Enable' : 'Disable'} user"
	hasForm
	open={disableModalOpen}
	on:close={() => (disableModalOpen = false)}
	passiveModal
>
	{#if form}
		<InlineNotification
			kind={form.success ? 'success' : 'error'}
			title={form.success ? 'Success' : 'Error:'}
			subtitle={form.message}
		/>
	{/if}
	<p>Are you sure you want to {selectedUser.disabled ? 'enable' : 'disable'} this user?</p>
	<br />
	<form action="?/{selectedUser.disabled ? 'enable' : 'disable'}" method="POST" use:enhance>
		<FormGroup noMargin>
			{#key form}
				<input type="hidden" name="id" value={selectedUser.id} />
			{/key}
			<Button kind="secondary">Cancel</Button>
			<Button
				type="submit"
				kind={selectedUser.disabled ? 'primary' : 'danger'}
				icon={CheckmarkOutline}>{selectedUser.disabled ? 'Enable' : 'Disable'}</Button
			>
		</FormGroup>
	</form>
</Modal>

<Modal
	danger
	modalHeading="Delete user"
	hasForm
	open={deleteModalOpen}
	on:close={() => (deleteModalOpen = false)}
	passiveModal
>
	{#if form}
		<InlineNotification
			kind={form.success ? 'success' : 'error'}
			title={form.success ? 'Success' : 'Error:'}
			subtitle={form.message}
		/>
	{/if}
	<p>Are you sure you want to delete this user?</p>
	<p>This is a permanent action and cannot be undone.</p>
	<br />
	<form action="?/delete" method="POST" use:enhance>
		<FormGroup noMargin>
			{#key form}
				<input type="hidden" name="id" value={selectedUser.id} />
			{/key}
			<Button kind="secondary">Cancel</Button>
			<Button type="submit" kind="danger" icon={TrashCan}>Delete</Button>
		</FormGroup>
	</form>
</Modal>

<Modal
	modalHeading="Edit user"
	hasForm
	open={editModalOpen}
	on:close={() => (editModalOpen = false)}
	passiveModal
>
	{#key form}
		{#if form}
			<InlineNotification
				kind={form.success ? 'success' : 'error'}
				title={form.success ? 'Success' : 'Error:'}
				subtitle={form.message}
			/>
		{/if}

		<form method="POST" action="?/edit" use:enhance>
			<input type="hidden" name="id" value={selectedUser.id} />
			<TextInput placeholder={selectedUser.id} labelText="User ID" disabled />
			<TextInput placeholder={selectedUser.email} labelText="Email" name="email" />
			<TextInput placeholder={selectedUser.username} labelText="Username" name="username" />
			<Select labelText="Role" selected={selectedUser.role} name="role">
				<SelectItem value="admin" text="Admin" />
				<SelectItem value="user" text="User" />
			</Select>
			<Select
				labelText="Engine"
				placeholder={selectedUser.engine}
				name="engine"
				selected={selectedUser.engineName || 'none'}
			>
				{#each data.engines as engine}
					<SelectItem value={engine.name} text={engine.name} />
				{/each}
				<SelectItem value="none" text="None" />
			</Select>
			<FormGroup noMargin>
				<Button kind="secondary" on:click={() => (editModalOpen = false)}>Cancel</Button>
				<Button type="submit" kind="primary" icon={CheckmarkOutline}>Save</Button>
			</FormGroup>
		</form>
	{/key}
</Modal>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
