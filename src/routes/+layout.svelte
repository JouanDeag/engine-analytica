<script lang="ts">
	import 'carbon-components-svelte/css/all.css';
	import {
		Header,
		HeaderUtilities,
		HeaderAction,
		HeaderActionLink,
		HeaderPanelLinks,
		HeaderPanelDivider,
		HeaderPanelLink,
		SideNav,
		SideNavItems,
		SideNavMenu,
		SideNavLink,
		SkipToContent,
		Content,
		Theme,
		Button,
		HeaderSearch
	} from 'carbon-components-svelte';
	import type { CarbonTheme } from 'carbon-components-svelte/types/Theme/Theme.svelte';
	import {
		SettingsAdjust,
		UserAvatarFilledAlt,
		Sun,
		Moon,
		AddAlt,
		BareMetalServer_02,
		Catalog,
		Events,
		Home,
		Information,
		MisuseOutline,
		QuadrantPlot,
		UserAdmin,
		Warning
	} from 'carbon-icons-svelte';

	import { page } from '$app/stores';
	import { capitalize } from '$lib/strings';
	import { invalidateAll } from '$app/navigation';

	$: route = capitalize($page.url.pathname.split('/')[1]) || 'Home';

	export let data;

	let isSideNavOpen = false;
	let isOpen1 = false;

	const searchData = [
		{
			href: '/',
			text: 'Kubernetes Service',
			description:
				'Deploy secure, highly available apps in a native Kubernetes experience. IBM Cloud Kubernetes Service creates a cluster of compute hosts and deploys highly available containers.'
		},
		{
			href: '/',
			text: 'Red Hat OpenShift on IBM Cloud',
			description:
				'Deploy and secure enterprise workloads on native OpenShift with developer focused tools to run highly available apps. OpenShift clusters build on Kubernetes container orchestration that offers consistency and flexibility in operations.'
		},
		{
			href: '/',
			text: 'Container Registry',
			description:
				'Securely store container images and monitor their vulnerabilities in a private registry.'
		},
		{
			href: '/',
			text: 'Code Engine',
			description: 'Run your application, job, or container on a managed serverless platform.'
		}
	];

	let searchString = '';
	let lowerCaseValue = searchString.toLowerCase();

	$: lowerCaseValue = searchString.toLowerCase();
	$: results =
		searchString.length > 0
			? searchData.filter((item) => {
					return (
						item.text.toLowerCase().includes(lowerCaseValue) ||
						item.description.includes(lowerCaseValue)
					);
			  })
			: [];

	let theme: CarbonTheme = 'g10';

	function toggleTheme() {
		theme = theme === 'g10' ? 'g90' : 'g10';
	}
</script>

<svelte:head>
	<title>Engine Analytica | {route}</title>
</svelte:head>

<Header href="/" company="Engine" platformName="Analytica" bind:isSideNavOpen>
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>
	<HeaderUtilities>
		{#if data.session}
			<HeaderSearch bind:value={searchString} {results} />
		{/if}

		<Button
			kind="secondary"
			iconDescription="Toggle dark mode"
			icon={theme === 'g10' ? Sun : Moon}
			on:click={toggleTheme}
		/>

		<Theme persist bind:theme />

		{#if data.session}
			<HeaderActionLink href="/settings" aria-label="Settings" icon={SettingsAdjust} />
		{/if}

		<HeaderAction bind:isOpen={isOpen1} icon={UserAvatarFilledAlt} closeIcon={UserAvatarFilledAlt}>
			<HeaderPanelLinks>
				{#if data.session}
					<HeaderPanelDivider>My Engine</HeaderPanelDivider>
					<HeaderPanelLink href="/">View history</HeaderPanelLink>
					<HeaderPanelLink href="/">Modify configuration</HeaderPanelLink>
				{/if}
				<HeaderPanelDivider>My Profile</HeaderPanelDivider>

				{#if data.session}
					<HeaderPanelLink href="/profile">Update profile</HeaderPanelLink>
					<HeaderPanelLink href="/">Change password</HeaderPanelLink>
					<HeaderPanelLink data-sveltekit-preload-data="tap" on:click={invalidateAll} href="/logout"
						>Log out</HeaderPanelLink
					>
				{:else}
					<HeaderPanelLink href="/login">Log in</HeaderPanelLink>
					<HeaderPanelLink href="/register">Register</HeaderPanelLink>
				{/if}
			</HeaderPanelLinks>
		</HeaderAction>
	</HeaderUtilities>
</Header>

{#if data.session}
	<SideNav bind:isOpen={isSideNavOpen} rail>
		<SideNavItems>
			<SideNavLink icon={Home} href="/" text="Home" />
			<SideNavLink icon={AddAlt} href="/" text="Create test" />
			<SideNavLink icon={BareMetalServer_02} href="/" text="List workers" />
			<SideNavMenu icon={Information} text="Logs">
				<SideNavLink icon={MisuseOutline} href="/" text="Errors" />
				<SideNavLink icon={Warning} href="/" text="Events" />
			</SideNavMenu>

			{#if data.user.role === 'admin'}
				<SideNavMenu icon={UserAdmin} text="Admin">
					<SideNavLink icon={Events} href="/users" text="Users" />
					<SideNavLink icon={QuadrantPlot} href="/" text="Engines" />
					<SideNavLink icon={Catalog} href="/" text="Audit log" />
				</SideNavMenu>
			{/if}
		</SideNavItems>
	</SideNav>
{/if}

<Content>
	<slot />
</Content>
