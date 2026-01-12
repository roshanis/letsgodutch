import Tesseract from 'tesseract.js';

export interface OCRProgress {
	status: string;
	progress: number;
}

export interface OCRResult {
	text: string;
	confidence: number;
}

let worker: Tesseract.Worker | null = null;

/**
 * Initialize Tesseract worker (lazy loaded)
 */
async function getWorker(): Promise<Tesseract.Worker> {
	if (!worker) {
		worker = await Tesseract.createWorker('eng', 1, {
			logger: (m: { status: string; progress: number }) => {
				if (m.status === 'recognizing text') {
					// Progress updates available here
				}
			}
		});
	}
	return worker;
}

/**
 * Perform OCR on an image
 */
export async function recognizeImage(
	image: File | Blob | string,
	onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
	const w = await getWorker();

	// Set up progress callback
	if (onProgress) {
		await w.setParameters({});
	}

	const result = await w.recognize(image);

	return {
		text: result.data.text,
		confidence: result.data.confidence
	};
}

/**
 * Terminate the worker to free resources
 */
export async function terminateWorker(): Promise<void> {
	if (worker) {
		await worker.terminate();
		worker = null;
	}
}
