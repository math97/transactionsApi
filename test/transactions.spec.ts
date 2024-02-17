import { test, beforeAll, afterAll, describe, it, expect } from 'vitest'
import supertest from 'supertest'
import { app } from '../src/app'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('should be able to create a new transaction', async () => {
    const expectedResponseCode = 201

    await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(expectedResponseCode)
  })

  it('should be able to list all transactions', async () => {
    const expectedResponseCode = 200

    const expectedTransaction = {
      title: 'New transaction',
      amount: 5000,
    }

    const createTransactionObject = { type: 'credit', ...expectedTransaction }

    console.log('createTransactionObject', createTransactionObject)

    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send(createTransactionObject)

    const cookies = createTransactionResponse.get('Set-Cookie')

    console.log('cookies', cookies)

    const getTransactionsResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(expectedResponseCode)

    console.log('getTransactionsResponse', getTransactionsResponse.body)

    expect(getTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining(expectedTransaction),
    ])
  })
})
