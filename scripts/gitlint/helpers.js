const {spawnSync} = require('child_process');
const chalk = require('chalk');

const commitMsgRegex = /(\w\W)*:\s{1}[A-Z]+.*\.$/;

exports.run = script => {
	script = script.split(' ');
	const cmd = script.splice(0, 1)[0];
	const args = script;
	const output = spawnSync(cmd, args, {
		cwd: process.cwd(),
		encoding: 'utf8',
		windowsHide: true
	}).stdout;

	return output;
};

function garbageCollect(a) {
	a.forEach((content, index) => {
		if (content === '' || content === undefined) {
			a.splice(index, 1);
		}
	});
	return a;
}

exports.getAllCommits = output => {
	output = output.split('\ncommits');
	if (!output.length > 1) {
		exports.error('There are no commits to lint.');
		process.exit(1);
	}

	output = garbageCollect(output);
	output.forEach((commit, index) => {
		output[index] = 'commit' + commit;
	});

	return output;
};

exports.parseCommit = output => {
	output = output.split('\n\n');

	let commit = output[0].replace('commit ', '');
	commit = commit.replace(/\n.*/g, '');
	let commitHash = commit.split('');
	commitHash = commitHash.slice(commitHash.length - 7);
	commitHash = commitHash.join('');

	const fullCommit = output[1].split('\n');
	const commitMsg = fullCommit[0];
	const lintingStatus = commitMsgRegex.test(commitMsg);

	const result = {
		failed: !lintingStatus,
		commitHash
	};
	return result;
};

exports.logSuccess = () => {
	console.log(chalk`{green commit linter:} commit linter passed.`);
	process.exit(0);
};

exports.error = (...args) => {
	args.unshift(chalk.red('ERROR! '));
	console.error.apply(this, args);
};

exports.warn = msg => {
	console.error(chalk`{yellow ${msg}}`);
};
