var Queue = require('./queue.js');
var Task = require('./task.js');
var Instrumenter = require('./instrumenter.js');
var Simulation = require('./simulation.js');

var log = require('./log');

var Scheduler =
{
    runTask: function (queue)
    {
        var task = queue.pop();
        if (task) {
            if (this.runningTaskMap)
                this.runningTaskMap[task.key] = task;

            this.numRunningTasks += 1;
            log.log(this.numRunningTasks + ' tasks now running, max ' + this.maxRunningTasks);

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

            for (var i = this.numQueues - 1; (i >= 0) && (this.numRunningTasks < this.maxRunningTasks); i--)
                if (this.runTask(this.queues[i]))
                    taskFound = true;

            if (!taskFound)
                return;

            if (this.instrumenter)
                this.instrumenter.recordState();
        }
    },

    onTaskFinished: function (task)
    {
        if (this.runningTaskMap)
            delete this.runningTaskMap[task.key];

        this.enqueueTask(task);
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

        this.runTasks();
    },

    submitTask: function (key, priority, instructions, func)
    {
        var task = this.taskMap[key];

        if (!task) {
            log.log('"' + key + '" not found in map');
            task = Task.newTask(key, func);
            this.taskMap[key] = task;
        }

        task.add(priority, instructions);

        this.enqueueTask(task);

        if (this.instrumenter)
            this.timeLastTaskSubmitted = new Date().getTime();
    },

    describeConfig: function ()
    {
        return { b: this.queueIndexLogBase, n: this.numQueues, c: this.timeCreated, s: this.timeLastTaskSubmitted };
    },

    describeState: function ()
    {
        var now = new Date().getTime();

        var state = { q: [], r: [], t: now };

        for (var i in this.queues) {
            var queue = this.queues[i];
            for (var j = 0; j < queue.numEntries; j++) {
                var task = queue.entries[queue.peek(j)];
                if (j == 0)
                    state.q[i] = [];
                state.q[i].push({ k: task.key, p: task.details.priority });
            }
        }

        for (var key in this.runningTaskMap) {
            var task = this.runningTaskMap[key];
            state.r.push({ k: task.key, p: task.details.priority, t: now - task.latestDetails.time })
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
        scheduler.instrumenter = Instrumenter.newInstrumenter(scheduler, instrumenterSocket, 0);
        scheduler.instrumenter.configFunc = scheduler.describeConfig;
        scheduler.instrumenter.stateFunc = scheduler.describeState;

        scheduler.timeCreated = new Date().getTime();
        scheduler.timeLastTaskSubmitted = 0;

        scheduler.runningTaskMap = {};
    }

    return scheduler;
};

exports.addRoutes = function(app, scheduler)
{
    app.get('/prioritized-queue/sim', function (req, res)
    {
        res.writeHead(202);
        Simulation.run(scheduler);
        res.end();
    });
};

exports.listenOnSocket = function(socket, scheduler)
{
    socket.on('sim', function ()
    {
        Simulation.run(scheduler);
    });
};
