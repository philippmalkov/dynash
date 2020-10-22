Yarn: `yarn`

Create and run influxdb:

```
docker run --name influxdb -p 8086:8086 quay.io/influxdb/influxdb:2.0.0-rc -d
```

Run/restart/stop influxdb:

```
docker start/restart/stop influxdb
```

Deploy Dynamo:

```
AWS_PROFILE=myaccess AWS_DEFAULT_REGION=eu-central-1 sls deploy
```
