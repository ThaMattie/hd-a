import { env } from "process";
import { ActivityMonitor } from "./activity-monitor";



const monitor = new ActivityMonitor('Software', '/dev/sdc', 1, 5000);
setTimeout(() => { monitor.stop() }, 180000);
monitor.start();