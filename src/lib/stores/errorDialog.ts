import { writable } from 'svelte/store';

export interface ErrorDialogData {
	message: string;
	details?: string;
	context?: string;
	timestamp: string;
}

export const errorDialog = writable<ErrorDialogData | null>(null);

export function showError(data: Omit<ErrorDialogData, 'timestamp'>) {
	errorDialog.set({
		...data,
		timestamp: new Date().toISOString()
	});
}
