import {
  test,
  beforeAll,
  afterAll,
  describe,
  it,
  expect,
  beforeEach,
} from 'vitest'
import supertest from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
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

    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send(createTransactionObject)

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(expectedResponseCode)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining(expectedTransaction),
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const expectedResponseCode = 200

    const expectedTransaction = {
      title: 'New transaction',
      amount: 5000,
    }

    const createTransactionObject = { type: 'credit', ...expectedTransaction }

    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send(createTransactionObject)

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await supertest(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(expectedResponseCode)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({ ...expectedTransaction, id: transactionId }),
    )
  })

  it('should be able to get the summary', async () => {
    const expectedResponseCode = 200

    const expectedTransaction = {
      title: 'New credit',
      amount: 5000,
    }

    const createTransactionCreditObject = {
      type: 'credit',
      ...expectedTransaction,
    }
    const createTransactionDebitObject = {
      type: 'debit',
      title: 'New debit',
      amount: 2000,
    }

    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send(createTransactionCreditObject)

    await supertest(app.server)
      .post('/transactions')
      .send(createTransactionDebitObject)

    const cookies = createTransactionResponse.get('Set-Cookie')

    const summaryResponse = await supertest(app.server)
      .get(`/summary`)
      .set('Cookie', cookies)
      .expect(expectedResponseCode)

    expect(summaryResponse.body.summary).toEqual({ amount: 3000 })
  })
})
