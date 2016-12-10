'use strict'

const hljs = require('highlight.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient()

exports.handler = (event, context, done) => {
  console.log(JSON.stringify(event, null, 2))
  const putRequests = event.Records
    .filter(record => ~['INSERT', 'MODIFY'].indexOf(record.eventName))
    .map(record => record.dynamodb.NewImage)
    .map(item => toDocFormat(item))
    .filter(item => item.content)
    .map(item => Object.assign(item, {content: highlightjs(item.content)}))
    .map(item => ({PutRequest: {Item: item}}))
  if (!putRequests.length) { return }
  const params = {RequestItems: {blog: putRequests}};
  console.log(JSON.stringify(params, null, 2))
  dynamo.batchWrite(params, done)
}

function toDocFormat(params) {
  return Object.keys(params).reduce((result, param) => {
    const value = params[param].N ? parseInt(params[param].N) : params[param].S
    return Object.assign(result, {[param]: value})
  }, {})
}

function highlightjs(content) {
  const re = /<pre><code class=["']([\w\-\d]+)["']>([^<]*)<\/code><\/pre>/gm
  //append "hljs" class
  let newContent = content.replace(/(<pre><code class=")/g, '$1hljs '),
    match
  while (match = re.exec(content)) {
    const lang = match[1], code = match[2]
    newContent = newContent.replace(code, hljs.highlight(lang, code).value)
  }
  return newContent
}
