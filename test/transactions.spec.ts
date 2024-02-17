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

    const getTransactionsResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(expectedResponseCode)

    expect(getTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining(expectedTransaction),
    ])
  })
})
