const TimerState = {
    STOPPED: 'Stopped', PAUSED: 'Paused', RUNNING: 'Running',
};

export class Timer {
    constructor() {
        this.state = TimerState.STOPPED;
        this.lastUpdate = 0;
        this.elapsedTime = 0;
    }

    isRunning() {
        return this.state === TimerState.RUNNING;
    }

    isPaused() {
        return this.state === TimerState.PAUSED;
    }

    start() {
        this.state = TimerState.RUNNING;
        this.lastUpdate = this.getTimeNow();
        this.elapsedTime = 0;
    }

    pause() {
        this.state = TimerState.PAUSED;
        this.updateElapsedTime();
    }

    resume() {
        this.lastUpdate = this.getTimeNow();
        this.state = TimerState.RUNNING;
    }

    stop() {
        this.state = TimerState.STOPPED;
        this.lastUpdate = 0;
        this.elapsedTime = 0;
    }

    updateElapsedTime() {
        if (this.isRunning()) {
            const currentTime = this.getTimeNow();
            let timeElapsed = (currentTime - this.lastUpdate) / 1000.0;
            this.elapsedTime = Math.max(this.elapsedTime + timeElapsed, 0);
            this.lastUpdate = currentTime;
            if (this.elapsedTime <= 0) {
                this.state = TimerState.STOPPED;
                this.elapsedTime = 0;
            }
        }
    }

    setElapsedTime(elapsedTime) {
        this.elapsedTime = elapsedTime;
    }

    getTimeNow() {
        return new Date().getTime();
    }
}
