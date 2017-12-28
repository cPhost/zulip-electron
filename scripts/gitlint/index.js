const helpers = require('./helpers');

let checkAllCommits = false;
let ciMode = false;
if (process.argv[2]) {
	checkAllCommits = process.argv[2].includes('-a');
	ciMode = process.argv[2] === '--ci-mode';
}

let cmd;
if (ciMode) {
	cmd = helpers.getCICmd();
} else {
	cmd =
    checkAllCommits ? 'git log upstream/master...HEAD' : 'git log -1 HEAD';
}

const commits = helpers.run(cmd);
const commitsArray = helpers.getAllCommits(commits);
let lintFailed = false;
commitsArray.forEach(commit => {
	const res = helpers.parseCommit(commit);
	if (res.failed) {
		const {commitHash} = res;
		helpers.error(`commit ${commitHash} does not pass our commit style.`);
		lintFailed = true;
	} else {
		helpers.logSuccess('Commit[s] follow the zulip-electron commit rules.');
	}
});

if (lintFailed) {
	helpers.warn(`
  commit msg linting failed
  -------------------------------
  Reasons it does not have:
    a) <substsytem>:
    b) more than one spaces after master
    c) capitial latter at start of message or
    d) period at the end of commit
  `);
	process.exit(1);
}
