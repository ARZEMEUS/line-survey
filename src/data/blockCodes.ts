
export interface BlockCode {
  code: string
  description: string
  group: string
}

export const BLOCK_CODES: BlockCode[] = [
  { code: 'S1', description: 'ซอยกว้าง 1 เมตร (SOI 1 M)', group: 'ซอย' },
  { code: 'S2', description: 'ซอยกว้าง 2 เมตร', group: 'ซอย' },
  { code: 'S3', description: 'ซอยกว้าง 3 เมตร', group: 'ซอย' },
  { code: 'S4', description: 'ซอยกว้าง 4 เมตร', group: 'ซอย' },
  { code: 'S5', description: 'ซอยกว้าง 5 เมตร', group: 'ซอย' },
  { code: 'S6', description: 'ซอยกว้าง 6 เมตร', group: 'ซอย' },
  { code: 'S7', description: 'ซอยกว้าง 7 เมตร (SL / ศาลาทางหลวง)', group: 'ซอย' },
  { code: 'S8', description: 'ซอยกว้าง 8 เมตร (SC / SCHOOL)', group: 'ซอย' },
  { code: 'S9', description: 'ซอยกว้าง 9 เมตร (START)', group: 'ซอย' },
  { code: 'S10', description: 'ซอยกว้าง 10 เมตร (SOI 10 M / STOP)', group: 'ซอย' },

  { code: 'SB', description: 'เริ่มขอบซอย (SOI BEGIN)', group: 'ขอบซอย' },
  { code: 'SE', description: 'สุดขอบซอย (SOI END)', group: 'ขอบซอย' },
  { code: 'SBA', description: 'เริ่มขอบซอยแบบมีมุม (SOI BEGIN ANGLE)', group: 'ขอบซอย' },
  { code: 'SEA', description: 'สุดขอบซอยแบบมีมุม (SOI END ANGLE)', group: 'ขอบซอย' },

  { code: 'PB', description: 'จุดเริ่มต้นห้ามปักเสา (Prohibited Start)', group: 'ห้ามปักเสา' },
  { code: 'PE', description: 'จุดสิ้นสุดห้ามปักเสา (Prohibited End)', group: 'ห้ามปักเสา' },

  { code: 'FX', description: 'ขอบรั้ว', group: 'สิ่งกีดขวาง / ขอบเขต' },
  { code: 'TREE', description: 'ต้นไม้ (TREE)', group: 'สิ่งกีดขวาง / ธรรมชาติ' },

  { code: 'BB', description: 'เริ่มขอบสะพาน (BRIDGE BEGIN)', group: 'สะพาน' },
  { code: 'BE', description: 'สุดขอบสะพาน (BRIDGE END)', group: 'สะพาน' },

  { code: 'MB', description: 'เริ่มเนินเขา (MOUNTAIN BEGIN)', group: 'เนินเขา' },
  { code: 'ME', description: 'สุดเนินเขา (MOUNTAIN END)', group: 'เนินเขา' },

  { code: 'RB', description: 'เริ่มขอบแม่น้ำ (RIVER BEGIN)', group: 'แม่น้ำ' },
  { code: 'RE', description: 'สุดขอบแม่น้ำ (RIVER END)', group: 'แม่น้ำ' },

  { code: 'ST', description: 'STA (STATION)', group: 'จุดอ้างอิง' },
  { code: 'B', description: 'สะพานลอยคนข้าม (BRIDGE)', group: 'จุดอ้างอิง' },
  { code: 'KM', description: 'หลักกิโลเมตร', group: 'จุดอ้างอิง' },
  { code: 'RW', description: 'ทางรถไฟ (RAILWAY)', group: 'จุดอ้างอิง' },
  { code: 'TP', description: 'วัด (TEMPLE)', group: 'จุดอ้างอิง' },

  { code: 'P22O', description: 'เสาเดิม เสาเดี่ยว (POLE 22 m OLD)', group: 'เสาเดิม' },
  { code: 'P22OX2', description: 'เสาเดิม เสาคู่ (POLE 22 m OLD x2)', group: 'เสาเดิม' },
  { code: 'P12', description: 'เสาเดิม (POLE 12 m OLD)', group: 'เสาเดิม' },
  { code: 'P12L', description: 'เสาเดิม + ไฟสาธารณะ (P12 OLD WITH LIGHT)', group: 'เสาเดิม' },
  { code: 'P9', description: 'เสาเดิม (P9 OLD)', group: 'เสาเดิม' },
  { code: 'P8', description: 'เสาเดิม (P8 OLD)', group: 'เสาเดิม' },
  { code: 'P8L', description: 'เสาเดิม + ไฟสาธารณะ (P8 OLD WITH LIGHT)', group: 'เสาเดิม' },

  { code: 'EGAT115', description: 'จุดกึ่งกลาง Line EGAT 115 kV', group: 'แนวสายส่ง EGAT' },
  { code: 'EGAT230', description: 'จุดกึ่งกลาง Line EGAT 230 kV', group: 'แนวสายส่ง EGAT' },
  { code: 'EGAT500', description: 'จุดกึ่งกลาง Line EGAT 500 kV', group: 'แนวสายส่ง EGAT' },

  { code: 'PIPE', description: 'ท่อลอด (PIPE)', group: 'อุปกรณ์เพิ่มเติม' },
  { code: 'PIB', description: 'เริ่มท่อลอด (PIPE BEGIN)', group: 'อุปกรณ์เพิ่มเติม' },
  { code: 'PIE', description: 'สุดท่อลอด (PIPE END)', group: 'อุปกรณ์เพิ่มเติม' },

  { code: 'INL', description: 'INL', group: 'รหัสเพิ่มเติม' },
  { code: 'INR', description: 'INR', group: 'รหัสเพิ่มเติม' },
  { code: 'OUT', description: 'OUT', group: 'รหัสเพิ่มเติม' }
]

export const ROOM_CODE_PATTERN = /^R\d+[BE]$/i
