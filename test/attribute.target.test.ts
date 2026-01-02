/** biome-ignore-all lint/style/noMagicNumbers: Testing */
import {afterAll, expect, test} from 'vitest';
import {Controller, magnus} from '../src';

class TargetController extends Controller {
	connect(): void {
		controller = this;
	}
}

let controller: TargetController;

document.body.innerHTML = `<ul>
	<li></li>
	<li></li>
	<li>
		<ul :target-test>
			<li target-test:item></li>
			<li target-test:item></li>
			<li target-test:item></li>
			<li not-real:item></li>
		</ul>
	</li>
	<li></li>
	<li></li>
</ul>`;

magnus.add('target-test', TargetController);

afterAll(() => {
	document.body.innerHTML = '';
});

test('target attribute', () =>
	new Promise<void>(done => {
		setTimeout(() => {
			expect(controller.targets.find('li')).not.toBeNull();
			expect(controller.targets.findAll('li')).toHaveLength(4);
			expect(controller.targets.get('item')).not.toBeUndefined();
			expect(controller.targets.getAll('item')).toHaveLength(3);
			expect(controller.targets.has('item')).toBe(true);
			expect(controller.targets.has('not-item')).toBe(false);

			controller.targets.get('item')?.removeAttribute('target-test:item');
		}, 25);

		setTimeout(() => {
			expect(controller.targets.find('li')).not.toBeNull();
			expect(controller.targets.findAll('li')).toHaveLength(4);
			expect(controller.targets.get('item')).not.toBeUndefined();
			expect(controller.targets.getAll('item')).toHaveLength(2);
			expect(controller.targets.has('item')).toBe(true);
		}, 50);

		setTimeout(() => {
			controller.targets.get('item')?.remove();
		}, 75);

		setTimeout(() => {
			expect(controller.targets.find('li')).not.toBeNull();
			expect(controller.targets.findAll('li')).toHaveLength(3);
			expect(controller.targets.get('item')).not.toBeUndefined();
			expect(controller.targets.getAll('item')).toHaveLength(1);
			expect(controller.targets.has('item')).toBe(true);

			magnus.remove('target-test');
		}, 100);

		setTimeout(() => {
			expect(controller.targets.get('item')).toBeUndefined();
			expect(controller.targets.getAll('item')).toHaveLength(0);
			expect(controller.targets.has('item')).toBe(false);
		}, 125);

		setTimeout(done, 150);
	}));
