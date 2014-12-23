var log = require('./log');

var Task =
{
    enqueue: function (queue)
    {
        if (this.running)
            return;

        if (!this.currentQueue)
            log.log('added task ' + this + ' to queue ' + queue);
        else
            if (this.currentQueue == queue)
                return;
            else {
                log.log('moved task ' + this + ' from queue ' + this.currentQueue + ' to ' + queue);
                this.remove(this.currentQueue);
            }

        queue.push(this);
        this.currentQueue = queue;

        return this;
    },

    remove: function (queue)
    {
        queue.remove(this);
        this.currentQueue = null;

        return this;
    },

    dequeue: function ()
    {
        this.currentQueue = null;
        this.running = true;

        return this;
    },

    add: function (priority, instructions)
    {
        this.details.priority += priority;

        if (instructions != null)
            this.details.instructions.push(instructions);
    },

    addDetails: function (details)
    {
        this.details.priority += details.priority;

        if (details.instructions != null)
            this.details.instructions = this.details.instructions.concat(details.instructions);
    },

    clearDetails: function ()
    {
        var now = new Date().getTime();

        var latestDetails = { priority: this.details.priority, instructions: this.details.instructions, time: now };

        this.details.priority = 0;
        this.details.instructions = [];

        return latestDetails;
    },

    run: function (scheduler)
    {
        this.latestDetails = this.clearDetails();

        log.log('running ' + this);

        try {
            var self = this;

            if (scheduler.timeout > 0)
                this.timeout = setTimeout(function () {
                    log.log('timeout ' + self);
                    delete self.timeout;
                    self.abortRun(scheduler);
                },
                scheduler.timeout);

            this.func(
                function ()
                {
                    self.finishRun(scheduler);
                },
                function ()
                {
                    self.abortRun(scheduler);
                }
            );
        }
        catch (exception) {
            log.log(exception);
            this.abortRun(scheduler);
        }
    },

    abortRun: function (scheduler)
    {
        this.addDetails(this.latestDetails);
        this.details.numFailures += 1;
        this.finishRun(scheduler, 1000 + Math.pow(3, this.details.numFailures));
    },

    finishRun: function (scheduler, backoff)
    {
        log.log('finished ' + this);

        if (this.timeout) {
            clearTimeout(this.timeout);
            delete this.timeout;
        }

        scheduler.numRunningTasks -= 1;

        if (this.details.numFailures >= scheduler.maxNumFailures) {
            scheduler.deleteTask(this);
            return;
        }

        var self = this;

        setTimeout(function ()
            {
                self.running = false;
                scheduler.onTaskFinished(self);
            },
            backoff ? backoff : 100);
    },

    toString: function ()
    {
        return '("' + this.key + '", priority ' + this.details.priority + ')';
    }
};

exports.newTask = function (key, func)
{
    var task = Object.create(Task);

    task.key = key;
    task.details = { priority: 0, numFailures: 0, instructions: [] };
    task.currentQueue = null;
    task.func = func;

    return task;
};
