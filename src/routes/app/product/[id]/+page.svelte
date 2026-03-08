<script lang="ts">
	let { data } = $props();

	const product = $derived(data?.product);
	const images = $derived(
		product?.images
			? typeof product.images === 'string'
				? JSON.parse(product.images || '[]')
				: product.images ?? []
			: []
	);
	const imageUrl = $derived(Array.isArray(images) && images[0] ? images[0].url : null);
</script>

{#if !product}
	<p class="p-4 text-stone-600">Product not found.</p>
{:else}
	<article class="p-4">
		<a href="/app/list" class="mb-4 inline-block text-sm text-stone-600 hover:text-stone-900">
			← Back to list
		</a>

		<div class="max-w-lg">
			{#if imageUrl}
				<div class="aspect-square w-full overflow-hidden rounded-lg">
					<img
						src={imageUrl}
						alt={product.name ?? 'Product'}
						class="h-full w-full object-cover"
					/>
				</div>
			{:else}
				<div class="aspect-square w-full rounded-lg bg-stone-100"></div>
			{/if}

			<div class="mt-4">
				<h1 class="text-2xl font-semibold text-stone-900">{product.name ?? 'Untitled'}</h1>
				{#if product.price != null}
					<p class="mt-2 text-lg text-stone-600">${product.price}</p>
				{/if}
				{#if product.description}
					<p class="mt-4 text-stone-600">{product.description}</p>
				{/if}
			</div>
		</div>
	</article>
{/if}
