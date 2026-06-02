import { vi, test, expect, beforeEach } from 'vitest'
import { POST } from "@/app/api/tasks/complete/route"
import { createClient } from "@/lib/supabase/server"

vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn(),
}))

function makeClient({ user = { id: "123" }, task = { id: "1", interval_days: 7 }, updateError = null } = {}) {
    return {
        auth: {
            getUser: vi.fn(async () => ({ data: { user } })),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    maybeSingle: vi.fn(async () => ({ data: task })),
                })),
            })),
            update: vi.fn(() => ({
                eq: vi.fn(async () => ({ error: updateError })),
            })),
        })),
    }
}

function makeRequest(body) {
    return { json: async () => body }
}

beforeEach(() => {
    vi.clearAllMocks()
})

test("404 Not Signed in", async () => {
    createClient.mockResolvedValue(makeClient({ user: null }))

    const res = await POST(makeRequest({ taskId: "1" }))

    expect(res.status).toBe(401)
})

test("400 Bad Request", async () => {
    createClient.mockResolvedValue(makeClient())

    const res = await POST(makeRequest({}))

    expect(res.status).toBe(400)
})

test("404 Not Found", async () => {
    createClient.mockResolvedValue(makeClient({ task: null }))

    const res = await POST(makeRequest({ taskId: "1" }))

    expect(res.status).toBe(404)
})

test("500 Internal Server Error", async () => {
    createClient.mockResolvedValue(makeClient({ updateError: { message: "db error" } }))

    const res = await POST(makeRequest({ taskId: "1" }))

    expect(res.status).toBe(500)
})

test("200 OK", async () => {
    createClient.mockResolvedValue(makeClient())

    const res = await POST(makeRequest({ taskId: "1" }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.next_due_at).toEqual(expect.any(String))
})