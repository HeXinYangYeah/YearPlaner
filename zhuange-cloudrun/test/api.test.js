const assert = require('node:assert/strict')
const { test, before, after } = require('node:test')
const { createServer } = require('../server')

let server
let baseUrl

function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer review-access-token',
      ...(options.headers || {}),
    },
  })
}

async function json(path, options) {
  const res = await request(path, options)
  const body = await res.json()
  return { res, body }
}

before(async () => {
  server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  baseUrl = `http://127.0.0.1:${port}`
})

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()))
  })
})

test('serves health checks for CloudRun probes', async () => {
  const { res, body } = await json('/health')
  assert.equal(res.status, 200)
  assert.equal(body.status, 'ok')
  assert.equal(body.service, 'zhuange-review-api')
})

test('returns searchable listing results with pagination', async () => {
  const { res, body } = await json('/api/v1/listings?district=南山&roomType=whole')
  assert.equal(res.status, 200)
  assert.ok(Array.isArray(body.items))
  assert.ok(body.items.length >= 1)
  assert.ok(body.items.every((item) => item.district === '南山'))
  assert.ok(body.items.every((item) => item.roomType === 'whole'))
  assert.equal(body.page, 1)
  assert.equal(body.pageSize, 20)
})

test('supports recommendation and detail routes used by the mini program', async () => {
  const recommended = await json('/api/v1/listings/recommend')
  assert.equal(recommended.res.status, 200)
  assert.ok(Array.isArray(recommended.body))
  assert.ok(recommended.body.length >= 2)

  const id = recommended.body[0].id
  const detail = await json(`/api/v1/listings/${id}`)
  assert.equal(detail.res.status, 200)
  assert.equal(detail.body.id, id)
  assert.ok(Array.isArray(detail.body.images))
  assert.ok(detail.body.author.nickname)
})

test('returns tokens and current user for login flow', async () => {
  const login = await json('/api/v1/auth/wx-login', {
    method: 'POST',
    body: JSON.stringify({ code: 'wx-test-code' }),
  })
  assert.equal(login.res.status, 200)
  assert.equal(login.body.accessToken, 'review-access-token')
  assert.equal(login.body.refreshToken, 'review-refresh-token')

  const me = await json('/api/v1/users/me')
  assert.equal(me.res.status, 200)
  assert.equal(me.body.id, 'review-user-001')
  assert.equal(me.body.phone_verified, true)
  assert.equal(me.body.face_verified, true)
})

test('supports upload presign and publish submission paths', async () => {
  const presign = await json('/api/v1/files/presign', {
    method: 'POST',
    body: JSON.stringify({ filename: 'living-room.jpg', scene: 'living_room' }),
  })
  assert.equal(presign.res.status, 200)
  assert.match(presign.body.uploadUrl, /\/api\/v1\/files\/upload\//)
  assert.match(presign.body.objectKey, /^review-living_room-/)

  const created = await json('/api/v1/listings', {
    method: 'POST',
    body: JSON.stringify({
      district: '福田',
      community: '测试花园',
      addressDisplay: '福田区测试路 1 号',
      roomType: 'shared',
      layout: '2室1厅',
      area: 72,
      rent: 5200,
      landlordConsent: true,
      photos: [{ cdnUrl: 'https://example.invalid/photo.jpg', order: 0 }],
    }),
  })
  assert.equal(created.res.status, 200)
  assert.equal(created.body.community, '测试花园')
  assert.equal(created.body.verify_status, 'registered')
})

test('supports conversations and message send flow', async () => {
  const conversation = await json('/api/v1/conversations', {
    method: 'POST',
    body: JSON.stringify({ listingId: 'listing-nanshan-001', landlordId: 'owner-001' }),
  })
  assert.equal(conversation.res.status, 200)
  assert.ok(conversation.body.id)

  const sent = await json(`/api/v1/conversations/${conversation.body.id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content: '您好，想约看房' }),
  })
  assert.equal(sent.res.status, 200)
  assert.equal(sent.body.content, '您好，想约看房')

  const messages = await json(`/api/v1/conversations/${conversation.body.id}/messages`)
  assert.equal(messages.res.status, 200)
  assert.ok(messages.body.some((message) => message.content === '您好，想约看房'))
})
