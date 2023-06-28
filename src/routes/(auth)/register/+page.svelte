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

	let invalidEmail = {
		error: false,
		message: 'The supplied email is invalid'
	};
	let invalidUsername = {
		error: false,
		message: 'Invalid username'
	};
	let password = '';
	let invalidPassword = {
		error: false,
		message: 'Your password does not meet the requirements'
	};
	let confirmPassword = '';
	let invalidConfirmPassword = {
		error: false,
		message: 'Your passwords do not match'
	};

	$: {
		if (form && form.errors) {
			invalidEmail.error = form.errors.email;

			invalidUsername.error = form.errors.username;

			invalidPassword.error = form.errors.password;

			invalidConfirmPassword.error = form.errors.confirmPassword;
			if (password !== confirmPassword) {
				invalidConfirmPassword.message = 'Passwords do not match';
			}
		}
	}
</script>

{#if form && !form.success && form.message}
	<InlineNotification
		kind={form.success ? 'success' : 'warning'}
		title={form.success ? 'Success:' : 'Warning:'}
		subtitle={form.message}
	/>
{/if}

<Grid noGutter>
	<Row>
		<Column sm={10} md={8} lg={7}>
			<h1>Register</h1>
			<Column padding noGutterLeft>
				<form method="POST" use:enhance>
					<TextInput
						bind:invalid={invalidEmail.error}
						invalidText={invalidEmail.message}
						type="email"
						name="email"
						labelText="Email"
						placeholder="Enter your email"
					/>
					<TextInput
						bind:invalid={invalidUsername.error}
						invalidText={invalidUsername.message}
						name="username"
						labelText="Username"
						placeholder="Enter a username"
					/>
					<PasswordInput
						bind:invalid={invalidPassword.error}
						invalidText={invalidPassword.message}
						helperText="Your password should be hard to guess"
						labelText="Password"
						placeholder="Enter password..."
						name="password"
					/>
					<PasswordInput
						bind:invalid={invalidConfirmPassword.error}
						invalidText={invalidConfirmPassword.message}
						labelText="Confirm Password"
						placeholder="Confirm password..."
						name="confirmPassword"
					/>
					<div>
						<Checkbox name="terms" value="y" labelText="I accept the terms & conditions" />
						{#if form && form.errors.terms}
							<span>Required</span>
						{/if}
					</div>

					<Button icon={ArrowRight} type="submit" style="width: fit-content;">Register</Button>
				</form>
			</Column>
			<Link href="/login">Already have an account? Login</Link>
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
	span {
		color: var(--cds-text-error, #da1e28);
		font-size: 0.75rem;
	}
</style>
