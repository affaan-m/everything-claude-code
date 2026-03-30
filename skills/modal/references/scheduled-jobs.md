# Modal Scheduled Jobs

## Overview

Modal supports running functions automatically on a schedule, either using cron syntax or fixed intervals. Deploy scheduled functions with `modal deploy` and they run unattended in the cloud.

## Schedule Types

### modal.Cron

Standard cron syntax — stable across deploys:

```python
import modal

app = modal.App("scheduled-tasks")

# Daily at 9 AM UTC
@app.function(schedule=modal.Cron("0 9 * * *"))
def daily_report():
    generate_and_send_report()

# Every Monday at midnight
@app.function(schedule=modal.Cron("0 0 * * 1"))
def weekly_cleanup():
    cleanup_old_data()

# Every 15 minutes
@app.function(schedule=modal.Cron("*/15 * * * *"))
def frequent_check():
    check_system_health()
```

#### Cron Syntax Reference

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sun=0)
│ │ │ │ │
* * * * *
```

| Pattern | Meaning |
|---------|---------|
| `0 9 * * *` | Daily at 9:00 AM UTC |
| `0 */6 * * *` | Every 6 hours |
| `*/30 * * * *` | Every 30 minutes |
| `0 0 * * 1` | Every Monday at midnight |
| `0 0 1 * *` | First day of every month |
| `0 9 * * 1-5` | Weekdays at 9 AM |

### modal.Period

Fixed interval — resets on each deploy:

```python
# Every 5 hours
@app.function(schedule=modal.Period(hours=5))
def periodic_sync():
    sync_data()

# Every 30 minutes
@app.function(schedule=modal.Period(minutes=30))
def poll_updates():
    check_for_updates()

# Every day
@app.function(schedule=modal.Period(days=1))
def daily_task():
    ...
```

`modal.Period` resets its timer on each deployment. If you need a schedule that doesn't shift with deploys, use `modal.Cron`.

## Deploying Scheduled Functions

Schedules only activate when deployed:

```bash
modal deploy script.py
```

`modal run` and `modal serve` do not activate schedules.

## Monitoring

- View scheduled runs in the **Apps** section of the Modal dashboard
- Each run appears with its status, duration, and logs
- Use the **"Run Now"** button on the dashboard to trigger manually

## Management

- Schedules cannot be paused — remove the schedule and redeploy to stop
- To change a schedule, update the `schedule` parameter and redeploy
- To stop entirely, either remove the `schedule` parameter or run `modal app stop <name>`

## Common Patterns

### ETL Pipeline

```python
@app.function(
    schedule=modal.Cron("0 2 * * *"),  # 2 AM UTC daily
    secrets=[modal.Secret.from_name("db-creds")],
    timeout=7200,
)
def etl_pipeline():
    import os
    data = extract(os.environ["SOURCE_DB_URL"])
    transformed = transform(data)
    load(transformed, os.environ["DEST_DB_URL"])
```

### Model Retraining

```python
@app.function(
    schedule=modal.Cron("0 0 * * 0"),  # Weekly on Sunday
    gpu="H100",
    volumes={"/data": data_vol, "/models": model_vol},
    timeout=86400,
)
def retrain():
    model = train_on_latest_data("/data/training/")
    torch.save(model.state_dict(), "/models/latest.pt")
```

### Health Checks

```python
@app.function(
    schedule=modal.Period(minutes=5),
    secrets=[modal.Secret.from_name("slack-webhook")],
)
def health_check():
    import os, requests
    status = check_all_services()
    if not status["healthy"]:
        requests.post(os.environ["SLACK_URL"], json={"text": f"Alert: {status}"})
```
