class VolumeProcessor extends AudioWorkletProcessor {
    constructor() {
        super();

        this._volume = 0;
        this.SMOOTHING_FACTOR = 0.8
        this._updateIntervalInMS = 250;
        this._nextUpdateFrame = this._updateIntervalInMS;

        this.port.onmessage = (event) => {
            console.log('processor event:', event)
            // 收到调整时间间隔的消息
            if (event.data.updateIntervalInMS) {
                this._updateIntervalInMS = event.data.updateIntervalInMS;
            }
        }
    }

    process (inputs, outputs, parameters) {
        // console.log('inputs:', inputs)
        // console.log('outputs:', outputs)
        // console.log('parameters:', parameters)

        const input = inputs[0]
        if (input.length > 0) {
            const samples = input[0];
            let sum = 0;
            let rms = 0;

            // Calculated the squared-sum.
            for (let i = 0; i < samples.length; ++i) {
                sum += samples[i] * samples[i];
            }

            // Calculate the RMS level and update the volume.
            rms = Math.sqrt(sum / samples.length);
            this._volume = Math.max(rms, this._volume * this.SMOOTHING_FACTOR);
            // Update and sync the volume property with the main thread.
            this._nextUpdateFrame -= samples.length;
            if (this._nextUpdateFrame < 0) {
                this._nextUpdateFrame += this.intervalInFrames;
                this.port.postMessage({volume: this._volume});
            }
        }
        // 返回true，继续处理
        return true
    }

    get intervalInFrames () {
        return this._updateIntervalInMS / 1000 * sampleRate;
    }
}

registerProcessor('volume-processor', VolumeProcessor)
