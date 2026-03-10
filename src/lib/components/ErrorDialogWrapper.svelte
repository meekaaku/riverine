<script lang="ts">
	import { page } from '$app/stores';
	import ErrorDialog from './ErrorDialog.svelte';
	import { errorDialog } from '$lib/stores/errorDialog';

	const formResult = $derived($page.form as
		| { error?: string; details?: string; context?: string }
		| { type: string; data?: { error?: string; details?: string; context?: string } }
		| undefined);

	$effect(() => {
		const data: { error?: string; details?: string; context?: string } | undefined =
			formResult && 'data' in formResult && formResult.data
				? formResult.data
				: formResult && 'error' in formResult
					? formResult
					: undefined;
		const err = data?.error;
		if (err) {
			errorDialog.set({
				message: err,
				details: data?.details,
				context: data?.context,
				timestamp: new Date().toISOString()
			});
		}
	});
</script>

{#if $errorDialog}
	<ErrorDialog
		message={$errorDialog.message}
		details={$errorDialog.details}
		context={$errorDialog.context}
		timestamp={$errorDialog.timestamp}
		onClose={() => errorDialog.set(null)}
	/>
{/if}
