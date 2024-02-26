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

export function createDate() {
	let days = $state<Day[]>([]);
	let tasks = $state<string[]>([]);
	let dailyTaskLists = $state<DailyTaskList[]>([]);

	let currFilter: Filters = $state<Filters>('All');
	let filteredDays = $derived(filterDays());
	let filteredTaskLists = $derived(filterTaskList());

	let year: number = $state(new Date().getFullYear());
	let month: number = $state(new Date().getMonth());

	//if the month or year changes, storageString will change causing the highlights to be loaded from the correct month
	const storageString = $derived(month + '-' + year);
	const daysInMonth = $derived(new Date(year, month + 1, 0).getDate());
	$effect(() => {
		console.log(daysInMonth);
	});

	// Load saved data
	$effect(() => {
		const savedHighlights = localStorage.getItem(storageString + 'highlights');
		if (savedHighlights) {
			days = JSON.parse(savedHighlights);
		} else {
			for (let i = 0; i < daysInMonth; i++) {
				const currDay = new Date(year, month, i + 1);
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
		} else {
			tasks = [];
		}
	});

	$effect(() => {
		const savedDailyTaskLists = localStorage.getItem(storageString + 'dailyTaskLists');
		if (savedDailyTaskLists) {
			dailyTaskLists = JSON.parse(savedDailyTaskLists);
		} else {
			dailyTaskLists = [];
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

	//component functions
	function addTask(e: KeyboardEvent) {
		if (e.key !== 'Enter') return;

		const inputEl = e.target as HTMLInputElement;
		if (!inputEl.value) return;

		tasks.push(inputEl.value);

		inputEl.value = '';

		//if tasks is empty, create a new array of false dailyTaskLists
		if (tasks.length == 1) {
			for (let i = 0; i < daysInMonth; i++) {
				const currDay = new Date(year, month, i + 1);
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

	return {
		get month() {
			return month;
		},
		set month(value: number) {
			month = value;
		},
		get year() {
			return year;
		},
		set year(value: number) {
			year = value;
		},
		get filteredDays() {
			return filteredDays;
		},
		get filteredTaskLists() {
			return filteredTaskLists;
		},
		get currFilter() {
			return currFilter;
		},
		get tasks() {
			return tasks;
		},
		get days() {
			return days;
		},
		get dailyTaskLists() {
			return dailyTaskLists;
		},
		get daysInMonth() {
			return daysInMonth;
		},
		addTask,
		removeTask,
		setFilter
	};
}
