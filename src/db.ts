import Dexie, { type Table } from 'dexie'
import type { LifeOfWay, Project, SurveyPoint } from './types'

class SurveyDB extends Dexie {
  projects!: Table<Project, string>
  surveyPoints!: Table<SurveyPoint, string>
  lifeOfWays!: Table<LifeOfWay, string>

  constructor() {
    super('line-survey-db')
    this.version(1).stores({
      projects: 'id, surveyDate, createdAt',
      surveyPoints: 'id, projectId, distance, side, blockCode',
      lifeOfWays: 'id, projectId, distance'
    })
  }
}

export const db = new SurveyDB()
