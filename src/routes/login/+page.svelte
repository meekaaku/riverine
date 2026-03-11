<script lang="ts">
	import { enhance } from '$app/forms';

	interface Props {
		data: { version: number };
	}
	let { data }: Props = $props();
	let isSubmitting = $state(false);
</script>

<div class="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-8">
	<div class="w-full max-w-sm">
		<h1 class="mb-8 text-center text-2xl font-semibold text-stone-800">Riverine Boahiyaavahi Portal</h1>
		<form
			method="POST"
			class="space-y-4"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
		>
			<div>
				<label for="username" class="mb-1 block text-sm font-medium text-stone-600">Username</label>
				<input
					id="username"
					name="username"
					type="text"
					autocomplete="username"
					required
					class="w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
					placeholder="Enter username"
				/>
			</div>
			<div>
				<label for="password" class="mb-1 block text-sm font-medium text-stone-600">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
					class="w-full rounded-lg border border-stone-300 px-4 py-3 text-base focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
					placeholder="Enter password"
				/>
			</div>
			<button
				type="submit"
				disabled={isSubmitting}
				class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-3 text-base font-medium text-white hover:bg-stone-800 active:bg-stone-700 disabled:opacity-70 disabled:cursor-not-allowed"
			>
				{#if isSubmitting}
					<svg class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Signing in…
				{:else}
					Sign in
				{/if}
			</button>
		</form>
		<p class="mt-6 text-center text-xs text-stone-400">v{data.version}</p>
	</div>
</div>
