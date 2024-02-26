<script lang="ts">
	import { monthToString } from '$lib/utils/date';
	import { getContext } from 'svelte';

	const date = getContext('date');
	const charMax = 74;

	function compareToday(date: number) {
		return date <= new Date().getTime();
	}

	function limitCharacters(e: Event) {
		const inputEl = e.target as HTMLInputElement;
		if (inputEl.value.length > charMax) {
			inputEl.value = inputEl.value.slice(0, charMax);
		}
	}
</script>

<div class="container">
	<header>
		<h1 class="margin-bottom: 0;">{monthToString(date.month)} {date.year}</h1>

		<input
			onkeydown={date.addTask}
			placeholder="Add tasks for {monthToString(date.month).toLowerCase()}"
			type="text"
			class="add-task"
		/>
		<div style="display: flex; flex-direction: row; gap: 8px; margin-bottom:10px">
			<button on:click={() => date.setFilter('All')} class="filter"> All</button>
			<button on:click={() => date.setFilter('Complete')} class="filter">Done</button>
			<button on:click={() => date.setFilter('Partial')} class="filter">Partial</button>
			<button on:click={() => date.setFilter('None')} class="filter">None</button>
			<button on:click={() => date.setFilter('Highlight')} class="filter">Highlights</button>
		</div>
		<div class="hr-div" />
	</header>

	<main>
		<div style="display: flex; flex-direction: row; gap: 2%;">
			<table style="flex: 1;">
				<thead>
					<tr>
						<th scope="col" class="date">Date</th>
						<th scope="col" class="highlight">Highlight</th>
					</tr>
				</thead>

				<tbody>
					<tr style="height: 5px;"><td colspan="100"><div class="hr-copy"></div></td></tr>
					{#if date.filteredDays}
						{#each date.filteredDays.slice().reverse() as day, i}
							{#if compareToday(date.filteredDays[date.filteredDays.length - 1 - i].UTCDate)}
								<tr>
									<th scope="row" class="date">{day.date}</th>
									<td>
										<textarea
											onkeydown={(e: KeyboardEvent) => (e.key === 'Enter' ? (e.target as HTMLTextAreaElement).blur() : null)}
											on:input={limitCharacters}
											bind:value={day.highlight}
											class="highlight"
										>
										</textarea>
									</td>
								</tr>
							{/if}
						{/each}
					{/if}
				</tbody>
			</table>
			<div class="scrollable" style="flex: 1;">
				<div class="task-list-row">
					{#each date.tasks as task, i}
						<div class="task-list-col">
							<div class="group">
								<input
									onkeydown={(e: KeyboardEvent) => (e.key === 'Enter' ? (e.target as HTMLTextAreaElement).blur() : null)}
									bind:value={date.tasks[i]}
								/>
								<button onclick={() => date.removeTask(i)} class="delete-button">
									❌<!-- <span class="material-symbols-outlined"> close </span> -->
								</button>
							</div>
							{#each date.filteredDays.slice().reverse() as day, j}
								{#if compareToday(date.filteredDays[date.filteredDays.length - 1 - j].UTCDate)}
									<input
										type="checkbox"
										bind:checked={date.filteredTaskLists[date.filteredDays.length - 1 - j].taskList[
											i
										]}
										class="checkbox-container"
									/>
								{/if}
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</main>

	<footer></footer>
</div>
