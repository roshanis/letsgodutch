<script lang="ts">
	import { recognizeImage, terminateWorker } from '$lib/ocr/tesseract';
	import { parseReceipt, type ParsedReceipt } from '$lib/ocr/parser';
	import { onDestroy } from 'svelte';

	interface Props {
		onResult: (receipt: ParsedReceipt) => void;
		onCancel: () => void;
	}

	let { onResult, onCancel }: Props = $props();

	let status = $state<'idle' | 'capturing' | 'processing' | 'review'>('idle');
	let progress = $state(0);
	let progressText = $state('');
	let imageUrl = $state<string | null>(null);
	let parsedReceipt = $state<ParsedReceipt | null>(null);
	let error = $state('');

	let fileInput: HTMLInputElement;
	let videoRef: HTMLVideoElement;
	let canvasRef: HTMLCanvasElement;
	let stream: MediaStream | null = null;

	onDestroy(() => {
		stopCamera();
		terminateWorker();
		if (imageUrl) URL.revokeObjectURL(imageUrl);
	});

	async function startCamera() {
		try {
			status = 'capturing';
			error = '';
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});
			if (videoRef) {
				videoRef.srcObject = stream;
			}
		} catch (err) {
			error = 'Could not access camera. Please use file upload instead.';
			status = 'idle';
		}
	}

	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
	}

	function captureFromCamera() {
		if (!videoRef || !canvasRef) return;

		const ctx = canvasRef.getContext('2d');
		if (!ctx) return;

		canvasRef.width = videoRef.videoWidth;
		canvasRef.height = videoRef.videoHeight;
		ctx.drawImage(videoRef, 0, 0);

		canvasRef.toBlob(async (blob) => {
			if (blob) {
				stopCamera();
				await processImage(blob);
			}
		}, 'image/jpeg', 0.9);
	}

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			processImage(file);
		}
	}

	async function processImage(imageData: File | Blob) {
		status = 'processing';
		progress = 0;
		progressText = 'Initializing OCR...';
		error = '';

		// Create preview URL
		if (imageUrl) URL.revokeObjectURL(imageUrl);
		imageUrl = URL.createObjectURL(imageData);

		try {
			progressText = 'Loading OCR engine...';
			progress = 20;

			progressText = 'Recognizing text...';
			progress = 40;

			const result = await recognizeImage(imageData, (p) => {
				progress = 40 + p.progress * 50;
				progressText = p.status;
			});

			progress = 95;
			progressText = 'Parsing receipt...';

			parsedReceipt = parseReceipt(result.text);

			progress = 100;
			status = 'review';
		} catch (err) {
			error = 'Failed to process image. Please try again.';
			status = 'idle';
			console.error('OCR error:', err);
		}
	}

	function confirmReceipt() {
		if (parsedReceipt) {
			onResult(parsedReceipt);
		}
	}

	function retake() {
		status = 'idle';
		parsedReceipt = null;
		if (imageUrl) {
			URL.revokeObjectURL(imageUrl);
			imageUrl = null;
		}
	}
</script>

<div class="space-y-6">
	{#if status === 'idle'}
		<!-- Initial options -->
		<div class="text-center">
			<div class="text-5xl mb-4">📷</div>
			<h2 class="text-xl font-semibold mb-2">Scan Receipt</h2>
			<p class="text-surface-400 mb-6">Take a photo or upload an image</p>

			<div class="flex flex-col gap-3 max-w-xs mx-auto">
				<button class="btn variant-filled-primary" onclick={startCamera}>
					📸 Use Camera
				</button>
				<button
					class="btn variant-filled-secondary"
					onclick={() => fileInput?.click()}
				>
					📁 Upload Image
				</button>
				<button class="btn variant-ghost-surface" onclick={onCancel}>
					Cancel
				</button>
			</div>

			<input
				bind:this={fileInput}
				type="file"
				accept="image/*"
				class="hidden"
				onchange={handleFileSelect}
			/>
		</div>

		{#if error}
			<p class="text-red-400 text-center text-sm">{error}</p>
		{/if}

	{:else if status === 'capturing'}
		<!-- Camera view -->
		<div class="relative">
			<video
				bind:this={videoRef}
				autoplay
				playsinline
				class="w-full rounded-lg bg-black"
			></video>
			<canvas bind:this={canvasRef} class="hidden"></canvas>

			<div class="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
				<button
					class="btn-icon variant-filled-primary w-16 h-16 rounded-full text-2xl"
					onclick={captureFromCamera}
				>
					📷
				</button>
				<button
					class="btn-icon variant-ghost-surface w-12 h-12 rounded-full"
					onclick={() => { stopCamera(); status = 'idle'; }}
				>
					✕
				</button>
			</div>
		</div>

	{:else if status === 'processing'}
		<!-- Processing -->
		<div class="text-center py-8">
			{#if imageUrl}
				<img
					src={imageUrl}
					alt="Receipt"
					class="max-h-40 mx-auto rounded-lg mb-4 opacity-50"
				/>
			{/if}

			<div class="w-full max-w-xs mx-auto mb-4">
				<div class="h-2 bg-surface-700 rounded-full overflow-hidden">
					<div
						class="h-full bg-primary-500 transition-all duration-300"
						style="width: {progress}%"
					></div>
				</div>
			</div>

			<p class="text-surface-400">{progressText}</p>
		</div>

	{:else if status === 'review' && parsedReceipt}
		<!-- Review parsed receipt -->
		<div class="space-y-4">
			<div class="flex gap-4">
				{#if imageUrl}
					<img
						src={imageUrl}
						alt="Receipt"
						class="w-24 h-32 object-cover rounded-lg"
					/>
				{/if}
				<div class="flex-1">
					{#if parsedReceipt.merchant}
						<h3 class="font-semibold text-lg">{parsedReceipt.merchant}</h3>
					{/if}
					{#if parsedReceipt.date}
						<p class="text-sm text-surface-400">{parsedReceipt.date}</p>
					{/if}
					<p class="text-sm text-surface-400 mt-1">
						{parsedReceipt.items.length} items detected
					</p>
				</div>
			</div>

			<!-- Items -->
			<div class="bg-surface-800 rounded-lg p-4 max-h-64 overflow-y-auto">
				<h4 class="text-sm font-medium text-surface-400 mb-2">Items</h4>
				{#if parsedReceipt.items.length === 0}
					<p class="text-surface-500 text-sm">No items detected</p>
				{:else}
					<div class="space-y-2">
						{#each parsedReceipt.items as item, i}
							<div class="flex justify-between text-sm">
								<span class="text-surface-200">
									{item.quantity ? `${item.quantity}× ` : ''}{item.name}
								</span>
								<span class="font-medium">
									{parsedReceipt.currency} {item.price.toFixed(2)}
								</span>
							</div>
						{/each}
					</div>
				{/if}

				{#if parsedReceipt.subtotal || parsedReceipt.tax || parsedReceipt.tip}
					<div class="border-t border-surface-700 mt-3 pt-3 space-y-1 text-sm">
						{#if parsedReceipt.subtotal}
							<div class="flex justify-between text-surface-400">
								<span>Subtotal</span>
								<span>{parsedReceipt.currency} {parsedReceipt.subtotal.toFixed(2)}</span>
							</div>
						{/if}
						{#if parsedReceipt.tax}
							<div class="flex justify-between text-surface-400">
								<span>Tax</span>
								<span>{parsedReceipt.currency} {parsedReceipt.tax.toFixed(2)}</span>
							</div>
						{/if}
						{#if parsedReceipt.tip}
							<div class="flex justify-between text-surface-400">
								<span>Tip</span>
								<span>{parsedReceipt.currency} {parsedReceipt.tip.toFixed(2)}</span>
							</div>
						{/if}
					</div>
				{/if}

				{#if parsedReceipt.total}
					<div class="border-t border-surface-700 mt-3 pt-3">
						<div class="flex justify-between font-semibold">
							<span>Total</span>
							<span>{parsedReceipt.currency} {parsedReceipt.total.toFixed(2)}</span>
						</div>
					</div>
				{/if}
			</div>

			<!-- Actions -->
			<div class="flex gap-3">
				<button class="btn variant-ghost-surface flex-1" onclick={retake}>
					Retake
				</button>
				<button class="btn variant-filled-primary flex-1" onclick={confirmReceipt}>
					Use This Receipt
				</button>
			</div>
		</div>
	{/if}
</div>
