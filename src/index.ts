import { env } from "process";
import { Device } from "./device";
import { ActivityMonitor } from "./activity-monitor";

const devices: Device[] = JSON.parse(env.devices || '[]');
if (devices.length === 0) console.log('No devices devices defined. Use environment variable "devices" to provide an array of devices to monitor');
devices.forEach((d) => new ActivityMonitor(d.name, d.device, d.standbyAfterMinutes, d.checkInterval).start());
