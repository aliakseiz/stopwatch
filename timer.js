const TimerState = {
    STOPPED: 'Stopped', PAUSED: 'Paused', RUNNING: 'Running',
};

var Timer = class Timer {
    constructor() {
        this.state = TimerState.STOPPED;
        this.lastUpdate = 0;
        this.timePassed = 0;
    }

    isRunning() {
        return this.state == TimerState.RUNNING;
    }

    isPaused() {
        return this.state == TimerState.PAUSED;
    }

    start() {
        this.state = TimerState.RUNNING;
        this.lastUpdate = new Date().getTime();
        this.timePassed = 0;
    }

    pause() {
        if (this.state == TimerState.RUNNING) {
            this.state = TimerState.PAUSED;
            this.update();
        }
    }

    resume() {
        if (this.state == TimerState.PAUSED) {
            this.lastUpdate = new Date().getTime();
            this.state = TimerState.RUNNING;
        }
    }

    stop() {
        this.state = TimerState.STOPPED;
        this.lastUpdate = 0;
        this.timePassed = 0;
    }

    update() {
        if (this.state == TimerState.RUNNING) {
            let timeElapsed = (new Date().getTime() - this.lastUpdate) / 1000.0;
            this.timePassed = Math.max(this.timePassed + timeElapsed, 0);
            this.lastUpdate = new Date().getTime();

            if (this.timePassed <= 0) {
                this.state = TimerState.STOPPED;
                this.timePassed = 0;
            }
        }
    }
}
