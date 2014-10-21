define(function ()
{
    return {

    numQueues: null,
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
                    queue = $('<div class="queueContainer" data-queue-index="' + i + '"><div class="queue"></div></div>').appendTo(container);

                    if (numQueues)
                        queue.css('width', 1. / numQueues * 100 + '%');

                    queue = queue.find('.queue');

                    if (numQueues) {
                        var nm1 = numQueues - 1;

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

                updateQueue(queue, queues[i]);
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
        }}
});
