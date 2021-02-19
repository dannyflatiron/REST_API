const { buildSchema } = require('graphql')

module.exports = buildSchema(`

type TestData {
  hello: String!
  views: Int!
}

  type RootQuery {
    hello: TestData!
  }

  schema {
    query: RootQuery
  }


`)