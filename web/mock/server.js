import http from 'node:http'
import { URL } from 'node:url'
import { users, codes, documents, auditLog } from './seeds.js'

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`)
  const path = url.pathname
  const method = req.method || 'GET'

  // CORS for direct access (proxy generally handles origin)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match')
  if (method === 'OPTIONS') { res.writeHead(200); res.end(); return }

  try {
    if (path === '/codes/companies' || path === '/codes/subsidiaries' || path === '/codes/departments' || path === '/codes/types') {
      const kind = path.split('/').pop()
      const list = codes[kind]
      const etag = 'W/"' + JSON.stringify(list).length + '"'
      const inm = req.headers['if-none-match']
      if (inm && inm === etag) { res.writeHead(304); res.end(); return }
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('ETag', etag)
      res.writeHead(200)
      res.end(JSON.stringify({ list }))
      return
    }

    if (path === '/users' && method === 'GET') {
      return json(res, users)
    }

    if (path.startsWith('/documents') && method === 'GET') {
      const byCode = url.searchParams.get('code')
      if (byCode) {
        const d = documents.find(x => x.ID === byCode)
        return json(res, d || null)
      }
      const parts = path.split('/')
      if (parts.length === 3) {
        const id = decodeURIComponent(parts[2])
        const d = documents.find(x => x.ID === id)
        return json(res, d || null)
      }
    }

    if (path === '/documents' && method === 'POST') {
      const body = await readJson(req)
      // Accept draft creation
      return json(res, { ok: true, id: body?.ID || 'NEW-ID' })
    }

    if (path.startsWith('/files/pdf/') && method === 'GET') {
      res.setHeader('Content-Type', 'application/pdf')
      res.writeHead(200)
      res.end('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF')
      return
    }

    if (path === '/search' && method === 'GET') {
      const text = (url.searchParams.get('q') || '').toLowerCase()
      const page = Number(url.searchParams.get('page') || '1')
      const pageSize = Number(url.searchParams.get('pageSize') || '20')
      let items = documents.map(d => ({ ID: d.ID, Title: d.Title, Status: d.Status, Version: d.Version, Owner: d.Owner, Controller: d.Controller, Updated: d.Metadata.ReviewDate }))
      if (text) items = items.filter(r => r.Title.toLowerCase().includes(text) || r.ID.toLowerCase().includes(text))
      const total = items.length
      const start = (page-1)*pageSize
      const paged = items.slice(start, start+pageSize)
      const facets = buildFacets(documents)
      return json(res, { items: paged, total, facets })
    }

    if (path === '/audit' && method === 'GET') {
      const list = auditLog.slice(0, 200)
      return json(res, list)
    }
    if (path === '/audit' && method === 'POST') {
      const body = await readJson(req)
      const entry = { id: String(Date.now()), timestamp: new Date().toISOString(), ...body }
      auditLog.unshift(entry)
      return json(res, { ok: true, id: entry.id })
    }

    // default 404
    res.writeHead(404)
    res.end('Not found')
  } catch (e) {
    res.writeHead(500)
    res.end('Server error')
  }
})

function json(res, data) { res.setHeader('Content-Type', 'application/json'); res.writeHead(200); res.end(JSON.stringify(data)); }
function readJson(req) { return new Promise((resolve) => { let b=''; req.on('data', c => b+=c); req.on('end',()=>{ try{ resolve(JSON.parse(b||'{}')) } catch { resolve({}) } }) }) }
function buildFacets(docs) {
  const by = (field) => {
    const m = new Map()
    for (const d of docs) { const k = (d.Metadata[field]||''); m.set(k, (m.get(k)||0)+1) }
    return { field, buckets: Array.from(m.entries()).map(([key,count])=>({ key, count })) }
  }
  return [ by('DepartmentCode'), by('DocumentTypeCode') ]
}

const PORT = process.env.MOCK_PORT || 8000
server.listen(PORT, () => console.log('Mock API listening on', PORT))

