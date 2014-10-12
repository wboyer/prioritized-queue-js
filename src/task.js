var Task =
{
    enqueue: function (queue)
    {
        if (this.running)
            return;

        if (!this.currentQueue)
            console.log('added task ' + this + ' to queue ' + queue);
        else if (this.currentQueue == queue)
            return;
        else {
            console.log('moved task ' + this + ' from queue ' + this.currentQueue + ' to ' + queue);
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

    requeue: function (scheduler)
    {
        this.running = false;
        scheduler.enqueueTask(this);

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
        var savedDetails = { key: this.details.key, priority: this.details.priority, instructions: this.details.instructions };

        this.details.priority = 0;
        this.details.instructions = [];

        return savedDetails;
    },

    run: function (scheduler)
    {
        this.savedDetails = this.clearDetails();

        console.log('running ' + this);

        try {
            var self = this;
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
            console.log(exception);
            this.abortRun(scheduler);
        }
    },

    abortRun: function (scheduler)
    {
        this.addDetails(this.savedDetails);
        this.finishRun(scheduler);
    },

    finishRun: function (scheduler)
    {
        console.log('finished ' + this);

        scheduler.numRunningTasks -= 1;

        var self = this;

        setTimeout(function ()
        {
            self.requeue(scheduler);
        }, 1000);
    },

    toString: function ()
    {
        return '("' + this.details.key + '", priority ' + this.details.priority + ')';
    }
};

exports.newTask = function (key, func)
{
    var task = Object.create(Task);

    task.key = key;
    task.details = { key: key, priority: 0, instructions: [] };
    task.currentQueue = null;
    task.func = func;

    return task;
};
