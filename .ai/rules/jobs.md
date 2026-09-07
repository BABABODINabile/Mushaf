---
paths:
  - 'app/Jobs/**'
---

# Jobs

## Rappels emails en synchrone, pas de queue worker
Pas de worker de queue ne tourne (QUEUE_CONNECTION=database). Les jobs/mails de rappel (SendDailyReminders, ReminderMail) sont volontairement SYNCHRONES (pas de ShouldQueue) : leurs imports Queueable/Dispatchable/Serialize/SerializesModels sont retirés. Ne pas réintroduire ShouldQueue sans déployer un worker + scheduler.
