import * as readline from "readline";
import * as fs from 'fs';
import { exec } from "child_process";

export class ActivityMonitor {
    private _name: string;
    private _device: string;
    private _standbyAfterMinutes: number;
    private _checkInterval: number;
    private _lastActivity: number = Date.now();
    private _timer: any = null;
    private _read: number = 0;
    private _written: number = 0;
    private _standby: boolean = false;

    private getActivity(): [number, number] {
        let read = 0;
        let written = 0;
        const readInterface = readline.createInterface({ input: fs.createReadStream('/proc/diskstats') });
        readInterface.on('line', (line) => {
            let match = (/^\s+(?<major>\d+)\s+(?<minor>\d+)\s+(?<name>\w+)\s+(?<rcomplete>\d+)\s+(?<rmerged>\d+)\s+(?<read>\d+)\s+(?<rtime>\d+)\s+(?<wcomplete>\d+)\s+(?<wmerged>\d+)\s+(?<written>\d+)\s+(?<wtime>\d+)\s+(?<ioprogress>\d+)\s+(?<iotime>\d+)\s+(?<ioweighted>\d+)\s+(?<dcomplete>\d+)\s+(?<dmerged>\d+)\s+(?<discarded>\d+)\s+(?<dtime>\d+)\s+(?<fcompleted>\d+)\s+(?<ftime>\d+)$/g)
                .exec(line);
            if (match && this._device.endsWith(match.groups?.name || '')) {
                read = parseInt(match.groups?.read || '0');
                written = parseInt(match.groups?.written || '0');
            }
        });
        return [read, written];
    }


    public constructor(name: string, device: string, standbyAfterMinutes: number = 15, checkInterval: number = 30000) {
        this._name = name;
        this._device = device;
        this._standbyAfterMinutes = standbyAfterMinutes;
        this._checkInterval = checkInterval;
    }

    public start() {
        console.log(this._name, '->', 'start monitoring', this._standbyAfterMinutes, this._checkInterval);
        let [read, written] = this.getActivity();
        this._read = read;
        this._written = written;

        this._timer = setInterval(() => {
            let [read, written] = this.getActivity();
            if ((read > this._read) || (written > this._written)) {
                console.log(this._name, '->', 'active');
                this._lastActivity = Date.now();
                this._standby = false;
            } else {
                let minutesIdle = Math.round((Date.now() - this._lastActivity) / 600) / 100;
                console.log(this._name, '->', 'idle', minutesIdle, 'minutes', this._standby ? 'standby' : 'spinning');
                if (minutesIdle >= this._standbyAfterMinutes && !this._standby) {
                    console.log(this._name, '->', 'spinning down');
                    exec('hdparm -y ' + this._device, (err, stdout, stderr) => {
                        //console.log(this._name, '->', 'stdout:', stdout);
                        //console.log(this._name, '->', 'stderr:', stderr);

                        this._standby = (err == null);
                        if (err !== null) console.log(this._name, '->', 'exec error:', err);
                    });                            
                }
            }
            this._read = read;
            this._written = written;
        }, this._checkInterval);
    }

    public stop() {
        if (this._timer != null) {
            console.log(this._name, '->', 'stop monitoring');
            clearTimeout(this._timer);
        }
    }
}