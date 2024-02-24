<script lang="ts">
	import { untrack } from 'svelte';
	import { dayOfWeekToString, monthToString } from '$lib/utils/date';

	type Day = {
		date: number;
		day: string;
		month: string;
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
		//tasks update
		localStorage.setItem('tasks', JSON.stringify(tasks));
	});

	$effect(() => {
		localStorage.setItem('dailyTaskLists', JSON.stringify(dailyTaskLists));
	});

	function addTask(e: KeyboardEvent) {
		if (e.key !== 'Enter') return;

		const inputEl = e.target as HTMLInputElement;
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
</script>

<h1>{currMonthString}</h1>
<input onkeydown={addTask} placeholder="Add daily tasks" type="text" />

<table>
	<thead>
		<tr>
			<th>Day</th>
			<th>Date</th>
			<th>Highlight</th>
			{#each tasks as task, i}
				<th>{task} <button onclick={() => removeTask(i)}> Delete</button> </th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each days as day, i}
			<tr>
				<td>{day.day}</td>
				<td>{day.date}</td>
				<td><input onkeydown={blurFocus} bind:value={day.highlight} type="text" /></td>
				{#each dailyTaskLists[i]?.taskList as task, j}
					<td>
						<input type="checkbox" bind:checked={dailyTaskLists[i].taskList[j]} />
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
