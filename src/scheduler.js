var Queue = require('./queue.js');
var Task = require('./task.js');
var Instrumenter = require('./instrumenter.js');

var Scheduler =
{
    runTask: function (queue)
    {
        var task = queue.pop();
        if (task) {
            if (this.runningTaskMap)
                this.runningTaskMap[task.key] = task;

            this.numRunningTasks += 1;
            console.log(this.numRunningTasks + ' tasks now running, max ' + this.maxRunningTasks);
            task.dequeue().run(this);
            return true;
        }
        else
            return false;
    },

    runTasks: function ()
    {
        if (this.instrumenter)
            this.instrumenter.recordState();

        while (this.numRunningTasks < this.maxRunningTasks) {
            var taskFound = false;

            for (var i = 0; (i < this.numQueues) && (this.numRunningTasks < this.maxRunningTasks); i++)
                if (this.runTask(this.queues[i]))
                    taskFound = true;

            if (!taskFound)
                return;
        }
    },

    deleteTask: function (task)
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

        if (this.runningTaskMap)
            delete this.runningTaskMap[task.key];

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
    },

    describeConfig: function ()
    {
        return { b: this.queueIndexLogBase, n: this.numQueues };
    },

    describeState: function ()
    {
        var state = { q: [] };

        for (var i in this.queues) {
            var queue = this.queues[i];
            for (var j = 0; j < queue.numEntries; j++) {
                var task = queue.entries[queue.peek(j)];
                if (j == 0)
                    state.q[i] = [];
                state.q[i].push({ k: task.key, p: task.details.priority });
            }
        }

        return state;
    }
};

exports.newScheduler = function (numQueues, queueCapacity, queueIndexLogBase, maxRunningTasks, maxNumFailures, createInstrumenter, instrumenterSocket)
{
    var scheduler = Object.create(Scheduler);

    scheduler.taskMap = {};
    scheduler.queues = [];

    for (var i = 0; i < numQueues; i++)
        scheduler.queues.push(Queue.newQueue('queue ' + i, queueCapacity));

    scheduler.numQueues = numQueues;
    scheduler.queueIndexLogBase = queueIndexLogBase;

    scheduler.maxRunningTasks = maxRunningTasks;
    scheduler.numRunningTasks = 0;

    scheduler.maxNumFailures = maxNumFailures;

    if (createInstrumenter) {
        scheduler.instrumenter = Instrumenter.newInstrumenter(scheduler, instrumenterSocket, 10);
        scheduler.instrumenter.configFunc = scheduler.describeConfig;
        scheduler.instrumenter.stateFunc = scheduler.describeState;

        scheduler.runningTaskMap = {};
    }

    return scheduler;
};

