var Queue =
{
    push: function (task)
    {
        this.lastEntry += 1;

        if (this.numEntries == this.maxEntries) {
            this.entries.splice(this.lastEntry, 0, task);
            this.maxEntries += 1;
        }
        else {
            if (this.lastEntry == this.maxEntries)
                this.lastEntry = 0;
            this.entries[this.lastEntry] = task;
        }

        this.numEntries += 1;
    },

    peek: function (i)
    {
        if (this.numEntries == 0)
            return -1;

        i += this.lastEntry + 1 - this.numEntries;

        if (i < 0)
            i += this.maxEntries;

        return i;
    },

    pop: function ()
    {
        var i = this.peek(0);

        if (i < 0)
            return null;

        var task = this.entries[i];
        delete this.entries[i];

        this.numEntries -= 1;

        console.log('pop task ' + task + ' from ' + this);

        return task;
    },

    remove: function (task)
    {
        for (var i = this.lastEntry, j = 0; j < this.numEntries; i--, j++) {
            if (this.entries[i] == task) {
                this.entries.splice(i, 1);

                if (i <= this.lastEntry)
                    this.lastEntry -= 1;

                i = this.lastEntry + 1;

                this.entries.splice(i, 0, null);
                delete this.entries[i];

                this.numEntries -= 1;

                return task;
            }

            if (i == 0)
                i = this.maxEntries;
        }

        return null;
    },

    toString: function ()
    {
        return '("' + this.name + '")';
    }
};

exports.newQueue = function (name, maxEntries)
{
    var queue = Object.create(Queue);

    queue.name = name;

    queue.entries = new Array(maxEntries);

    queue.maxEntries = maxEntries;
    queue.lastEntry = -1;
    queue.numEntries = 0;

    return queue;
};

