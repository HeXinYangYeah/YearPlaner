const http = require('node:http')
const crypto = require('node:crypto')

const TOKEN = 'review-access-token'
const REFRESH_TOKEN = 'review-refresh-token'
const USER_ID = 'review-user-001'

const now = () => new Date().toISOString()

const reviewUser = {
  id: USER_ID,
  openid: 'review-openid',
  nickname: '转个房体验用户',
  avatar_url: '',
  avatarUrl: '',
  role: 'sublessor',
  phone_verified: true,
  phoneVerified: true,
  face_verified: true,
  faceVerified: true,
  active_listing_id: null,
  activeListingId: null,
}

const listings = [
  {
    id: 'listing-nanshan-001',
    userId: 'owner-001',
    user_id: 'owner-001',
    title: '科技园南区 1 居转租',
    community: '科苑花园',
    district: '南山',
    subDistrict: '粤海',
    sub_district: '粤海',
    addressDisplay: '南山区科技园南区 科苑花园',
    address_display: '南山区科技园南区 科苑花园',
    roomType: 'whole',
    room_type: 'whole',
    layout: '1室1厅',
    area: 46,
    floor: 8,
    totalFloor: 28,
    total_floor: 28,
    orientation: '南',
    decoration: '精装',
    lighting: 'good',
    rent: 6800,
    deposit: 6800,
    depositType: '押一付一',
    deposit_type: '押一付一',
    availableFrom: '2026-07-10',
    available_from: '2026-07-10',
    minLeaseMonth: 6,
    min_lease_month: 6,
    description: '个人因工作调动转租，近深大地铁站，采光好，家具家电齐全。',
    facilities: {
      ac: true,
      washing_machine: true,
      refrigerator: true,
      wifi: true,
      bathroom_private: true,
      balcony: true,
      elevator: true,
      pet_allowed: false,
    },
    nearby: { metro: '1号线深大站约600米' },
    lat: 22.5391,
    lng: 113.9465,
    verifyStatus: 'passed',
    verify_status: 'passed',
    verifyScore: 92,
    verify_score: 92,
    verifyDetail: { contractChecks: { addressVerified: true } },
    verify_detail: { contractChecks: { addressVerified: true } },
    contractAddressVerified: true,
    contract_address_verified: true,
    landlordConsent: true,
    landlord_consent: true,
    viewCount: 128,
    view_count: 128,
    inquiryCount: 9,
    inquiry_count: 9,
    favoriteCount: 18,
    favorite_count: 18,
    isFavorited: false,
    is_favorited: false,
    status: 'active',
    createdAt: '2026-06-28T08:00:00.000Z',
    created_at: '2026-06-28T08:00:00.000Z',
    expiresAt: '2026-07-28T08:00:00.000Z',
    expires_at: '2026-07-28T08:00:00.000Z',
    coverImage: 'https://qcloudimg.tencent-cloud.cn/raw/7c2f7b2f37e780b58656741bd0a83f8e.jpg',
    cover_image: 'https://qcloudimg.tencent-cloud.cn/raw/7c2f7b2f37e780b58656741bd0a83f8e.jpg',
    images: [
      { url: 'https://qcloudimg.tencent-cloud.cn/raw/7c2f7b2f37e780b58656741bd0a83f8e.jpg', isCover: true, sort_order: 0, scene: 'living_room' },
      { url: 'https://qcloudimg.tencent-cloud.cn/raw/86a165a76cebe340a58dd59e55797224.jpg', isCover: false, sort_order: 1, scene: 'bedroom' },
    ],
    photos: [
      { url: 'https://qcloudimg.tencent-cloud.cn/raw/7c2f7b2f37e780b58656741bd0a83f8e.jpg', cdnUrl: 'https://qcloudimg.tencent-cloud.cn/raw/7c2f7b2f37e780b58656741bd0a83f8e.jpg', order: 0 },
      { url: 'https://qcloudimg.tencent-cloud.cn/raw/86a165a76cebe340a58dd59e55797224.jpg', cdnUrl: 'https://qcloudimg.tencent-cloud.cn/raw/86a165a76cebe340a58dd59e55797224.jpg', order: 1 },
    ],
    author: {
      id: 'owner-001',
      nickname: '南山个人转租',
      avatarUrl: '',
      creditScore: 96,
      faceVerified: true,
    },
    authorNickname: '南山个人转租',
    author_nickname: '南山个人转租',
    authorAvatar: '',
    author_avatar: '',
    authorCredit: 96,
    author_credit: 96,
  },
  {
    id: 'listing-futian-001',
    userId: 'owner-002',
    user_id: 'owner-002',
    title: '香蜜湖合租主卧',
    community: '香蜜新村',
    district: '福田',
    subDistrict: '香蜜湖',
    sub_district: '香蜜湖',
    addressDisplay: '福田区香蜜湖 香蜜新村',
    address_display: '福田区香蜜湖 香蜜新村',
    roomType: 'shared',
    room_type: 'shared',
    layout: '3室1厅',
    area: 22,
    floor: 12,
    totalFloor: 30,
    total_floor: 30,
    orientation: '东南',
    decoration: '简装',
    lighting: 'good',
    rent: 3600,
    deposit: 3600,
    depositType: '押一付一',
    deposit_type: '押一付一',
    availableFrom: '2026-07-05',
    available_from: '2026-07-05',
    minLeaseMonth: 3,
    min_lease_month: 3,
    description: '室友作息稳定，近香蜜湖地铁，适合通勤福田中心区。',
    facilities: {
      ac: true,
      washing_machine: true,
      refrigerator: true,
      wifi: true,
      bathroom_private: false,
      balcony: false,
      elevator: true,
      pet_allowed: false,
    },
    nearby: { metro: '2号线香蜜站约450米' },
    lat: 22.5482,
    lng: 114.0374,
    verifyStatus: 'registered',
    verify_status: 'registered',
    verifyScore: 86,
    verify_score: 86,
    verifyDetail: { contractChecks: { addressVerified: false } },
    verify_detail: { contractChecks: { addressVerified: false } },
    contractAddressVerified: false,
    contract_address_verified: false,
    landlordConsent: true,
    landlord_consent: true,
    viewCount: 84,
    view_count: 84,
    inquiryCount: 6,
    inquiry_count: 6,
    favoriteCount: 10,
    favorite_count: 10,
    isFavorited: false,
    is_favorited: false,
    status: 'active',
    createdAt: '2026-06-29T10:30:00.000Z',
    created_at: '2026-06-29T10:30:00.000Z',
    expiresAt: '2026-07-29T10:30:00.000Z',
    expires_at: '2026-07-29T10:30:00.000Z',
    coverImage: 'https://qcloudimg.tencent-cloud.cn/raw/294b99335427862cab54c23fdfd6076f.jpg',
    cover_image: 'https://qcloudimg.tencent-cloud.cn/raw/294b99335427862cab54c23fdfd6076f.jpg',
    images: [
      { url: 'https://qcloudimg.tencent-cloud.cn/raw/294b99335427862cab54c23fdfd6076f.jpg', isCover: true, sort_order: 0, scene: 'bedroom' },
    ],
    photos: [
      { url: 'https://qcloudimg.tencent-cloud.cn/raw/294b99335427862cab54c23fdfd6076f.jpg', cdnUrl: 'https://qcloudimg.tencent-cloud.cn/raw/294b99335427862cab54c23fdfd6076f.jpg', order: 0 },
    ],
    author: {
      id: 'owner-002',
      nickname: '福田直转',
      avatarUrl: '',
      creditScore: 93,
      faceVerified: true,
    },
    authorNickname: '福田直转',
    author_nickname: '福田直转',
    authorAvatar: '',
    author_avatar: '',
    authorCredit: 93,
    author_credit: 93,
  },
  {
    id: 'listing-baoan-001',
    userId: 'owner-003',
    user_id: 'owner-003',
    title: '宝体地铁旁单间',
    community: '海滨广场',
    district: '宝安',
    subDistrict: '宝体',
    sub_district: '宝体',
    addressDisplay: '宝安区宝体 海滨广场',
    address_display: '宝安区宝体 海滨广场',
    roomType: 'single',
    room_type: 'single',
    layout: '4室1厅',
    area: 18,
    floor: 16,
    totalFloor: 32,
    total_floor: 32,
    orientation: '西南',
    decoration: '精装',
    lighting: 'normal',
    rent: 2800,
    deposit: 2800,
    depositType: '押一付一',
    deposit_type: '押一付一',
    availableFrom: '2026-07-15',
    available_from: '2026-07-15',
    minLeaseMonth: 4,
    min_lease_month: 4,
    description: '楼下就是商圈，步行到宝体站方便，个人转租无服务费。',
    facilities: {
      ac: true,
      washing_machine: true,
      refrigerator: true,
      wifi: true,
      bathroom_private: false,
      balcony: true,
      elevator: true,
      pet_allowed: true,
    },
    nearby: { metro: '1号线宝体站约350米' },
    lat: 22.5606,
    lng: 113.8921,
    verifyStatus: 'passed',
    verify_status: 'passed',
    verifyScore: 89,
    verify_score: 89,
    verifyDetail: { contractChecks: { addressVerified: true } },
    verify_detail: { contractChecks: { addressVerified: true } },
    contractAddressVerified: true,
    contract_address_verified: true,
    landlordConsent: true,
    landlord_consent: true,
    viewCount: 64,
    view_count: 64,
    inquiryCount: 4,
    inquiry_count: 4,
    favoriteCount: 8,
    favorite_count: 8,
    isFavorited: false,
    is_favorited: false,
    status: 'active',
    createdAt: '2026-06-30T09:10:00.000Z',
    created_at: '2026-06-30T09:10:00.000Z',
    expiresAt: '2026-07-30T09:10:00.000Z',
    expires_at: '2026-07-30T09:10:00.000Z',
    coverImage: 'https://qcloudimg.tencent-cloud.cn/raw/81dedc84249bc3534c9d8f9ef37ca0f1.jpg',
    cover_image: 'https://qcloudimg.tencent-cloud.cn/raw/81dedc84249bc3534c9d8f9ef37ca0f1.jpg',
    images: [
      { url: 'https://qcloudimg.tencent-cloud.cn/raw/81dedc84249bc3534c9d8f9ef37ca0f1.jpg', isCover: true, sort_order: 0, scene: 'bedroom' },
    ],
    photos: [
      { url: 'https://qcloudimg.tencent-cloud.cn/raw/81dedc84249bc3534c9d8f9ef37ca0f1.jpg', cdnUrl: 'https://qcloudimg.tencent-cloud.cn/raw/81dedc84249bc3534c9d8f9ef37ca0f1.jpg', order: 0 },
    ],
    author: {
      id: 'owner-003',
      nickname: '宝安个人转租',
      avatarUrl: '',
      creditScore: 91,
      faceVerified: true,
    },
    authorNickname: '宝安个人转租',
    author_nickname: '宝安个人转租',
    authorAvatar: '',
    author_avatar: '',
    authorCredit: 91,
    author_credit: 91,
  },
]

const favorites = new Set(['listing-nanshan-001'])
const conversations = new Map()
const messages = new Map()

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function toCard(listing) {
  return {
    id: listing.id,
    title: listing.title,
    community: listing.community,
    district: listing.district,
    roomType: listing.roomType,
    room_type: listing.room_type,
    layout: listing.layout,
    area: listing.area,
    rent: listing.rent,
    coverImage: listing.coverImage,
    cover_image: listing.cover_image,
    verifyStatus: listing.verifyStatus,
    verify_status: listing.verify_status,
    contractAddressVerified: listing.contractAddressVerified,
    contract_address_verified: listing.contract_address_verified,
    landlordConsent: listing.landlordConsent,
    landlord_consent: listing.landlord_consent,
    lighting: listing.lighting,
    hasBalcony: !!listing.facilities?.balcony,
    privateBathroom: !!listing.facilities?.bathroom_private,
    nearbyMetro: listing.nearby?.metro || null,
    availableFrom: listing.availableFrom,
    available_from: listing.available_from,
    isFavorited: favorites.has(listing.id),
    authorNickname: listing.authorNickname,
    author_nickname: listing.author_nickname,
    authorAvatar: listing.authorAvatar,
    author_avatar: listing.author_avatar,
    authorCredit: listing.authorCredit,
    author_credit: listing.author_credit,
    createdAt: listing.createdAt,
    created_at: listing.created_at,
  }
}

function activeListings() {
  return listings.filter((listing) => listing.status === 'active')
}

function searchListings(query) {
  let rows = activeListings()
  const keyword = String(query.get('keyword') || '').trim().toLowerCase()
  const district = String(query.get('district') || '').trim()
  const roomType = String(query.get('roomType') || query.get('room_type') || '').trim()
  const minRent = Number(query.get('minRent') || query.get('min_rent') || '')
  const maxRent = Number(query.get('maxRent') || query.get('max_rent') || '')
  const sort = String(query.get('sort') || 'newest')
  const page = Math.max(1, Number(query.get('page') || 1))
  const pageSize = Math.min(50, Math.max(1, Number(query.get('pageSize') || query.get('page_size') || 20)))

  if (keyword) {
    rows = rows.filter((listing) => [
      listing.title,
      listing.community,
      listing.district,
      listing.subDistrict,
      listing.addressDisplay,
      listing.description,
      listing.nearby?.metro,
    ].filter(Boolean).some((text) => String(text).toLowerCase().includes(keyword)))
  }
  if (district && district !== '全部') rows = rows.filter((listing) => listing.district === district)
  if (roomType) rows = rows.filter((listing) => listing.roomType === roomType)
  if (Number.isFinite(minRent) && minRent > 0) rows = rows.filter((listing) => listing.rent >= minRent)
  if (Number.isFinite(maxRent) && maxRent > 0) rows = rows.filter((listing) => listing.rent <= maxRent)

  if (sort === 'rent_asc') rows = rows.slice().sort((a, b) => a.rent - b.rent)
  else if (sort === 'rent_desc') rows = rows.slice().sort((a, b) => b.rent - a.rent)
  else rows = rows.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))

  const total = rows.length
  const offset = (page - 1) * pageSize
  const items = rows.slice(offset, offset + pageSize).map(toCard)

  return {
    items,
    total,
    page,
    pageSize,
    hasMore: offset + items.length < total,
  }
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  res.writeHead(status, {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
    'cache-control': 'no-store',
    'content-type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    ...headers,
  })
  res.end(payload)
}

function sendJson(res, body, status = 200) {
  send(res, status, body)
}

function notFound(res, path) {
  sendJson(res, { message: `Route not found: ${path}` }, 404)
}

function badRequest(res, message) {
  sendJson(res, { message }, 400)
}

function absoluteUrl(req, path) {
  const proto = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http')
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'
  return `${proto}://${host}${path}`
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 12 * 1024 * 1024) {
        reject(new Error('request body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      const buffer = Buffer.concat(chunks)
      const contentType = req.headers['content-type'] || ''
      if (!buffer.length) {
        resolve({})
        return
      }
      if (!String(contentType).includes('application/json')) {
        resolve({ rawBody: buffer })
        return
      }
      try {
        resolve(JSON.parse(buffer.toString('utf8')))
      } catch {
        reject(new Error('invalid json body'))
      }
    })
    req.on('error', reject)
  })
}

function createConversation(body = {}) {
  const listingId = body.listingId || body.listing_id || 'listing-nanshan-001'
  const landlordId = body.landlordId || body.landlord_id || 'owner-001'
  const id = `conv-${listingId}-${landlordId}`.replace(/[^a-zA-Z0-9_-]/g, '-')
  const listing = listings.find((item) => item.id === listingId) || listings[0]
  if (!conversations.has(id)) {
    conversations.set(id, {
      id,
      listing_id: listingId,
      listingId,
      landlord_id: landlordId,
      landlordId,
      other_nickname: listing.authorNickname || '转租人',
      other_avatar: '',
      listing_community: listing.community,
      last_msg_at: now(),
      last_msg_preview: '您好，想了解这套房源',
      my_unread: 0,
    })
    messages.set(id, [
      {
        id: `msg-${id}-welcome`,
        sender_id: landlordId,
        senderId: landlordId,
        content_type: 'text',
        contentType: 'text',
        content: '您好，这套转租信息还在，欢迎咨询看房时间。',
        created_at: now(),
        createdAt: now(),
      },
    ])
  }
  return conversations.get(id)
}

async function handleApi(req, res, url, body) {
  const { pathname, searchParams } = url
  const method = req.method || 'GET'

  if ((pathname === '/health' || pathname === '/api/v1/health') && method === 'GET') {
    return sendJson(res, { status: 'ok', service: 'zhuange-review-api', time: now() })
  }

  if (pathname === '/' && method === 'GET') {
    return sendJson(res, {
      service: 'zhuange-review-api',
      message: '转个房微信云托管审核版 API 运行中',
      health: '/health',
    })
  }

  if (!pathname.startsWith('/api/v1')) {
    return notFound(res, pathname)
  }

  const path = pathname.slice('/api/v1'.length) || '/'

  if (path === '/auth/wx-login' && method === 'POST') {
    return sendJson(res, { accessToken: TOKEN, refreshToken: REFRESH_TOKEN })
  }
  if (path === '/auth/send-sms' && method === 'POST') {
    return sendJson(res, { success: true, message: '验证码已发送' })
  }
  if (path === '/auth/bind-phone' && method === 'POST') {
    return sendJson(res, { success: true, phone: body.phone || '' })
  }
  if (path === '/users/me' && method === 'GET') {
    return sendJson(res, clone(reviewUser))
  }
  if (path === '/users/can-publish' && method === 'GET') {
    return sendJson(res, { canPublish: true, activeListingId: null })
  }
  if (path === '/users/verify-identity' && method === 'POST') {
    return sendJson(res, { success: true, message: '认证已通过' })
  }
  if (path === '/users/me/listings' && method === 'GET') {
    return sendJson(res, listings.filter((item) => item.userId === USER_ID).map(toCard))
  }
  if (path === '/users/me/orders' && method === 'GET') {
    return sendJson(res, { items: [], total: 0, page: 1, pageSize: 20, hasMore: false })
  }

  if ((path === '/listings' || path === '/search/listings') && method === 'GET') {
    return sendJson(res, searchListings(searchParams))
  }
  if ((path === '/listings/recommend' || path === '/listings/recommended') && method === 'GET') {
    return sendJson(res, activeListings().slice(0, 20).map(toCard))
  }
  if (path === '/listings/map' && method === 'GET') {
    return sendJson(res, activeListings().map((listing) => ({
      id: listing.id,
      community: listing.community,
      district: listing.district,
      roomType: listing.roomType,
      rent: listing.rent,
      lat: listing.lat,
      lng: listing.lng,
    })))
  }
  if (path === '/listings/favorites/my' && method === 'GET') {
    return sendJson(res, activeListings().filter((listing) => favorites.has(listing.id)).map(toCard))
  }
  if (path === '/listings/my/listings' && method === 'GET') {
    return sendJson(res, activeListings().filter((listing) => listing.userId === USER_ID).map(toCard))
  }
  if (path === '/listings' && method === 'POST') {
    if (!body.landlordConsent) {
      return badRequest(res, '请先确认已征得房东同意转租')
    }
    const id = `listing-review-${Date.now()}`
    const createdAt = now()
    const listing = {
      ...listings[0],
      ...body,
      id,
      userId: USER_ID,
      user_id: USER_ID,
      title: `${body.community || '转租房源'} 转租`,
      room_type: body.roomType,
      address_display: body.addressDisplay,
      available_from: body.availableFrom,
      min_lease_month: body.minLeaseMonth || 1,
      landlord_consent: true,
      verifyStatus: 'registered',
      verify_status: 'registered',
      verifyScore: 88,
      verify_score: 88,
      contractAddressVerified: false,
      contract_address_verified: false,
      coverImage: body.photos?.[0]?.cdnUrl || body.photos?.[0]?.url || listings[0].coverImage,
      cover_image: body.photos?.[0]?.cdnUrl || body.photos?.[0]?.url || listings[0].coverImage,
      images: (body.photos || []).map((photo, index) => ({
        url: photo.cdnUrl || photo.url,
        isCover: index === 0,
        sort_order: index,
        scene: photo.scene || 'other',
      })),
      photos: body.photos || [],
      author: { ...reviewUser, nickname: reviewUser.nickname },
      authorNickname: reviewUser.nickname,
      author_nickname: reviewUser.nickname,
      status: 'active',
      createdAt,
      created_at: createdAt,
      expiresAt: createdAt,
      expires_at: createdAt,
      viewCount: 0,
      view_count: 0,
      inquiryCount: 0,
      inquiry_count: 0,
      favoriteCount: 0,
      favorite_count: 0,
    }
    listings.unshift(listing)
    return sendJson(res, clone(listing))
  }

  const listingActionMatch = path.match(/^\/listings\/([^/]+)(?:\/([^/]+))?$/)
  if (listingActionMatch) {
    const [, id, action] = listingActionMatch
    const listing = listings.find((item) => item.id === id)
    if (!listing) return sendJson(res, { message: '房源不存在' }, 404)
    if (!action && method === 'GET') {
      return sendJson(res, clone({ ...listing, isFavorited: favorites.has(id), is_favorited: favorites.has(id) }))
    }
    if (!action && method === 'DELETE') {
      listing.status = 'inactive'
      return sendJson(res, { success: true, message: '房源已下架' })
    }
    if (action === 'favorite' && method === 'POST') {
      if (favorites.has(id)) favorites.delete(id)
      else favorites.add(id)
      return sendJson(res, { favorited: favorites.has(id) })
    }
    if ((action === 'refresh' || action === 'renew') && method === 'POST') {
      listing.createdAt = now()
      listing.created_at = listing.createdAt
      return sendJson(res, { success: true, message: '已刷新' })
    }
    if (action === 'mark-sold' && method === 'POST') {
      listing.status = 'inactive'
      return sendJson(res, { success: true, message: '已标记转出', reviewWindowOpened: false })
    }
    if (action === 'report' && method === 'POST') {
      return sendJson(res, { success: true, message: '举报已提交' })
    }
    if (action === 'boost' && method === 'POST') {
      return sendJson(res, { message: '个人主体首版暂未开放增值服务' }, 400)
    }
  }

  if (path === '/files/presign' && method === 'POST') {
    const scene = String(body.scene || 'file').replace(/[^a-zA-Z0-9_-]/g, '-')
    const objectKey = `review-${scene}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
    return sendJson(res, {
      uploadUrl: absoluteUrl(req, `/api/v1/files/upload/${objectKey}`),
      objectKey,
    })
  }
  if (path.startsWith('/files/upload/') && (method === 'POST' || method === 'PUT')) {
    return sendJson(res, { success: true, objectKey: path.split('/').pop() })
  }
  if (path === '/files/confirm' && method === 'POST') {
    return sendJson(res, {
      cdnUrl: absoluteUrl(req, `/api/v1/files/mock/${encodeURIComponent(body.objectKey || 'asset')}`),
    })
  }
  if (path === '/files/watermark' && method === 'POST') {
    return sendJson(res, {
      cdnUrl: absoluteUrl(req, `/api/v1/files/mock/${encodeURIComponent(body.objectKey || 'asset')}`),
      objectKey: body.objectKey,
      scene: body.scene,
    })
  }
  if (path.startsWith('/files/mock/') && method === 'GET') {
    return send(res, 200, 'review asset placeholder')
  }

  if (path === '/conversations' && method === 'GET') {
    return sendJson(res, Array.from(conversations.values()))
  }
  if (path === '/conversations' && method === 'POST') {
    return sendJson(res, createConversation(body))
  }
  const messageMatch = path.match(/^\/conversations\/([^/]+)\/messages$/)
  if (messageMatch && method === 'GET') {
    const id = messageMatch[1]
    createConversation({ listingId: id })
    return sendJson(res, messages.get(id) || [])
  }
  if (messageMatch && method === 'POST') {
    const id = messageMatch[1]
    if (!conversations.has(id)) {
      conversations.set(id, {
        id,
        other_nickname: '转租人',
        other_avatar: '',
        listing_community: '咨询房源',
        my_unread: 0,
      })
      messages.set(id, [])
    }
    const message = {
      id: `msg-${Date.now()}`,
      sender_id: USER_ID,
      senderId: USER_ID,
      content_type: 'text',
      contentType: 'text',
      content: String(body.content || '').slice(0, 500),
      created_at: now(),
      createdAt: now(),
    }
    messages.get(id).push(message)
    conversations.get(id).last_msg_at = message.created_at
    conversations.get(id).last_msg_preview = message.content
    return sendJson(res, message)
  }

  const reviewMatch = path.match(/^\/reviews\/listing\/([^/]+)$/)
  if (reviewMatch && method === 'GET') {
    return sendJson(res, { count: 0, avgScore: null, latest: [] })
  }
  const reviewSubmitMatch = path.match(/^\/reviews\/([^/]+)\/submit$/)
  if (reviewSubmitMatch && method === 'POST') {
    return sendJson(res, { success: true, message: '评价已提交' })
  }

  return notFound(res, pathname)
}

function createServer() {
  return http.createServer(async (req, res) => {
    res.setHeader('access-control-allow-origin', '*')
    res.setHeader('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.setHeader('access-control-allow-headers', 'content-type,authorization')
    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    try {
      const body = await readBody(req)
      await handleApi(req, res, url, body)
    } catch (error) {
      sendJson(res, { message: error.message || '服务异常' }, 500)
    }
  })
}

if (require.main === module) {
  const port = Number(process.env.PORT || 80)
  createServer().listen(port, '0.0.0.0', () => {
    console.log(`zhuange-review-api listening on ${port}`)
  })
}

module.exports = { createServer }
