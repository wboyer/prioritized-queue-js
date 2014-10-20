var Instrumenter =
{
    recordConfig: function ()
    {
        console.log('CONFIG');

        if (!this.configFunc)
            return;

        var config = this.configFunc.apply(this.subject);

        if (this.socket)
            this.socket.emit('config', config);
    },

    recordState: function ()
    {
        var timeNow = new Date().getTime();

        if (timeNow - this.timeOfLastRun < this.runThrottle) {
            console.log("SKIP STATE");
            return;
        }

        this.timeOfLastRun = timeNow;

        console.log('STATE');

        if (!this.stateFunc)
            return;

        var state = this.stateFunc.apply(this.subject);

        console.log(state);

        if (this.socket)
            this.socket.emit('state', state);
    }
};

exports.newInstrumenter = function (subject, socket, runThrottle)
{
    var instrumenter = Object.create(Instrumenter);

    instrumenter.subject = subject;
    instrumenter.socket = socket;

    if (socket)
        socket.on('connection', function ()
        {
            instrumenter.recordConfig()
        });

    instrumenter.timeOfLastRun = 0;
    instrumenter.runThrottle = runThrottle;

    return instrumenter;
};

