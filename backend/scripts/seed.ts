import { Client } from 'pg'

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)] }
function pad(n: number, w = 3) { return String(n).padStart(w, '0') }

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) { console.error('DATABASE_URL not set'); process.exit(1) }
  const db = new Client({ connectionString: url })
  await db.connect()
  console.log('[seed] Connected')

  // Users
  const users = [
    { id: 'u-admin', name: 'Alice Admin', email: 'alice.admin@example.com', role: 'Admin' },
    { id: 'u-qms', name: 'Quinn QMS', email: 'quinn.qms@example.com', role: 'QMS' },
    { id: 'u-end', name: 'Evan EndUser', email: 'evan.end@example.com', role: 'EndUser' },
    { id: 'u-aud', name: 'Ana Auditor', email: 'ana.audit@example.com', role: 'ExternalAuditor' },
    { id: 'u-own1', name: 'Omar Owner', email: 'omar.owner@example.com', role: 'DocumentOwner' },
    { id: 'u-own2', name: 'Delia Owner', email: 'delia.owner@example.com', role: 'DocumentOwner' },
    { id: 'u-ctrl1', name: 'Cora Controller', email: 'cora.controller@example.com', role: 'DocumentController' },
    { id: 'u-ctrl2', name: 'Carl Controller', email: 'carl.controller@example.com', role: 'DocumentController' },
  ]
  for (const u of users) {
    await db.query('INSERT INTO users(id, name, email, role, status, created_at) VALUES ($1,$2,$3,$4,\'active\', now()) ON CONFLICT (id) DO NOTHING', [u.id, u.name, u.email, u.role])
  }
  console.log('[seed] Users inserted')

  // Delegations
  await db.query("INSERT INTO delegations(id, from_user_id, to_user_id, role_scope, starts_at, ends_at, created_by) VALUES ('d1','u-own1','u-own2','DocumentOwner', now() - INTERVAL '1 day', now() + INTERVAL '7 days','u-admin') ON CONFLICT DO NOTHING")
  await db.query("INSERT INTO delegations(id, from_user_id, to_user_id, role_scope, starts_at, ends_at, created_by) VALUES ('d2','u-ctrl1','u-ctrl2','DocumentController', now() - INTERVAL '1 day', now() + INTERVAL '3 days','u-admin') ON CONFLICT DO NOTHING")

  // Codes
  const companies = ['ABC','QMS']
  const subs = ['HQ','EU','US']
  const depts = ['ENG','OPS','QMS','FIN']
  const types = ['PRO','POL','WIN','MAN']
  for (const c of companies) for (const s of subs) for (const d of depts) for (const t of types) {
    await db.query('INSERT INTO codes(company_code, subsidiary_code, department_code, document_type_code, active, created_at) VALUES ($1,$2,$3,$4,true, now()) ON CONFLICT DO NOTHING', [c,s,d,t])
  }
  console.log('[seed] Codes inserted')

  // Documents
  const statuses = ['Draft','OwnerApproval','Review','Approved','Published','Archived','Obsolete'] as const
  const docsCount = 60
  for (let i=1;i<=docsCount;i++) {
    const comp = rnd(companies), sub = rnd(subs), dept = rnd(depts), typ = rnd(types)
    const docCode = `${comp}-${sub}-${dept}-${typ}-${pad(i)}`
    const versionMaj = Math.floor(Math.random()*3)+1
    const versionMin = Math.floor(Math.random()*9)
    const version = `${versionMaj}.${versionMin}`
    const status = rnd(Array.from(statuses))
    const owner = rnd(['u-own1','u-own2'])
    const ctrl = rnd(['u-ctrl1','u-ctrl2'])
    const issue = new Date(); issue.setMonth(issue.getMonth()- (Math.floor(Math.random()*18)+1))
    const review = new Date(issue); review.setMonth(review.getMonth() + (Math.floor(Math.random()*18)+3))
    const retentionYears = Math.floor(Math.random()*4)
    await db.query(
      `INSERT INTO documents(doc_id, title, version, status, owner_id, controller_id, issue_date, review_date, retention_years, keywords, description, latest_approved, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, now(), now())
       ON CONFLICT (doc_id) DO NOTHING`,
      [docCode, `${dept} ${typ} #${pad(i)}`, version, status, owner, ctrl, issue, review, retentionYears, ['quality', dept.toLowerCase()], `Document ${i} description`, status==='Approved' || status==='Published']
    )
    // change history
    await db.query('INSERT INTO change_history(id, document_id, version, action, user_id, timestamp, notes) VALUES (uuid_generate_v4(), (SELECT id FROM documents WHERE doc_id=$1), $2, $3, $4, now() - INTERVAL \'30 days\', $5) ON CONFLICT DO NOTHING', [docCode, version, 'Created', ctrl, 'seed'])
    if (status==='Approved' || status==='Published') {
      await db.query('INSERT INTO change_history(id, document_id, version, action, user_id, timestamp) VALUES (uuid_generate_v4(), (SELECT id FROM documents WHERE doc_id=$1), $2, $3, $4, now() - INTERVAL \'5 days\') ON CONFLICT DO NOTHING', [docCode, version, 'Approved', ctrl])
    }
    // audit
    await db.query('INSERT INTO audit_log(id, document_id, actor_id, action, context, ts) VALUES (uuid_generate_v4(), (SELECT id FROM documents WHERE doc_id=$1), $2, $3, $4, now())', [docCode, ctrl, 'Created', { seed: true }])
    // related links randomly
    if (i % 10 === 0) {
      const other = `${comp}-${sub}-${dept}-${typ}-${pad(Math.max(1, i-1))}`
      await db.query('INSERT INTO document_links(document_id, related_doc_id) SELECT d1.id, d2.id FROM documents d1, documents d2 WHERE d1.doc_id=$1 AND d2.doc_id=$2 ON CONFLICT DO NOTHING', [docCode, other])
    }
    // search index
    await db.query("INSERT INTO search_index(document_id, title_tsv, meta_tsv, keywords, last_indexed_at) SELECT id, to_tsvector('english', title), to_tsvector('english', $1), keywords, now() FROM documents WHERE doc_id=$2 ON CONFLICT (document_id) DO UPDATE SET title_tsv=EXCLUDED.title_tsv, meta_tsv=EXCLUDED.meta_tsv, keywords=EXCLUDED.keywords, last_indexed_at=now()", [`${dept} ${typ}`, docCode])
  }
  console.log('[seed] Documents inserted')

  // Notifications samples
  await db.query("INSERT INTO notifications(id, user_id, type, payload, created_at) VALUES (uuid_generate_v4(),'u-ctrl1','approval_pending','{""title"":""Quality Policy""}'::jsonb, now())")
  await db.query("INSERT INTO notifications(id, user_id, type, payload, created_at) VALUES (uuid_generate_v4(),'u-own1','review_assigned','{""title"":""Safety Policy""}'::jsonb, now())")

  console.log('[seed] Done')
  await db.end()
}

main().catch((e) => { console.error(e); process.exit(1) })

