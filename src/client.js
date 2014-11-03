define(function ()
{
    return {

        numQueues: null,
        stackQueues: false,
        queueIndexLogBase: null,

        updateQueue: function (element, queue)
        {
            element = $(element);

            var i = 0;

            if (queue)
                for (; i < queue.length; i++) {
                    var description = queue[i].k + ' (' + queue[i].p + ')';

                    var entry = element.find('[data-entry-index="' + i + '"]');
                    if (entry.size())
                        entry.html(description);
                    else
                        element.append('<div class="entry" data-entry-index="' + i + '">' + description + '</div>');
                }

            element.find('.entry').filter(function (index)
            {
                return (this.getAttribute('data-entry-index') >= i);
            }).remove();
        },

        updateQueues: function (container, queues)
        {
            container = $(container);

            for (var i = 0; i < queues.length; i++) {
                var queue = container.find('[data-queue-index="' + i + '"]');

                if (!queue.size()) {
                    var queueLabel = 'Queue ' + i;

                    if (this.queueIndexLogBase) {
                        var labelMinPriority = Math.pow(this.queueIndexLogBase, i);
                        var labelMaxPriority = Math.pow(this.queueIndexLogBase, i + 1) - 1;

                        if (labelMinPriority == labelMaxPriority)
                            queueLabel += ' (Priority ' + labelMinPriority + ')';
                        else
                            queueLabel += ' (Priorities ' + labelMinPriority + '-' + labelMaxPriority  + ')';
                    }

                    queue = $('<div class="queueContainer" data-queue-index="' + i + '"><div class="queue"><div class="queueHeader">' + queueLabel + '</div></div></div>').appendTo(container);

                    if (this.numQueues && !this.stackQueues)
                        queue.css('width', 1. / this.numQueues * 100 + '%');

                    queue = queue.find('.queue');

                    if (this.numQueues) {
                        var nm1 = this.numQueues - 1;

                        var r = parseInt((255 * i / nm1)).toString(16);
                        if (r.length == 1)
                            r = '0' + r;

                        var g = '00';

                        var b = parseInt((255 * (1 - i / nm1))).toString(16);
                        if (b.length == 1)
                            b = '0' + b;

                        queue.css('background-color', '#' + r + g + b);
                    }
                }
                else
                    queue = queue.find('.queue');

                this.updateQueue(queue, queues[i]);
            }

            container.find('.queueContainer').filter(function (index)
            {
                return (this.getAttribute('data-queue-index') >= i);
            }).remove();
        },

        updateTasks: function (container, tasks)
        {
            container = $(container);
            var tasksElement = $(container).find("#tasks");

            if (tasks.length) {
                if (!tasksElement.size())
                    tasksElement = $('<div id="tasks"></div>').appendTo(container);
            }
            else {
                tasksElement.remove();
                return;
            }

            for (var i = 0; i < tasks.length; i++) {
                var description = tasks[i].k + ' (' + tasks[i].p + ', ' + tasks[i].t + ')';

                var task = tasksElement.find('[data-task-index="' + i + '"]');
                if (task.size())
                    task.html(description);
                else
                    task = $('<div class="task" data-task-index="' + i + '">' + description + '</div>').appendTo(tasksElement);
            }

            tasksElement.find('.task').filter(function (index)
            {
                return (this.getAttribute('data-task-index') >= i);
            }).remove();
        }

        initDemo: function ($, document, modernizr, io, server)
        {
            if (document.createStyleSheet)
                document.createStyleSheet('/dist/prioritized-queue/src/css/demo.css');
            else
                $("head").append($("<link rel='stylesheet' href='/dist/prioritized-queue/src/css/demo.css' type='text/css' media='screen' />"));

            $("#demo").html(' \
                <div style="position: relative; height: 400px; overflow: auto;"> \
                    <div class="row"> \
                        <div id="controlsContainer" class="col-xs-12 col-md-2"> \
                            <div id="controls"><button type="button" class="btn btn-default" onclick="$.get(\'http://localhost:3000\');">Simulate...</button></div> \
                        </div> \
                        <div class="col-xs-12 col-md-10"> \
                            <div class="row"> \
                                <div id="queuesContainer" class="col-xs-12 col-sm-6 col-md-9"> \
                                    <div class="header">Task Queues<br><span class="subHeader">Key (Priority)</span></div> \
                                </div> \
                                <div id="tasksContainer" class="col-xs-12 col-sm-6 col-md-3"> \
                                    <div class="header">Running Tasks<br><span class="subHeader">Key (Priority, Time in ms)</span></div> \
                                </div> \
                            </div> \
                        </div> \
                    </div> \
                </div> \
            ');

            var socket = io.connect(server);
            var self = this;

            socket.on('config', function(msg) {
                self.numQueues = msg.n;
                self.queueIndexLogBase = msg.b;
            });

            socket.on('state', function(msg) {
                self.updateQueues($('#queuesContainer'), msg.q);
                self.updateTasks($('#tasksContainer'), msg.r);
            });

            self.stackQueues = modernizr.mq('screen and (max-width: 767px)');

            $(window).on('resize', function () {
                self.stackQueues = modernizr.mq('screen and (max-width: 767px)');
                self.updateQueues($('#queuesContainer'), []);
                console.log('resize');
            });
        }
    }
});
