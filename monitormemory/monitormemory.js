exports.id = 'monitormemory';
exports.title = 'Monitoring: Memory';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Inputs';
exports.color = '#F6BB42';
exports.output = 1;
exports.icon = 'microchip';
exports.options = { interval: 8000 };
exports.readme = `# Memory monitoring

This component monitors memory \`bytes\` consumption in Linux systems. It uses \`free\` command.

__Data Example__:

\`\`\`javascript
{
	total: 33558769664,
	used: 1998868480,
	free: 2653708288
}
\`\`\``;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="interval" data-placeholder="@(10000)" data-increment="true" data-jc-type="number" data-required="true" data-maxlength="10">@(Interval in milliseconds)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var current = { total: 0, used: 0, free: 0 };
	var tproc = null;

	instance.custom.run = function() {

		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}

		require('child_process').exec('free -b -t', function(err, response) {

			tproc = setTimeout(instance.custom.run, instance.options.interval);

			if (err) {
				instance.error(err);
				return;
			}

			var memory = response.split('\n')[1].match(/\d+/g);
			current.total = memory[0].parseInt();
			current.used = memory[1].parseInt() - memory[3].parseInt();
			current.free = current.total - current.used;
			instance.send(current);
		});
	};

	instance.on('close', function() {
		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}
	});

	setTimeout(instance.custom.run, 1000);
};