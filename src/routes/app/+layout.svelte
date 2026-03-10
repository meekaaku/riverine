<script lang="ts">
	interface Props {
		data: { user?: { id: number; username: string; name: string } };
		children: import('svelte').Snippet;
	}
	let { data, children }: Props = $props();
	let dropdownOpen = $state(false);

	$effect(() => {
		if (!dropdownOpen) return;
		const handler = (e: MouseEvent) => {
			const target = e.target as Node;
			if (!document.querySelector('.user-dropdown')?.contains(target) && !document.querySelector('.user-trigger')?.contains(target)) {
				dropdownOpen = false;
			}
		};
		document.addEventListener('click', handler);
		return () => document.removeEventListener('click', handler);
	});
</script>

<div class="container mx-auto">
	<header class="sticky top-0 z-20 flex items-center justify-end border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
		<div class="relative">
			<button
				type="button"
				class="user-trigger inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
				onclick={() => (dropdownOpen = !dropdownOpen)}
				aria-expanded={dropdownOpen}
				aria-haspopup="true"
			>
				<span>{data.user?.name ?? data.user?.username ?? 'User'}</span>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform {dropdownOpen ? 'rotate-180' : ''}">
					<path d="M6 9l6 6 6-6" />
				</svg>
			</button>
			{#if dropdownOpen}
				<div
					class="user-dropdown absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-stone-200 bg-white py-1 shadow-lg"
					role="menu"
				>
					<a
						href="/logout"
						class="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
						role="menuitem"
					>
						Logout
					</a>
				</div>
			{/if}
		</div>
	</header>
	{@render children()}
</div>