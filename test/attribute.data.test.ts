import {afterAll, test} from 'vitest';

afterAll(() => {
	document.body.innerHTML = '';
});

test('data attribute', () =>
	new Promise<void>(done => {
		done();
	}));
