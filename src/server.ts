import fastify from 'fastify'

const app = fastify()

app.get('/hello', async (req, res) => {
  res.send('hello world')
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
