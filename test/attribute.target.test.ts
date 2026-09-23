import {afterAll, expect, test, vi} from 'vitest';
import {Controller, magnus, removeTarget} from '../src';

// `target:not-real.item` never resolves, so its lookup retries for up to 10 animation frames before giving up
async function nextFrame(): Promise<void> {
	return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

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
			<li target:target-test.item></li>
			<li target:target-test.item></li>
			<li target:target-test.item></li>
			<li target:not-real.item></li>
		</ul>
	</li>
	<li></li>
	<li></li>
</ul>`;

magnus.add('target-test', TargetController);

afterAll(() => {
	document.body.innerHTML = '';
});

test('target attribute', async () => {
	await vi.waitFor(() => {
		expect(controller.targets.getAll('item')).toHaveLength(3);
	});

	expect(controller.targets.find('li')).not.toBeNull();
	expect(controller.targets.findAll('li')).toHaveLength(4);
	expect(controller.targets.get('item')).not.toBeUndefined();
	expect(controller.targets.has('item')).toBe(true);
	expect(controller.targets.has('not-item')).toBe(false);

	for (let index = 0; index < 12; index += 1) {
		await nextFrame();
	}

	const item = controller.targets.get('item');

	if (item != null) {
		removeTarget(item, 'target-test', 'item');
	}

	await vi.waitFor(() => {
		expect(controller.targets.getAll('item')).toHaveLength(2);
	});

	expect(controller.targets.find('li')).not.toBeNull();
	expect(controller.targets.findAll('li')).toHaveLength(4);
	expect(controller.targets.get('item')).not.toBeUndefined();
	expect(controller.targets.has('item')).toBe(true);

	controller.targets.get('item')?.remove();

	await vi.waitFor(() => {
		expect(controller.targets.getAll('item')).toHaveLength(1);
	});

	expect(controller.targets.find('li')).not.toBeNull();
	expect(controller.targets.findAll('li')).toHaveLength(3);
	expect(controller.targets.get('item')).not.toBeUndefined();
	expect(controller.targets.has('item')).toBe(true);

	magnus.remove('target-test');

	expect(controller.targets.get('item')).toBeUndefined();
	expect(controller.targets.getAll('item')).toHaveLength(0);
	expect(controller.targets.has('item')).toBe(false);
});
