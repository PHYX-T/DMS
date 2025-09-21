// ESM module (package.json type: module)
export const users = [
  { id: 'u1', name: 'Alice Admin', email: 'alice.admin@example.com', role: 'Admin', lastLogin: isoDaysAgo(1), status: 'active' },
  { id: 'u2', name: 'Omar Owner', email: 'omar.owner@example.com', role: 'DocumentOwner', lastLogin: isoDaysAgo(2), status: 'active' },
  { id: 'u3', name: 'Cora Controller', email: 'cora.controller@example.com', role: 'DocumentController', lastLogin: isoDaysAgo(3), status: 'active' },
  { id: 'u4', name: 'Quinn QMS', email: 'quinn.qms@example.com', role: 'QMS', lastLogin: isoDaysAgo(4), status: 'active' },
  { id: 'u5', name: 'Evan EndUser', email: 'evan.end@example.com', role: 'EndUser', lastLogin: isoDaysAgo(5), status: 'active' },
  { id: 'u6', name: 'Ana Auditor', email: 'ana.audit@example.com', role: 'ExternalAuditor', lastLogin: isoDaysAgo(6), status: 'active' },
  // Extra for delegation
  { id: 'u7', name: 'Delia Owner', email: 'delia.owner@example.com', role: 'DocumentOwner', lastLogin: isoDaysAgo(1), status: 'active' },
  { id: 'u8', name: 'Carl Controller', email: 'carl.ctrl@example.com', role: 'DocumentController', lastLogin: isoDaysAgo(1), status: 'active' },
]

export const codes = {
  companies: [ { value: 'ABC', label: 'ABC — Acme Base Co' }, { value: 'QMS', label: 'QMS — Quality Inc.' } ],
  subsidiaries: [ { value: 'HQ', label: 'HQ — Headquarters' }, { value: 'EU', label: 'EU — Europe' }, { value: 'US', label: 'US — United States' } ],
  departments: [ { value: 'ENG', label: 'ENG — Engineering' }, { value: 'OPS', label: 'OPS — Operations' }, { value: 'QMS', label: 'QMS — Quality Management' }, { value: 'FIN', label: 'FIN — Finance' } ],
  types: [ { value: 'PRO', label: 'PRO — Procedure' }, { value: 'POL', label: 'POL — Policy' }, { value: 'WIN', label: 'WIN — Work Instruction' }, { value: 'MAN', label: 'MAN — Manual' } ],
  // Conflicts for demo (duplicate label different value)
  conflicts: [ { kind: 'departments', value: 'FIN', label: 'Finance Dept' }, { kind: 'types', value: 'WRK', label: 'Work Instruction (alias)' } ]
}

export const documents = generateDocuments(60)

export const auditLog = seedAudit(documents)

function isoDaysAgo(d) { const t = new Date(); t.setDate(t.getDate()-d); return t.toISOString() }

function pick(arr) { return arr[Math.floor(Math.random()*arr.length)] }
function randInt(min, max) { return Math.floor(Math.random()*(max-min+1))+min }

function generateDocuments(n) {
  const docs = []
  const companyVals = codes.companies.map(c=>c.value)
  const subVals = codes.subsidiaries.map(c=>c.value)
  const deptVals = codes.departments.map(c=>c.value)
  const typeVals = codes.types.map(c=>c.value)
  const statuses = ['Draft','Review','Approved','Archived','Obsolete']
  for (let i=1;i<=n;i++) {
    const comp = pick(companyVals)
    const sub = pick(subVals)
    const dept = pick(deptVals)
    const typ = pick(typeVals)
    const idx = String(i).padStart(3,'0')
    const id = `${comp}-${sub}-${dept}-${typ}-${idx}`
    const verMajor = randInt(1,3)
    const verMinor = randInt(0,9)
    const version = `${verMajor}.${verMinor}`
    const issue = new Date(); issue.setMonth(issue.getMonth()-randInt(1,18))
    const review = new Date(issue); review.setMonth(review.getMonth()+randInt(3,18))
    const status = pick(statuses)
    const owner = pick(users.filter(u=>u.role==='DocumentOwner').map(u=>u.id))
    const ctrl = pick(users.filter(u=>u.role==='DocumentController').map(u=>u.id))
    const doc = {
      ID: id,
      Title: `${dept} ${typ} #${idx}`,
      Version: version,
      Status: status,
      Owner: owner,
      Controller: ctrl,
      Metadata: {
        CompanyCode: comp, SubsidiaryCode: sub, DepartmentCode: dept, DocumentTypeCode: typ,
        IssueDate: issue.toISOString().slice(0,10), ReviewDate: review.toISOString().slice(0,10),
        Keywords: [dept.toLowerCase(), typ.toLowerCase()], Description: `Doc ${idx} description`,
        RetentionSchedule: { policy: Math.random()<0.2 ? 'WORM':'STANDARD', durationMonths: randInt(6,36), startDate: issue.toISOString().slice(0,10) }
      },
      Files: { PDF: '' },
      ChangeHistory: [ { version, action: status==='Approved'?'Approved':'Created', userId: ctrl, timestamp: isoDaysAgo(randInt(1,200)) } ],
      RelatedDocuments: []
    }
    docs.push(doc)
  }
  return docs
}

function seedAudit(docs) {
  const list = []
  for (let i=0;i<docs.length;i++) {
    const d = docs[i]
    list.push({ id: `${Date.now()}${i}`, action: 'Created', userId: d.Controller, documentId: d.ID, timestamp: isoDaysAgo(randInt(30,400)), details: { version: d.Version } })
    if (d.Status==='Approved') {
      list.push({ id: `${Date.now()}${i}b`, action: 'Approved', userId: d.Controller, documentId: d.ID, timestamp: isoDaysAgo(randInt(1,29)), details: { version: d.Version } })
    }
  }
  return list
}

