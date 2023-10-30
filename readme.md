# Hard Disk - Activity

Tool that monitors the hard disk activity via /proc/diskstats  
Puts disk into standby mode with hdparm after the defined minutes of inactivity

Created for hard disks attached to single board computer in usb enclosure that has no power management

## Installation

Build image with docker  
Must run in privileged mode for hdparm

### Docker compose

```yaml
---
version: "3"
services:
  hd-a:
    container_name: hd-a
    image: thamattie/hd-a:latest
    privileged: true
    restart: unless-stopped
    environment:
      - devices=[{"name":"Data","device":"/dev/sda"}]
```

### Device definitions

Devices are defined through the 'devices' environment variable  
Cannot contain spaces outside of the quotes  
This is a json with the folowing fields:
| Field | Type | Optional | Default | Description | Example |
| --- | --- | --- | --- | --- | --- |
| name | string | no | | the device name for logging | Data |
| device | string | no | | the device path | /dev/sda |
| standbyAfterMinutes | number | yes | 15 | minutes of inactivity before issuing standby command | 10 |
| checkInterval | number | yes | 30000 | interval (ms) for activity check | 60000 |

### Examples

- Single device, default timing:  
`[{"name":"Data","device":"/dev/sda"}]`
- Single device, standby after 10 minutes, check every minute:  
`[{"name":"Data","device":"/dev/sda","standbyAfterMinutes":10,"checkInterval",60000}]`
- Multiple devices, default timing:  
`[{"name":"Data","device":"/dev/sda"},{"name":"Media","device":"/dev/sdb"}]`