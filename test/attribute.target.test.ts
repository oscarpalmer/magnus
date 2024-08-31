import {afterAll, expect, test} from 'bun:test';
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
		<ul data-controller="target-test">
			<li data-target="target-test.item"></li>
			<li data-target="target-test.item"></li>
			<li data-target="target-test.item"></li>
		</ul>
	</li>
	<li></li>
	<li></li>
</ul>`;

magnus.add('target-test', TargetController);

afterAll(() => {
	document.body.innerHTML = '';
});

test('target attribute', done => {
	setTimeout(() => {
		expect(controller.targets.find('li')).toHaveLength(3);
		expect(controller.targets.get('item')).not.toBeUndefined();
		expect(controller.targets.getAll('item')).toHaveLength(3);
		expect(controller.targets.has('item')).toBeTrue();
		expect(controller.targets.has('not-item')).toBeFalse();

		magnus.remove('target-test');

		setTimeout(() => {
			expect(controller.targets.get('item')).toBeUndefined();
			expect(controller.targets.getAll('item')).toHaveLength(0);
			expect(controller.targets.has('item')).toBeFalse();

			done();
		}, 25);
	}, 125);
});
