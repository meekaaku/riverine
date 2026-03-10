<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ErrorDialogWrapper from '$lib/components/ErrorDialogWrapper.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ErrorDialogWrapper />
{@render children()}
