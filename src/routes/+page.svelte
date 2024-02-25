<script lang="ts">
	import { untrack } from 'svelte';
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

	let days = $state<Day[]>([]);
	let tasks = $state<String[]>([]);
	let dailyTaskLists = $state<DailyTaskList[]>([]);

	const currYear = new Date().getFullYear();
	const currMonth = new Date().getMonth();
	const currMonthString = monthToString(currMonth);
	const daysInMonth = new Date(currYear, currMonth + 1, 0).getDate();
	const charMax = 74;

	$effect(() => {
		const savedHighlights = localStorage.getItem('highlights');
		if (savedHighlights) {
			days = JSON.parse(savedHighlights);
		} else {
			for (let i = 0; i < daysInMonth; i++) {
				const currDay = new Date(currYear, currMonth, i + 1);

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
		const savedTasks = localStorage.getItem('tasks');
		if (savedTasks) {
			tasks = JSON.parse(savedTasks);
		}
	});

	$effect(() => {
		const savedDailyTaskLists = localStorage.getItem('dailyTaskLists');
		if (savedDailyTaskLists) {
			dailyTaskLists = JSON.parse(savedDailyTaskLists);
		}
	});

	$effect(() => {
		localStorage.setItem('highlights', JSON.stringify(days));
	});

	$effect(() => {
		localStorage.setItem('tasks', JSON.stringify(tasks));
	});

	$effect(() => {
		localStorage.setItem('dailyTaskLists', JSON.stringify(dailyTaskLists));
	});

	function addTask(e: KeyboardEvent) {
		if (e.key !== 'Enter') return;

		const inputEl = e.target as HTMLInputElement;
		if (!inputEl.value) return;

		tasks.push(inputEl.value);

		inputEl.value = '';

		if (tasks.length == 1) {
			for (let i = 0; i < daysInMonth; i++) {
				const currDay = new Date(currYear, currMonth, i + 1);
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

	function blurFocus(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			(e.target as HTMLInputElement).blur();
		}
	}

	function limitCharacters(e: Event) {
		const inputEl = e.target as HTMLInputElement;
		if (inputEl.value.length > charMax) {
			inputEl.value = inputEl.value.slice(0, charMax);
		}
	}

	function compareToday(date: number) {
		console.log(date, new Date().getTime());
		return date <= new Date().getTime();
	}
</script>

<header>
	<h1 class="margin-bottom: 0;">{currMonthString}</h1>
	<input onkeydown={addTask} placeholder="Add daily tasks" type="text" class="add-task" />
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
				<tr style="height: 5px;"></tr>
				{#if days}
					{#each days.slice().reverse() as day, i}
						{#if compareToday(days[days.length - 1 - i].UTCDate)}
							<tr>
								<th scope="row" class="date">{day.date}</th>
								<td>
									<textarea
										onkeydown={blurFocus}
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
							<input onkeydown={blurFocus} bind:value={tasks[i]} />
							<button onclick={() => removeTask(i)} class="delete-button">
								<span class="material-symbols-outlined"> delete </span>
							</button>
						</div>
						{#each days.slice().reverse() as day, j}
							{#if compareToday(days[days.length - 1 - j].UTCDate)}
								<div class="checkbox-container">
									<input
										type="checkbox"
										bind:checked={dailyTaskLists[days.length - 1 - j].taskList[i]}
									/>
								</div>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
</main>
