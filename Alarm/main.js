(function () {
    'use strict';

    /**
     * Utility function to return type of given object as a string
     *
     * @param smthng
     * @returns {string}
     */
    function getType(smthng) {
        return Object.prototype.toString.call(smthng).slice(8, -1);
    }

    /**
     * Displays logging information on the screen and in the console.
     * @param {string} msg - Message to log.
     */
    function log(msg) {
        var logsEl = document.getElementById('logs');

        if (msg) {
            // Update logs
            console.log('[Alarm]: ', msg);
            logsEl.innerHTML += msg + '<br />';
        } else {
        	console.log("da_y.kim");
            // Clear logs
            logsEl.innerHTML = '';
        }

        logsEl.scrollTop = logsEl.scrollHeight;
    }

    /**
     * Register keys used in this application
     */
    function registerKeys() {
        var usedKeys = ['0', '1', '2', '3', '4', 'ColorF0Red'];

        usedKeys.forEach(
            function (keyName) {
                tizen.tvinputdevice.registerKey(keyName);
            }
        );
    }


    /**
     * Handle input from remote
     */
    function registerKeyHandler() {
        document.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 48:
                    // Key 0: Clear logs
                    log();
                    break;
                case 49:
                    // Key 1: Setting absolute alarm
                    setAlarm(tizen.alarm.PERIOD_HOUR);
                    break;
                case 50:
                    // Key 2: Setting relative alarm
                    setAlarm(tizen.alarm.PERIOD_HOUR, true);
                    break;
                case 51:
                    // Key 3: Setting absolute alarm
                    setAlarm(tizen.alarm.PERIOD_MINUTE);
                    break;
                case 52:
                    // Key 4: Setting relative alarm
                    setAlarm(tizen.alarm.PERIOD_MINUTE, true);
                    break;
                // Key Return
                case 10009:
                    tizen.application.getCurrentApplication().exit();
                    break;
                //Key RED
                case 403:
                    log('Removing all alarms');
                    tizen.alarm.removeAll();
                    printAlarms();
                    break;
            }
        });
    }

    /**
     * Display application version
     */
    function displayVersion() {
        var el = document.createElement('div');
        el.id = 'version';
        el.innerHTML = 'ver: ' + tizen.application.getAppInfo().version;
        document.body.appendChild(el);
    }


    /**
     * Display a list of all alarms
     */
    function printAlarms() {
        var alarmsBox = document.querySelector('#alarms > div');
        var alarms = tizen.alarm.getAll();
        var str = '<ul>';

        alarmsBox.innerHTML = '';

        alarms.forEach(function(alarm) {
            str += '<li>' + getType(alarm) + ', ' + (
                    alarm.date || alarm.delay
                ) + '</li>';
        });
        alarmsBox.innerHTML = str + '</ul>';
    }


    /**
     * Use Tizen api to set an alarm
     *
     * @param delay
     * @param isRelative
     */
    function setAlarm(delay, isRelative) {
        var alarmDate = null;
        var alarm;
        var appId = tizen.application.getCurrentApplication().appInfo.id;

        if (isRelative) {
            alarm = new tizen.AlarmRelative(delay);
            log('Setting relative alarm to ' + delay + ' seconds.');
        } else {
            alarmDate = new Date(Date.now() + delay*1000);
            alarm = new tizen.AlarmAbsolute(alarmDate);
            log('Setting absolute alarm to ' + alarmDate + '.');
        }
        tizen.alarm.add(
            alarm,
            appId
        );

        printAlarms();
    }


    /**
     * Update clock displayed in UI
     */
    function updateClock() {
        var clockBox = document.getElementById('clock');
        var now = new Date();
        var ddot = (now.getSeconds() % 2) ? ':' : ' ';
        var min = now.getMinutes();
        var timeStr = now.getHours() + ddot + ((min < 10) ? '0' + min : min);

        clockBox.innerHTML = timeStr;
    }


    /**
     * Start the application once loading is finished
     */
    window.onload = function () {
        if (window.tizen === undefined) {
            log('This application needs to be run on Tizen device');
        } else {
            displayVersion();
            registerKeys();
            registerKeyHandler();
            printAlarms();
        }
        setInterval(updateClock, 500);
    }

} ());