Yarn: `yarn`

Create and run Telegraf:

```
docker run -d --name telegraf -p 8125:8125 telegraf
```

Go to the Telegraf container and edit config:

```
> docker exec -it telegraf bash
container:/#> apt update && apt install nano
container:/#> nano /etc/telegraf/telegraf.conf
container:/#> exit
> docker restart telegraf
```

Change Telegraf config sections or use your own (`telegraf.conf`):

```
# Statsd Server
[[inputs.statsd]]
  ## Protocol, must be "tcp", "udp4", "udp6" or "udp" (default=udp)
  protocol = "udp"

  ## MaxTCPConnection - applicable when protocol is set to tcp (default=250)
  max_tcp_connections = 250

  ## Enable TCP keep alive probes (default=false)
  tcp_keep_alive = false

  ## Address and port to host UDP listener on
  service_address = ":8125"

  ## The following configuration options control when telegraf clears it's cache
  ## of previous values. If set to false, then telegraf will only clear it's
  ## cache when the daemon is restarted.
  ## Reset gauges every interval (default=true)
  delete_gauges = true
  ## Reset counters every interval (default=true)
  delete_counters = true
  ## Reset sets every interval (default=true)
  delete_sets = true
  ## Reset timings & histograms every interval (default=true)
  delete_timings = true

  ## Percentiles to calculate for timing & histogram stats.
  percentiles = [50.0, 90.0, 99.0, 99.9, 99.95, 100.0]

  ## separator to use between elements of a statsd metric
  metric_separator = "_"

  ## Parses tags in the datadog statsd format
  ## http://docs.datadoghq.com/guides/dogstatsd/
  ## deprecated in 1.10; use datadog_extensions option instead
  parse_data_dog_tags = false

  ## Parses extensions to statsd in the datadog statsd format
  ## currently supports metrics and datadog tags.
  ## http://docs.datadoghq.com/guides/dogstatsd/
  datadog_extensions = false

  ## Number of UDP messages allowed to queue up, once filled,
  ## the statsd server will start dropping packets
  allowed_pending_messages = 10000

  ## Number of timing/histogram values to track per-measurement in the
  ## calculation of percentiles. Raising this limit increases the accuracy
  ## of percentiles but also increases the memory usage and cpu time.
  percentile_limit = 1000

  ## Maximum socket buffer size in bytes, once the buffer fills up, metrics
  ## will start dropping.  Defaults to the OS default.
  # read_buffer_size = 65535

# ---

# Configuration for sending metrics to InfluxDB
[[outputs.influxdb_v2]]
  ## The URLs of the InfluxDB cluster nodes.
  ##
  ## Multiple URLs can be specified for a single cluster, only ONE of the
  ## urls will be written to each interval.
  ##   ex: urls = ["https://us-west-2-1.aws.cloud2.influxdata.com"]
  urls = ["http://localhost:8086"]

  ## Token for authentication.
  token = "<YOUR_TOKEN>"

  ## Organization is the name of the organization you wish to write to; must exist.
  organization = "<YOUR_ORG_NAME>"

  ## Destination bucket to write into.
  bucket = "<YOUR_BACKET_NAME>"
```

Create and run influxdb:

```
docker run -d --name influxdb -p 8086:8086 quay.io/influxdb/influxdb:2.0.0-rc
```

Run/restart/stop influxdb: `docker start/restart/stop influxdb`

Bootstrap localstack:

```
docker-compose up -d
```

Deploy Dynamo:

```
AWS_PROFILE=myaccess AWS_DEFAULT_REGION=eu-central-1 sls deploy
```

Deploy Dynamo on local:

```
AWS_PROFILE=myaccess AWS_DEFAULT_REGION=eu-central-1 sls deploy --stage local
```

Before bootstrapping to localstack edit `.env` file:

```
AWS_ENDPOINT='http://localhost:4566'
```

Bootstrap sample Dynamo data:

```
yarn run generate
```
