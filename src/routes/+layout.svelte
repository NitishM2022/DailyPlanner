<script lang="ts">
	import '../app.css';
	import { createDate } from '$lib/signals/createDate.svelte';

	const date = createDate();

	let month = $state(date.month);
	const months = [
		{ value: 0, name: 'Jan' },
		{ value: 1, name: 'Feb' },
		{ value: 2, name: 'Mar' },
		{ value: 3, name: 'Apr' },
		{ value: 4, name: 'May' },
		{ value: 5, name: 'Jun' },
		{ value: 6, name: 'Jul' },
		{ value: 7, name: 'Aug' },
		{ value: 8, name: 'Sep' },
		{ value: 9, name: 'Oct' },
		{ value: 10, name: 'Nov' },
		{ value: 11, name: 'Dec' }
	];

	function handleInput(e: KeyboardEvent) {
		const inputEl = e.target as HTMLInputElement;

		if (e.key === 'Enter') {
			const numValue = parseInt(inputEl.value, 10);
			if (numValue >= 1970 && numValue <= 2100) {
				date.month = month;
				date.year = numValue;
				inputEl.value = '';
				inputEl.placeholder = 'Enter Year';
			}
			return;
		}

		if (
			e.key === 'Backspace' ||
			e.key === 'Delete' ||
			e.key === 'ArrowLeft' ||
			e.key === 'ArrowRight'
		) {
			return;
		}

		if (!/^\d$/.test(e.key)) {
			e.preventDefault();
			inputEl.placeholder = 'No letters';
		}

		if (inputEl.value.length >= 4) {
			e.preventDefault();
		}
	}

	$effect(() => console.log(date.month, date.year));
</script>

<nav>
	<div class="months">
		{#each months as { value, name }}
			{#if date.month === value}
				<button class="month-button" style="background-color: #777777; color: #ffffff;"
					>{name}</button
				>
			{:else if month === value}
				<button class="month-button" style="background-color: #abcdef; color: #123456;"
					>{name}</button
				>
			{:else}
				<button class="month-button" on:click={() => (month = value)}>{name}</button>
			{/if}
		{/each}
		<input type="text" on:keydown={handleInput} placeholder="Enter Year" class="year-selector" />
	</div>
</nav>
<hr style="background-color: #777777; border: none;" />

<slot />

<style>
	.months {
		display: flex;
		justify-content: center;
		padding: 0 10px;
		padding-top: 8px;
	}

	.month-button {
		border: none;
		background-color: rgb(255, 255, 255);
		cursor: pointer;
		padding: 0 20px;
		box-sizing: border-box;
		color: #777777;
	}

	.year-selector {
		border: none;
		text-align: center;
		outline: none;
		color: #777777;
	}
</style>
