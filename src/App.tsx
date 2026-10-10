import { useEffect, useMemo, useState } from 'react'
import { db } from './db'
import { BLOCK_CODES } from './data/blockCodes'
import { calculateLifeOfWay } from './lib/lifeOfWay'
import type { LifeOfWay, Project, Side, SurveyPoint } from './types'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const now = () => new Date().toISOString()
const id = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [points, setPoints] = useState<SurveyPoint[]>([])
  const [life, setLife] = useState<LifeOfWay[]>([])
  const [selectedSide, setSelectedSide] = useState<Side>('RIGHT')
  const [distance, setDistance] = useState('0')
  const [selectedCode, setSelectedCode] = useState('P12')
  const [remark, setRemark] = useState('')
  const [lifeDistance, setLifeDistance] = useState('0')
  const [lifeInputs, setLifeInputs] = useState(['', '', '', ''])
  const [showCodes, setShowCodes] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    area: '',
    surveyDate: new Date().toISOString().slice(0, 10),
    surveyor: '',
    note: ''
  })
  const [search, setSearch] = useState('')

  useEffect(() => {
    db.projects.toArray().then(p => {
      setProjects(p.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    })
  }, [])

  useEffect(() => {
    if (!project) return
    Promise.all([
      db.surveyPoints.where('projectId').equals(project.id).toArray(),
      db.lifeOfWays.where('projectId').equals(project.id).toArray()
    ]).then(([p, l]) => {
      setPoints(p.sort((a, b) => a.distance - b.distance))
      setLife(l.sort((a, b) => a.distance - b.distance))
    })
  }, [project])

  const visibleCodes = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = BLOCK_CODES.filter(b =>
      !q || b.code.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
    )
    if (q && /^r\d+[be]$/i.test(q)) {
      return [...base, {
        code: q.toUpperCase(),
        description: `Dynamic ROOM code (${q.toUpperCase()})`,
        group: 'อาคาร / ห้อง'
      }]
    }
    return base
  }, [search])

  const maxDistance = Math.max(
    100,
    ...points.map(p => p.distance),
    ...life.map(x => x.distance),
    Number(distance) || 0,
    Number(lifeDistance) || 0
  )

  async function createProject() {
    if (!newProject.name.trim()) return alert('กรุณากรอกชื่อโครงการ')
    const p: Project = { id: id(), ...newProject, createdAt: now() }
    await db.projects.add(p)
    setProjects(prev => [p, ...prev])
    setProject(p)
    setShowNewProject(false)
    setNewProject({
      name: '',
      area: '',
      surveyDate: new Date().toISOString().slice(0, 10),
      surveyor: '',
      note: ''
    })
  }

  async function addPoint() {
    if (!project) return
    const d = Number(distance)
    if (distance.trim() === '' || !Number.isFinite(d) || d < 0) {
      return alert('ระยะทางต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป')
    }
    const code = BLOCK_CODES.find(x => x.code === selectedCode)
      ?? visibleCodes.find(x => x.code === selectedCode)
    const p: SurveyPoint = {
      id: id(),
      projectId: project.id,
      distance: d,
      side: selectedSide,
      blockCode: selectedCode,
      description: code?.description ?? '',
      remark,
      surveyor: project.surveyor,
      timestamp: now()
    }
    await db.surveyPoints.add(p)
    setPoints(prev => [...prev, p].sort((a, b) => a.distance - b.distance))
    setRemark('')
  }

  async function addLifeOfWay() {
    if (!project) return
    if (lifeInputs.some(value => value.trim() === '')) {
      return alert('Life of Way ต้องกรอก Input 1–4 ให้ครบทุกช่อง')
    }
    const d = Number(lifeDistance)
    if (lifeDistance.trim() === '' || !Number.isFinite(d) || d < 0) {
      return alert('Distance ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป')
    }
    const nums = lifeInputs.map(Number)
    if (nums.some(n => !Number.isFinite(n))) {
      return alert('Life of Way ต้องกรอกตัวเลขให้ครบ 4 ช่อง')
    }
    const calc = calculateLifeOfWay(nums[0], nums[1], nums[2], nums[3])
    const row: LifeOfWay = {
      id: id(),
      projectId: project.id,
      distance: d,
      input1: nums[0],
      input2: nums[1],
      input3: nums[2],
      input4: nums[3],
      ...calc,
      timestamp: now()
    }
    await db.lifeOfWays.add(row)
    setLife(prev => [...prev, row].sort((a, b) => a.distance - b.distance))
    setLifeInputs(['', '', '', ''])
  }

  async function removePoint(pointId: string) {
    await db.surveyPoints.delete(pointId)
    setPoints(prev => prev.filter(x => x.id !== pointId))
  }

  async function removeLife(rowId: string) {
    await db.lifeOfWays.delete(rowId)
    setLife(prev => prev.filter(x => x.id !== rowId))
  }

  function exportExcel() {
    if (!project) return

    const surveyRows = points.map((p, i) => ({
      'ลำดับ': i + 1,
      'ระยะทาง (m)': p.distance,
      'ฝั่ง': p.side,
      'Block Code': p.blockCode,
      'รายละเอียด': p.description,
      'หมายเหตุ': p.remark,
      'ผู้สำรวจ': p.surveyor,
      'Timestamp': p.timestamp
    }))

    // ชีต Life of Way ยังคงแสดงผลคำนวณ X1-X4 ตามสูตรเดิม
    const lifeRows = life.map((x, i) => ({
      'ลำดับ': i + 1,
      'ระยะทาง (m)': x.distance,
      'ชุดข้อมูล 1': x.input1,
      'ชุดข้อมูล 2': x.input2,
      'ชุดข้อมูล 3': x.input3,
      'ชุดข้อมูล 4': x.input4,
      'X1 = 1': x.x1,
      'X2 = 2-1': x.x2,
      'X3 = 3-2': x.x3,
      'X4 = 4-3': x.x4
    }))

    // ชีต Excel Layout: รวม Survey Points และ Life of Way ตามระยะทาง
    // สำหรับแถว Life of Way, STA (m) ใช้ Distance และ X1-X4 ใช้ Input 1-4 โดยตรง

    const layoutEntries = [
      ...points.map(p => ({
        distance: p.distance,
        row: {
          'ANGLE': '',
          'TEXT': p.remark,
          'BLOCK': p.side === 'LEFT' ? p.blockCode : '',
          'in/out': '',
          'STA (m)': p.distance,
          'BLOCK_R': p.side === 'RIGHT' ? p.blockCode : '',
          'TEXT_R': p.side === 'RIGHT' ? p.description : '',
          'X1': '',
          'X2': '',
          'X3': '',
          'X4': '',
          'LANE': '',
          'RESET': ''
        }
      })),
      ...life.map(x => ({
        distance: x.distance,
        row: {
          'ANGLE': '',
          'TEXT': '',
          'BLOCK': '',
          'in/out': '',
          'STA (m)': x.distance,
          'BLOCK_R': '',
          'TEXT_R': '',
          'X1': x.input1,
          'X2': x.input2,
          'X3': x.input3,
          'X4': x.input4,
          'LANE': '',
          'RESET': ''
        }
      }))
    ]

    const layoutRows = layoutEntries
      .sort((a, b) => a.distance - b.distance)
      .map(entry => entry.row)

    const layoutRows = [
      ...points.map((p) => ({
        'ANGLE': '',
        'TEXT': p.remark,
        'BLOCK': p.side === 'LEFT' ? p.blockCode : '',
        'in/out': '',
        'STA (m)': p.side === 'CENTER' ? p.distance : '',
        'BLOCK_R': p.side === 'RIGHT' ? p.blockCode : '',
        'TEXT_R': p.side === 'RIGHT' ? p.description : '',
        'Survey (m)': p.side === 'RIGHT' ? p.distance : '',
        'X1': '',
        'X2': '',
        'X3': '',
        'X4': '',
        'LANE': '',
        'RESET': ''
      })),
      ...life.map((x) => ({
        'ANGLE': '',
        'TEXT': '',
        'BLOCK': '',
        'in/out': '',
        'STA (m)': x.distance,
        'BLOCK_R': '',
        'TEXT_R': '',
        'Survey (m)': '',
        'X1': x.input1,
        'X2': x.input2,
        'X3': x.input3,
        'X4': x.input4,
        'LANE': '',
        'RESET': ''
      }))
    ]


    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.json_to_sheet(surveyRows)
    const ws2 = XLSX.utils.json_to_sheet(lifeRows)
    const ws3 = XLSX.utils.json_to_sheet(BLOCK_CODES.map(x => ({
      'Block Code': x.code,
      'Description': x.description,
      'Group': x.group
    })))
    const ws4 = XLSX.utils.json_to_sheet(layoutRows)

    ;[ws1, ws2, ws3, ws4].forEach(ws => {
      ws['!freeze'] = { xSplit: 0, ySplit: 1 }
    })

    XLSX.utils.book_append_sheet(wb, ws1, 'Survey Data')
    XLSX.utils.book_append_sheet(wb, ws2, 'Life of Way')
    XLSX.utils.book_append_sheet(wb, ws3, 'Block Master')
    XLSX.utils.book_append_sheet(wb, ws4, 'Excel Layout')

    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(
      new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `${project.name.replace(/\s+/g, '_')}_survey.xlsx`
    )
  }

  if (!project) {
    return <div className="app-shell">
      <header className="topbar">
        <div><strong>LINE SURVEY</strong><span className="badge">Internal</span></div>
        <button className="primary" onClick={() => setShowNewProject(true)}>+ New Project</button>
      </header>
      <main className="project-home">
        <div className="hero-card"><h1>Field Survey</h1><p>ระบบสำรวจแนวถนนและเก็บ Block Code แบบ Offline-first</p></div>
        <div className="project-grid">
          {projects.map(p => <button key={p.id} className="project-card" onClick={() => setProject(p)}>
            <h3>{p.name}</h3><p>{p.area}</p><small>{p.surveyDate} · {p.surveyor}</small>
          </button>)}
          {!projects.length && <div className="empty">ยังไม่มีโครงการ กด “New Project” เพื่อเริ่มต้น</div>}
        </div>
      </main>
      {showNewProject && <ProjectModal
        value={newProject}
        onChange={setNewProject}
        onClose={() => setShowNewProject(false)}
        onSave={createProject}
      />}
    </div>
  }

  return <div className="app-shell">
    <header className="topbar">
      <div><strong>LINE SURVEY</strong><span className="badge">{navigator.onLine ? 'Online' : 'Offline'}</span></div>
      <div className="top-actions">
        <button onClick={() => setProject(null)}>Projects</button>
        <button onClick={exportExcel}>Export Excel</button>
      </div>
    </header>

    <main className="survey-page">
      <section className="project-strip">
        <div><strong>{project.name}</strong><span>{project.area || 'ไม่ระบุพื้นที่'}</span></div>
        <div>{project.surveyDate} · {project.surveyor || 'ไม่ระบุผู้สำรวจ'}</div>
      </section>

      <section className="workspace">
        <aside className="side-panel left-panel">
          <h3>LEFT SIDE</h3>
          {points.filter(p => p.side === 'LEFT').map(p => <PointRow key={p.id} p={p} onDelete={removePoint} />)}
        </aside>

        <section className="road-card">
          <div className="direction">↑<span>ทิศทางเดินสำรวจ</span></div>
          <div className="road-scene">
            <div className="road-side labels-left">
              {points.filter(p => p.side === 'LEFT').map(p => <DiagramLabel key={p.id} p={p} maxDistance={maxDistance} side="left" />)}
            </div>
            <div className="road-line"><div className="center-label">0 m</div></div>
            <div className="road-side labels-right">
              {points.filter(p => p.side === 'RIGHT').map(p => <DiagramLabel key={p.id} p={p} maxDistance={maxDistance} side="right" />)}
            </div>
          </div>
          <div className="distance-scale"><span>0 m</span><span>{maxDistance.toFixed(1)} m</span></div>
        </section>

        <aside className="side-panel right-panel">
          <h3>RIGHT SIDE</h3>
          {points.filter(p => p.side === 'RIGHT').map(p => <PointRow key={p.id} p={p} onDelete={removePoint} />)}
        </aside>
      </section>

      <section className="entry-card">
        <div className="row-title"><h3>Quick Add</h3><span>กดเลือก Block Code แล้วบันทึกระยะทันที</span></div>
        <div className="segmented">
          <button className={selectedSide === 'LEFT' ? 'active' : ''} onClick={() => setSelectedSide('LEFT')}>LEFT</button>
          <button className={selectedSide === 'RIGHT' ? 'active' : ''} onClick={() => setSelectedSide('RIGHT')}>RIGHT</button>
          <button className={selectedSide === 'CENTER' ? 'active' : ''} onClick={() => setSelectedSide('CENTER')}>CENTER</button>
        </div>
        <div className="form-grid">
          <label>Distance (m)<input inputMode="decimal" value={distance} onChange={e => setDistance(e.target.value)} /></label>
          <label>Block Code<button className="select-button" onClick={() => setShowCodes(true)}>{selectedCode}</button></label>
          <label>หมายเหตุ<input value={remark} onChange={e => setRemark(e.target.value)} placeholder="รายละเอียดเพิ่มเติม" /></label>
          <button className="primary big" onClick={addPoint}>SAVE</button>
        </div>
      </section>

      <section className="life-card">
        <div className="row-title"><h3>Life of Way</h3><span>บันทึก Distance และ Input 1–4 พร้อมคำนวณ X1–X4</span></div>
        <div className="form-grid life-grid">
          <label>Distance (m)<input inputMode="decimal" value={lifeDistance} onChange={e => setLifeDistance(e.target.value)} /></label>
          {[0, 1, 2, 3].map(i => <label key={i}>Input {i + 1}<input
            inputMode="decimal"
            value={lifeInputs[i]}
            onChange={e => setLifeInputs(v => v.map((x, j) => j === i ? e.target.value : x))}
          /></label>)}
          <button className="primary big" onClick={addLifeOfWay}>CALCULATE + SAVE</button>
        </div>
        <div className="formula">
          <span>X1 = 2 − 1</span><span>X2 = 3 − 2 − 1</span><span>X3 = 4 − 3 − 2 − 1</span><span>X4 = 4</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>m</th><th>1</th><th>2</th><th>3</th><th>4</th><th>X1</th><th>X2</th><th>X3</th><th>X4</th><th></th></tr></thead>
            <tbody>{life.map(x => <tr key={x.id}>
              <td>{x.distance.toFixed(2)}</td>
              <td>{x.input1.toFixed(2)}</td><td>{x.input2.toFixed(2)}</td><td>{x.input3.toFixed(2)}</td><td>{x.input4.toFixed(2)}</td>
              <td>{x.x1.toFixed(2)}</td><td>{x.x2.toFixed(2)}</td><td>{x.x3.toFixed(2)}</td><td>{x.x4.toFixed(2)}</td>
              <td><button className="danger" onClick={() => removeLife(x.id)}>Delete</button></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="data-card">
        <div className="row-title"><h3>Saved Data</h3><span>{points.length} survey points · {life.length} Life of Way rows</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Distance</th><th>Side</th><th>Block</th><th>Description</th><th>Remark</th><th></th></tr></thead>
            <tbody>{points.map((p, i) => <tr key={p.id}>
              <td>{i + 1}</td><td>{p.distance.toFixed(2)} m</td><td>{p.side}</td><td><strong>{p.blockCode}</strong></td>
              <td>{p.description}</td><td>{p.remark}</td><td><button className="danger" onClick={() => removePoint(p.id)}>Delete</button></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>
    </main>

    {showCodes && <CodeModal
      codes={visibleCodes}
      selected={selectedCode}
      onPick={code => { setSelectedCode(code); setShowCodes(false) }}
      search={search}
      setSearch={setSearch}
      onClose={() => setShowCodes(false)}
    />}
  </div>
}

function DiagramLabel({ p, maxDistance, side }: { p: SurveyPoint, maxDistance: number, side: 'left' | 'right' }) {
  const bottom = Math.min(98, Math.max(2, (p.distance / maxDistance) * 96))
  return <div className={`diagram-label ${side}`} style={{ bottom: `${bottom}%` }}>
    <span className="dot" /> <span><strong>{p.blockCode}</strong><small>{p.distance.toFixed(1)} m</small></span>
  </div>
}

function PointRow({ p, onDelete }: { p: SurveyPoint, onDelete: (id: string) => void }) {
  return <div className="point-row">
    <div><strong>{p.blockCode}</strong><span>{p.distance.toFixed(2)} m</span></div>
    <button className="danger" onClick={() => onDelete(p.id)}>×</button>
  </div>
}

function CodeModal({ codes, selected, onPick, search, setSearch, onClose }: {
  codes: typeof BLOCK_CODES | (typeof BLOCK_CODES[number] | { code: string, description: string, group: string })[]
  selected: string
  onPick: (code: string) => void
  search: string
  setSearch: (s: string) => void
  onClose: () => void
}) {
  const groups = [...new Set(codes.map(x => x.group))]
  return <div className="modal-backdrop"><div className="modal">
    <div className="modal-head"><h3>เลือก Block Code</h3><button onClick={onClose}>×</button></div>
    <input autoFocus placeholder="ค้นหาเช่น P12, SB, R1B, TREE" value={search} onChange={e => setSearch(e.target.value)} />
    <div className="code-list">
      {groups.map(g => <div key={g}>
        <div className="group-title">{g}</div>
        <div className="code-grid">{codes.filter(x => x.group === g).map(c => <button
          key={c.code}
          className={c.code === selected ? 'code selected' : 'code'}
          onClick={() => onPick(c.code)}
        ><strong>{c.code}</strong><span>{c.description}</span></button>)}</div>
      </div>)}
      {!codes.length && <div className="empty">ไม่พบ Block Code</div>}
    </div>
  </div></div>
}

function ProjectModal({ value, onChange, onClose, onSave }: {
  value: { name: string, area: string, surveyDate: string, surveyor: string, note: string }
  onChange: (v: { name: string, area: string, surveyDate: string, surveyor: string, note: string }) => void
  onClose: () => void
  onSave: () => void
}) {
  return <div className="modal-backdrop"><div className="modal narrow">
    <div className="modal-head"><h3>New Project</h3><button onClick={onClose}>×</button></div>
    <label>ชื่อโครงการ<input value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} /></label>
    <label>พื้นที่<input value={value.area} onChange={e => onChange({ ...value, area: e.target.value })} /></label>
    <label>วันที่สำรวจ<input type="date" value={value.surveyDate} onChange={e => onChange({ ...value, surveyDate: e.target.value })} /></label>
    <label>ผู้สำรวจ<input value={value.surveyor} onChange={e => onChange({ ...value, surveyor: e.target.value })} /></label>
    <label>หมายเหตุ<textarea value={value.note} onChange={e => onChange({ ...value, note: e.target.value })} /></label>
    <button className="primary big" onClick={onSave}>SAVE PROJECT</button>
  </div></div>
}

export default App
