var assert = require('assert');

var Task = require('../src/task.js');
var Queue = require('../src/queue.js');
var Scheduler = require('../src/scheduler.js');

function test1(req, res)
{
    var task1 = Task.newTask("t1");
    var task2 = Task.newTask("t2");
    var task3 = Task.newTask("t3");

    var queue = Queue.newQueue("test queue", 3);

    console.log(task1);
    console.log(queue);

    task1.enqueue(queue);
    task2.enqueue(queue);
    console.log(queue.pop().dequeue());
    console.log(queue);

    task3.enqueue(queue);
    task2.enqueue(queue);
    console.log(queue.pop().dequeue());
    console.log(queue);

    task1.enqueue(queue); // won't go on; running
    task2.enqueue(queue); // won't go on; running
    console.log(queue);

    task2.remove(queue); // not there
    console.log(queue);

    task3.enqueue(queue); // already there
    console.log(queue);

    task3.remove(queue);
    console.log(queue);
}

function test2()
{
    var scheduler = Scheduler.newScheduler(3, 100, 2, 2);

    for (var i = 0; i < 10; i++)
        scheduler.submitTask("a", 1, null, function(success, failure) {
            setTimeout(function() { success(); }, 4000);
        });

    for (var i = 0; i < 10; i++)
        scheduler.submitTask("b", 1, null, function(success, failure) {
            setTimeout(function() { success(); }, 4000);
        });

    for (var i = 0; i < 10; i++)
        scheduler.submitTask("c", 1, null, function(success, failure) {
            success();
        });
}

test1();

