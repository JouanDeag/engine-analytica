<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Checkbox,
		Button,
		TextInput,
		PasswordInput,
		Grid,
		Row,
		Column,
		Link,
		InlineNotification
	} from 'carbon-components-svelte';
	import { ArrowRight } from 'carbon-icons-svelte';

	export let form;

	let invalidUsername = {
		error: false,
		message: 'Invalid username'
	};
	let invalidPassword = {
		error: false,
		message: 'Your password does not meet the requirements'
	};

	$: {
		if (form && form.errors) {
			invalidUsername.error = form.errors.username;

			invalidPassword.error = form.errors.password;
		}
	}

	let submitting = false;

	const handleSubmit = () => {
		submitting = true;
	};

	$: if (form && form.errors) {
		submitting = false;
	}
</script>

{#if form}
	<InlineNotification
		kind={form.success ? 'success' : 'warning'}
		title={form.success ? 'Success:' : 'Warning:'}
		subtitle={form.message || 'Invalid username or password'}
	/>
{/if}

<Grid noGutter>
	<Row>
		<Column sm={10} md={8} lg={7}>
			<h1>Login</h1>
			<Column padding noGutterLeft>
				<form method="POST" use:enhance on:submit={handleSubmit}>
					<TextInput
						bind:invalid={invalidUsername.error}
						name="username"
						labelText="Username"
						placeholder="Enter a username"
					/>
					<PasswordInput
						bind:invalid={invalidUsername.error}
						name="password"
						labelText="Password"
						placeholder="Enter password..."
					/>
					<Checkbox name="remember" labelText="Remember me" />
					<Button icon={ArrowRight} skeleton={submitting} type="submit" style="width: fit-content;"
						>Login</Button
					>
				</form>
			</Column>
			<Link href="/register">Don't have an account? Register</Link>
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
