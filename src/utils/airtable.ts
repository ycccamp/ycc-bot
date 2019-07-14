import Airtable from 'airtable'

const {AIRTABLE_API_KEY} = process.env

export const airtable = new Airtable({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY,
})

export const Team = airtable.base('appHe7mDf7oXYgzyj')
