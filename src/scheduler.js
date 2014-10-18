var Queue = require('./queue.js');
var Task = require('./task.js');

var Scheduler =
{
    runTasks: function ()
    {
        while (this.numRunningTasks < this.maxRunningTasks) {
            var taskFound = false;

            for (var i = 0; (i < this.numQueues) && (this.numRunningTasks < this.maxRunningTasks); i++) {
                var task = this.queues[i].pop();
                if (task) {
                    this.numRunningTasks += 1;
                    console.log(this.numRunningTasks + ' tasks now running, max ' + this.maxRunningTasks);
                    task.dequeue().run(this);
                    taskFound = true;
                }
            }

            if (!taskFound)
                return;
        }
    },

    deleteTask: function(task)
    {
        delete this.taskMap[task.key];
    },

    enqueueTask: function (task)
    {
        if (task.details.priority == 0)
            this.deleteTask(task);
        else {
            var queueIndex = Math.floor(Math.log(task.details.priority) / Math.log(this.queueIndexLogBase));

            if (queueIndex >= this.numQueues)
                queueIndex = this.numQueues - 1;

            task.enqueue(this.queues[queueIndex]);
        }

        this.runTasks();
    },

    submitTask: function (key, priority, instructions, func)
    {
        var task = this.taskMap[key];

        if (!task) {
            console.log('"' + key + '" not found in map');
            task = Task.newTask(key, func);
            this.taskMap[key] = task;
        }

        task.add(priority, instructions);

        this.enqueueTask(task);
    }
};

exports.newScheduler = function (numQueues, queueCapacity, queueIndexLogBase, maxRunningTasks, maxNumFailures)
{
    var scheduler = Object.create(Scheduler);

    scheduler.queues = [];

    for (var i = 0; i < numQueues; i++)
        scheduler.queues.push(Queue.newQueue('queue ' + i, queueCapacity));

    scheduler.numQueues = numQueues;
    scheduler.queueIndexLogBase = queueIndexLogBase;

    scheduler.maxRunningTasks = maxRunningTasks;
    scheduler.numRunningTasks = 0;

    scheduler.maxNumFailures = maxNumFailures;

    scheduler.taskMap = {};

    return scheduler;
};

