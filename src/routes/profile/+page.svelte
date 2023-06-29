<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		InlineNotification,
		Grid,
		Row,
		Column,
		TextInput,
		FormGroup,
		Select,
		SelectItem,
		Button
	} from 'carbon-components-svelte';

	export let data;
	export let form;
</script>

{#if form}
	<InlineNotification
		kind={form.success ? 'success' : 'error'}
		title={form.success ? 'Success' : 'Error:'}
		subtitle={form.message}
	/>
{/if}

<Grid noGutter>
	<Row>
		<Column sm={10} md={10} lg={10}>
			<h1>Edit profile</h1>
			<p>Welcome {data.user.username}. You may update your details below.</p>
			<p>Blank means no change</p>
			<br />
			<form method="POST" use:enhance>
				<TextInput placeholder={data.user.userId} disabled labelText="User ID" />
				<TextInput placeholder={data.user.email} labelText="Email" name="email" />
				<TextInput placeholder={data.user.username} labelText="Username" name="username" />
				<Select labelText="Role" placeholder={data.user.role} name="role">
					{#if data.user.role === 'admin'}
						<SelectItem value="admin" text="Admin" />
					{/if}
					<SelectItem value="user" text="User" />
				</Select>
				<Select labelText="Engine" placeholder={data.user.engine} name="engine">
					{#if data.user.engine}
						<SelectItem value={data.user.engine} text={data.user.engine} />
					{/if}
					<SelectItem value="" text="None" />
				</Select>

				<!-- Buttons to submit and reset  -->
				<FormGroup>
					<Button type="submit" kind="primary">Submit</Button>
					<Button type="reset" kind="secondary">Reset</Button>
				</FormGroup>
			</form>
		</Column>

		<Column sm={10} md={10} lg={10} />
	</Row>
</Grid>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
