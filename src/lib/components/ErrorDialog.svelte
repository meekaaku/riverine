<script lang="ts">
	interface Props {
		message: string;
		details?: string;
		context?: string;
		timestamp?: string;
		onClose: () => void;
	}
	let { message, details, context, timestamp, onClose }: Props = $props();

	let copied = $state(false);

	function copyToClipboard() {
		const text = [
			'Error',
			'---',
			message,
			context ? `\nContext: ${context}` : '',
			timestamp ? `\nTime: ${timestamp}` : '',
			details ? `\n\nDetails:\n${details}` : ''
		]
			.filter(Boolean)
			.join('');
		navigator.clipboard.writeText(text).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	function handleBackdropClick(e: MouseEvent) {
		if ((e.target as HTMLElement).hasAttribute('data-backdrop')) {
			onClose();
		}
	}
</script>

<div
	data-backdrop
	role="dialog"
	aria-modal="true"
	aria-labelledby="error-dialog-title"
	tabindex="-1"
	class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
	onclick={handleBackdropClick}
	onkeydown={(e) => e.key === 'Escape' && onClose()}
>
	<div class="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl border border-red-200 bg-white shadow-2xl">
		<div class="flex items-center justify-between gap-4 border-b border-red-100 bg-red-50 px-4 py-3">
			<h2 id="error-dialog-title" class="text-lg font-semibold text-red-800">Error</h2>
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={copyToClipboard}
					class="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
				>
					{copied ? 'Copied!' : 'Copy'}
				</button>
				<button
					type="button"
					onclick={onClose}
					class="rounded-lg p-1.5 text-red-600 hover:bg-red-100"
					aria-label="Close"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
		<div class="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
			<p class="text-stone-800 font-medium">{message}</p>
			{#if context}
				<div>
					<p class="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Context</p>
					<p class="text-sm text-stone-600 font-mono">{context}</p>
				</div>
			{/if}
			{#if timestamp}
				<p class="text-xs text-stone-500">Occurred at: {timestamp}</p>
			{/if}
			{#if details}
				<div>
					<p class="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Technical details</p>
					<pre class="overflow-x-auto rounded-lg bg-stone-100 p-3 text-xs text-stone-700 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">{details}</pre>
				</div>
			{/if}
		</div>
		<div class="border-t border-stone-100 px-4 py-3">
			<button
				type="button"
				onclick={onClose}
				class="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
			>
				Close
			</button>
		</div>
	</div>
</div>
