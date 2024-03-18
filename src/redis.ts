import { createClient } from 'redis'

const redisRun = async () => {
  const client = await createClient()
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect()
  await client.set('key', 'value')
  const value = await client.get('key')
  console.log(value)

  const fieldsAdded = await client.hSet('bike:1', {
    model: 'Deimos',
    brand: 'Ergonom',
    type: 'Enduro bikes',
    price: 4972
  })
  console.log(`Number of fields were added: ${fieldsAdded}`)
  const model = await client.hGet('bike:1', 'model')
  console.log(`Model: ${model}`)
  const bike = await client.hGetAll('bike:1')
  console.log(bike)
}

export default redisRun
