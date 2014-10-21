var log = require('./log');

var Instrumenter =
{
    recordConfig: function ()
    {
        log.log('CONFIG');

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
            log.log("SKIP STATE");
            return;
        }

        this.timeOfLastRun = timeNow;

        log.log('STATE');

        if (!this.stateFunc)
            return;

        var state = this.stateFunc.apply(this.subject);

        log.log(state);

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
            instrumenter.recordConfig();
            instrumenter.recordState();
        });

    instrumenter.timeOfLastRun = 0;
    instrumenter.runThrottle = runThrottle;

    return instrumenter;
};

