export type Side = 'LEFT' | 'RIGHT' | 'CENTER'

export interface Project {
  id: string
  name: string
  area: string
  surveyDate: string
  surveyor: string
  note: string
  createdAt: string
}

export interface SurveyPoint {
  id: string
  projectId: string
  distance: number
  side: Side
  blockCode: string
  angle?: number
  description: string
  remark: string
  surveyor: string
  timestamp: string
}

export interface LifeOfWay {
  id: string
  projectId: string
  distance: number
  input1: number
  input2: number
  input3: number
  input4: number
  x1: number
  x2: number
  x3: number
  x4: number
  timestamp: string
}
