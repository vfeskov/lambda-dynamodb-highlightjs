# AWS Lambda DynamoDB Highlight.js

It's a lambda function that is triggered whenever a dynamodb table gets new record or an existing record is updated.
It processes `content` column with Highlight.js expecting code blocks to be wrapped with `<pre><code class="xxx">`, and then puts the processed record in `blog` table.
The function shouldn't be triggered by the same `blog` table or it will run indefinitely.
