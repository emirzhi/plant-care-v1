import { getWebPush } from "@/lib/webpush";

const DEFAULT_HOUR = 9;

async function fetchDueTasks(admin) {
    const { data, error } = await admin
        .from("care_tasks")
        .select("id, task_type, next_due_at, last_notified_at, plant:plants(id, user_id, nickname, species_common)")
        .lte("next_due_at", new Date().toISOString())
        .eq("paused", false);

    if (error) throw new Error(error.message);
    return data ?? [];
}

function pendingOnly(dueTasks) {
    return dueTasks.filter(
        (t) => !t.last_notified_at || new Date(t.last_notified_at) < new Date(t.next_due_at),
    );
}

function foldByUser(dueTasks) {
    const reminders = new Map();

    for (const { id, task_type, plant } of dueTasks) {
        if (!plant) continue;

        let reminder = reminders.get(plant.user_id);
        if (!reminder) {
            reminder = { plants: new Map(), taskIds: [] };
            reminders.set(plant.user_id, reminder);
        }

        let entry = reminder.plants.get(plant.id);
        if (!entry) {
            entry = { name: plant.nickname || plant.species_common || "A plant", tasks: new Set() };
            reminder.plants.set(plant.id, entry);
        }

        entry.tasks.add(task_type);
        reminder.taskIds.push(id);
    }

    return reminders;
}

function toPayload(plants) {
    const names = [...plants.values()].map((p) => p.name);
    const preview = names.slice(0, 3).join(", ");

    return {
        title: names.length === 1 ? `${names[0]} needs care` : `${names.length} plants need care`,
        body: names.length > 3 ? `${preview} +${names.length - 3} more` : preview,
        url: "/plants",
        tag: "plant-care-due",
    };
}

function hourInZone(now, timeZone) {
    try {
        return Number(
            new Intl.DateTimeFormat("en-US", { hour: "2-digit", hourCycle: "h23", timeZone }).format(now),
        );
    } catch {
        return now.getUTCHours();
    }
}

async function loadProfiles(admin, userIds) {
    const { data } = await admin
        .from("profiles")
        .select("id, push_subscription, timezone, reminder_hour")
        .in("id", userIds);

    return new Map((data ?? []).map((p) => [p.id, p]));
}

export async function sendDueReminders(admin, now = new Date()) {
    const dueTasks = pendingOnly(await fetchDueTasks(admin));
    const reminders = foldByUser(dueTasks);

    if (reminders.size === 0) {
        return { usersWithDue: 0, usersNotified: 0, expiredCleared: 0, tasksDue: 0 };
    }

    const profiles = await loadProfiles(admin, [...reminders.keys()]);
    const webpush = getWebPush();
    const expired = [];
    const notifiedTaskIds = [];
    let usersNotified = 0;

    await Promise.all(
        [...reminders].map(async ([userId, reminder]) => {
            const profile = profiles.get(userId);
            if (!profile?.push_subscription) return;

            const targetHour = profile.reminder_hour ?? DEFAULT_HOUR;
            if (hourInZone(now, profile.timezone || "UTC") !== targetHour) return;

            try {
                await webpush.sendNotification(
                    profile.push_subscription,
                    JSON.stringify(toPayload(reminder.plants)),
                );
                usersNotified++;
                notifiedTaskIds.push(...reminder.taskIds);
            } catch (err) {
                if (err?.statusCode === 404 || err?.statusCode === 410) expired.push(userId);
            }
        }),
    );
  
    if (notifiedTaskIds.length > 0) {
        await admin
            .from("care_tasks")
            .update({ last_notified_at: now.toISOString() })
            .in("id", notifiedTaskIds);
    }

    if (expired.length > 0) {
        await admin.from("profiles").update({ push_subscription: null }).in("id", expired);
    }

    return {
        usersWithDue: reminders.size,
        usersNotified,
        expiredCleared: expired.length,
        tasksDue: dueTasks.length,
    };
}
