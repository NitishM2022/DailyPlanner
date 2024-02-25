export function createDate() {
	let year: number = $state(new Date().getFullYear());
	let month: number = $state(new Date().getMonth());

	return {
		get month() {
			return month;
		},
		get year() {
			return year;
		},
		set month(value: number) {
			month = value;
		},
		set year(value: number) {
			year = value;
		}
	};
}
