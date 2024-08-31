import * as fs from 'node:fs/promises';

const directory = String(__dirname).replace(/\\/g, '/');
const isMjs = process.argv.includes('--mjs');

async function getFiles(path: string): Promise<string[]> {
	const entries = await fs.readdir(path, {withFileTypes: true});

	const files = entries
		.filter(entry => entry.isFile() && entry.name.endsWith('.ts'))
		.map(file => `${path}/${file.name}`);

	const folders = entries.filter(entry => entry.isDirectory());

	for (const folder of folders) {
		files.push(...(await getFiles(`${path}/${folder.name}`)));
	}

	return files;
}

getFiles('./src').then(async files => {
	for (const file of files) {
		await Bun.build({
			entrypoints: [`${directory}/${file}`],
			external: isMjs ? ['*'] : [],
			naming: isMjs ? '[dir]/[name].mjs' : undefined,
			outdir: './dist',
			root: './src',
		});
	}
});
