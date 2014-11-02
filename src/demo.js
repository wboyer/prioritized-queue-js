var spareRandom = null;

function normalRandom()
{
    var val, u, v, s, mul;

    if(spareRandom !== null)
    {
        val = spareRandom;
        spareRandom = null;
    }
    else
    {
        do
        {
            u = Math.random()*2-1;
            v = Math.random()*2-1;

            s = u*u+v*v;
        } while(s === 0 || s >= 1);

        mul = Math.sqrt(-2 * Math.log(s) / s);

        val = u * mul;
        spareRandom = v * mul;
    }

    return val;
}

function normalRandomInRange(mean, stddev, min, max)
{
    var r;
    do
    {
        r = normalRandom() * stddev + mean
    } while(r < min || r > max);

    return r;
}

exports.addRoutes = function (app, scheduler)
{
    app.get('/prioritized-queue/sim', function (req, res)
    {
        res.writeHead(200, {'Content-Type': 'text/plain'});

        var a = "a".charCodeAt(0);

        var interval = setInterval(function()
        {
            for (i = 0; i < 10; i++) {
                var key = String.fromCharCode(a + Math.round(normalRandomInRange(13.5, 5, 0, 25)));
                scheduler.submitTask(key, 1, null, function (success, failure)
                {
                    setTimeout(function ()
                    {
                        success();
                    }, 300);
                });
            }
        }, 100);

        setTimeout(function()
        {
            clearInterval(interval);
        }, 15000);

        res.end();
    });
};
