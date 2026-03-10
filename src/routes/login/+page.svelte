<script lang="ts">
	let { form } = $props();
</script>

<div class="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-8">
	<div class="w-full max-w-sm">
		<h1 class="mb-8 text-center text-2xl font-semibold text-stone-800">Sign in</h1>
		<form method="POST" class="space-y-4">
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
			{#if form?.error}
				<p class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{form.error}</p>
			{/if}
			<button
				type="submit"
				class="w-full rounded-lg bg-stone-900 px-4 py-3 text-base font-medium text-white hover:bg-stone-800 active:bg-stone-700"
			>
				Sign in
			</button>
		</form>
	</div>
</div>
