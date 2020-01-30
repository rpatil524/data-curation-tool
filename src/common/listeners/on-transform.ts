import * as Excel from 'xlsx'
import fs from 'fs'
import log from 'electron-log'
import 'isomorphic-fetch'
import { ipcMain } from 'electron'
import { workbookMap } from '../model/workbook'
import { SourceDataElement, Target } from './../model/file-source'
import { FhirService } from './../services/fhir.service'
import { Patient, Practitioner, Condition } from './../model/resources'
import { v4 as uuid } from 'uuid'

const fhirService: FhirService = new FhirService()

/**
 * Start point of Transforming data to FHIR
 */
ipcMain.on('transform', async (event, data) => {
  const filePath = data.filePath

  const getWorkbooks = new Promise<Excel.WorkBook>(((resolve, reject) => {
    if (workbookMap.has(filePath)) {
      event.sender.send(`transforming-${filePath}`, [])
      resolve(workbookMap.get(filePath))
    } else {
      fs.readFile(filePath, (err, buffer) => {
        if (err) {
          reject(err)
          return
        }
        const workbook: Excel.WorkBook = Excel.read(buffer, {type: 'buffer', cellDates: true})
        // Save buffer workbook to map
        workbookMap.set(filePath, workbook)
        event.sender.send(`transforming-${filePath}`, [])
        resolve(workbook)
      })
    }
  }))
  getWorkbooks.then(workbook => {
    // let timeout = 0
    for (const sheet of Object.keys(data.sheets)) {
      const entries: any[] = Excel.utils.sheet_to_json(workbook.Sheets[sheet]) || []
      const sheetTargets = data.sheets[sheet]

      event.sender.send(`info-${filePath}-${sheet}`, {total: entries.length})
      log.info(`Starting transform ${sheet} in ${filePath}`)

      // Start transform action
      // Create records row by row in entries
      const resources: fhir.Resource[] = []
      // const conditions: fhir.Condition[] = []
      Promise.all(entries.map(entry => {

        // For each row create resource instances
        const patientResource: fhir.Patient = {resourceType: 'Patient'}
        const practitionerResource: fhir.Practitioner = {resourceType: 'Practitioner'}
        const conditionMap: Map<string, fhir.Condition> = new Map<string, fhir.Condition>()

        return Promise.all(sheetTargets.map((attr: SourceDataElement) => {
          return Promise.all(attr.target?.map((target: Target) => {
            return new Promise((resolve, reject) => {
              if (entry[attr.value!] !== null && entry[attr.value!] !== undefined && entry[attr.value!] !== '') {
                const [resource, field, ...subfields] = target.value.split('.')
                switch (resource) {
                  case 'Patient':
                    Patient.generate(patientResource, field, attr.type, subfields, entry[attr.value!])
                      .then(_ => resolve(true))
                      .catch(err => reject(err))
                    break
                  case 'Practitioner':
                    Practitioner.generate(practitionerResource, field, attr.type, subfields, entry[attr.value!])
                      .then(_ => resolve(true))
                      .catch(err => reject(err))
                    break
                  case 'Condition':
                    // TODO: Review group assignments
                    const groupIds = attr.group ? Object.keys(attr.group) : [uuid().slice(0, 8)]
                    Promise.all(groupIds.map(groupId => {
                      // timeout += 5
                      return new Promise((resolve1, reject1) => {
                        if (!conditionMap.has(groupId)) {
                          const conditionResource: fhir.Condition = {resourceType: 'Condition', subject: {}} as fhir.Condition
                          conditionMap.set(groupId, conditionResource)
                        }
                        // setTimeout(() => {
                        Condition.generate(conditionMap.get(groupId)!, field, attr.type, subfields, String(entry[attr.value!]))
                            .then(_ => {
                              resolve1(true)
                            })
                            .catch(err => {
                              reject1(err)
                            })
                        // }, timeout)
                      })
                    }))
                      .then(_ => resolve(true))
                      .catch(err => reject(err))
                    break
                  default:
                    resolve(true)
                }
              } else {
                // log.warn(`${entry[attr.value!]} Empty field`)
                resolve(true)
              }
            })
          }) || [])
        }))
          .then((res) => {
            // End of transforming for one row

            // Patients
            if (patientResource.id) resources.push(patientResource)
            // Practitioners
            if (practitionerResource.id) resources.push(practitionerResource)
            // Conditions
            for (const conditionResource of Array.from(conditionMap.values())) resources.push(conditionResource)

          })
          .catch(err => {
            // event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'error', description: `Transform error for sheet: ${sheet}`})
            log.error(`Transform error in one row for sheet: ${sheet} in ${filePath}: ${err}`)
          })
      }))
        .then(() => { // End of sheet
          if (entries.length) {
            // Batch upload resources
            // Max capacity 5000 resources
            const len = Math.ceil(resources.length / 5000)

            const bulkPromiseList: Array<Promise<any>> = []

            for (let i = 0, p = Promise.resolve(); i < len; i++) {
              bulkPromiseList.push(p.then(_ => new Promise(resolve => {
                fhirService.postBatch(resources.slice(i * 5000, (i + 1) * 5000))
                  .then(() => resolve())
                  .catch(err => {
                    log.warn(`Batch upload error: ${err}`)
                    resolve()
                  })
              })))
            }

            Promise.all(bulkPromiseList)
              .then(res => {
                event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'done'})
                log.info(`Transform done ${sheet} in ${filePath}`)
              })
              .catch(err => {
                event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'error', description: `Batch upload error - ${err.message}`})
                log.error(`BATCH ERROR ${filePath}-${sheet} - ${JSON.stringify(err)}`)
              })

          } else {
            event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'warning', description: 'Empty sheet'})
            log.warn(`Empty sheet: ${sheet} in ${filePath}`)
          }
        })
        .catch(err => {
          event.sender.send(`transforming-${filePath}-${sheet}`, {status: 'error', description: `Transform error for sheet: ${sheet}`})
          log.error(`Transform error for sheet: ${sheet} in ${filePath}: ${err}`)
        })
    }
  })
    .catch(err => {
      event.sender.send(`transforming-${filePath}`, [])
      log.error(err)
      return
    })
})

ipcMain.on('delete-resource', (event, resourceType: string) => {
  fhirService.deleteAll(resourceType)
    .then(_ => event.sender.send(`delete-resource-result`, true))
    .catch(_ => event.sender.send(`delete-resource-result`, false))
})