<script lang="ts">
	import { createDate } from '$lib/signals/createDate.svelte';
	import { dayOfWeekToString, monthToString } from '$lib/utils/date';

	type Day = {
		date: number;
		day: string;
		month: string;
		UTCDate: number;
		highlight: string;
	};

	type DailyTaskList = {
		date: Date;
		taskList: boolean[];
	};

	type Filters = 'All' | 'Complete' | 'Partial' | 'None' | 'Highlight';

	const date = createDate();

	let days = $state<Day[]>([]);
	let tasks = $state<String[]>([]);
	let dailyTaskLists = $state<DailyTaskList[]>([]);

	let currFilter: Filters = $state<Filters>('All');
	let filteredDays = $derived(filterDays());
	let filteredTaskLists = $derived(filterTaskList());

	//signals
	const storageString = date.month.toString() + date.year.toString();

	const currMonthString = monthToString(date.month);
	const daysInMonth = new Date(date.year, date.month + 1, 0).getDate();
	const charMax = 74;

	$effect(() => console.log(storageString));

	// Load saved data
	$effect(() => {
		const savedHighlights = localStorage.getItem(storageString + 'highlights');
		if (savedHighlights) {
			days = JSON.parse(savedHighlights);
		} else {
			for (let i = 0; i < daysInMonth; i++) {
				const currDay = new Date(date.year, date.month, i + 1);

				days[i] = {
					date: i + 1,
					day: dayOfWeekToString(currDay.getDay()),
					month: monthToString(currDay.getMonth()),
					UTCDate: currDay.getTime(),
					highlight: ''
				};
			}
		}
	});

	$effect(() => {
		const savedTasks = localStorage.getItem(storageString + 'tasks');
		if (savedTasks) {
			tasks = JSON.parse(savedTasks);
		}
	});

	$effect(() => {
		const savedDailyTaskLists = localStorage.getItem(storageString + 'dailyTaskLists');
		if (savedDailyTaskLists) {
			dailyTaskLists = JSON.parse(savedDailyTaskLists);
		}
	});

	// Save data
	$effect(() => {
		localStorage.setItem(storageString + 'highlights', JSON.stringify(days));
	});

	$effect(() => {
		localStorage.setItem(storageString + 'tasks', JSON.stringify(tasks));
	});

	$effect(() => {
		localStorage.setItem(storageString + 'dailyTaskLists', JSON.stringify(dailyTaskLists));
	});

	function addTask(e: KeyboardEvent) {
		if (e.key !== 'Enter') return;

		const inputEl = e.target as HTMLInputElement;
		if (!inputEl.value) return;

		tasks.push(inputEl.value);

		inputEl.value = '';

		if (tasks.length == 1) {
			for (let i = 0; i < daysInMonth; i++) {
				const currDay = new Date(date.year, date.month, i + 1);
				dailyTaskLists[i] = {
					date: currDay,
					taskList: [false]
				};
			}
		} else {
			for (let i = 0; i < dailyTaskLists.length; i++) {
				dailyTaskLists[i].taskList.push(false);
			}
		}

		inputEl.blur();
	}

	function removeTask(index: number) {
		tasks.splice(index, 1);
		for (let i = 0; i < dailyTaskLists.length; i++) {
			dailyTaskLists[i].taskList.splice(index, 1);
		}
	}

	function limitCharacters(e: Event) {
		const inputEl = e.target as HTMLInputElement;
		if (inputEl.value.length > charMax) {
			inputEl.value = inputEl.value.slice(0, charMax);
		}
	}

	function compareToday(date: number) {
		return date <= new Date().getTime();
	}

	function setFilter(newFilter: Filters) {
		currFilter = newFilter;
	}

	function filterDays() {
		switch (currFilter) {
			case 'All':
				return days;
			case 'Complete':
				return days.filter((day, index) => dailyTaskLists[index].taskList.every((bool) => bool));
			case 'Partial':
				return days.filter((day, index) => dailyTaskLists[index].taskList.some((bool) => bool));
			case 'None':
				return days.filter((day, index) => dailyTaskLists[index].taskList.every((bool) => !bool));
			case 'Highlight':
				return days.filter((day) => day.highlight.length > 0);
		}
	}

	function filterTaskList() {
		switch (currFilter) {
			case 'All':
				return dailyTaskLists;
			case 'Complete':
				return dailyTaskLists.filter((item) => item.taskList.every((bool) => bool));
			case 'Partial':
				return dailyTaskLists.filter((item) => item.taskList.some((bool) => bool));
			case 'None':
				return dailyTaskLists.filter((item) => item.taskList.every((bool) => !bool));
			case 'Highlight':
				return dailyTaskLists.filter((item, index) => days[index].highlight.length > 0);
		}
	}
</script>

<div class="container">
	<header>
		<h1 class="margin-bottom: 0;">{currMonthString} {date.year}</h1>

		<input onkeydown={addTask} placeholder="Add daily tasks" type="text" class="add-task" />
		<div style="display: flex; flex-direction: row; gap: 8px; margin-bottom:10px">
			<button on:click={() => setFilter('All')} class="filter"> All</button>
			<button on:click={() => setFilter('Complete')} class="filter">Done</button>
			<button on:click={() => setFilter('Partial')} class="filter">Partial</button>
			<button on:click={() => setFilter('None')} class="filter">None</button>
			<button on:click={() => setFilter('Highlight')} class="filter">Highlights</button>
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
					<tr style="height: 5px;"><td colspan="100%"><div class="hr-copy"></div></td></tr>
					{#if filteredDays}
						{#each filteredDays.slice().reverse() as day, i}
							{#if compareToday(filteredDays[filteredDays.length - 1 - i].UTCDate)}
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
					{#each tasks as task, i}
						<div class="task-list-col">
							<div class="group">
								<input
									onkeydown={(e: KeyboardEvent) => (e.key === 'Enter' ? (e.target as HTMLTextAreaElement).blur() : null)}
									bind:value={tasks[i]}
								/>
								<button onclick={() => removeTask(i)} class="delete-button">
									❌<!-- <span class="material-symbols-outlined"> close </span> -->
								</button>
							</div>
							{#each filteredDays.slice().reverse() as day, j}
								{#if compareToday(filteredDays[filteredDays.length - 1 - j].UTCDate)}
									<input
										type="checkbox"
										bind:checked={filteredTaskLists[filteredDays.length - 1 - j].taskList[i]}
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
