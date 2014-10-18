var Instrumenter =
{
    recordConfig: function (func)
    {
        console.log('CONFIG');

        var config = func();
        console.log(config);

        if (this.io)
            this.io.emit('config', config);
    },

    recordState: function (func)
    {
        var timeNow = new Date().getTime();

        if (timeNow - this.timeOfLastRun < this.runThrottle) {
            console.log("SKIP");
            return;
        }

        this.timeOfLastRun = timeNow;

        console.log('STATE');

        var state = func();
        console.log(state);

        if (this.io)
            this.io.emit('state', state);
    }
};

exports.newInstrumenter = function (io, runThrottle)
{
    var instrumenter = Object.create(Instrumenter);

    instrumenter.io = io;

    instrumenter.timeOfLastRun = 0;
    instrumenter.runThrottle = runThrottle;

    return instrumenter;
};

