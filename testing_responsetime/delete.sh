#!/bin/bash

# Base URL
url="http://localhost:4000/delete"

# Authorization token
auth_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTk2NzczOTksInVzZXJuYW1lIjoiZ2VvbG9naTEiLCJvcmdOYW1lIjoiZ2VvbG9naSIsInRpcGVfdXNyIjoidmVyaWZpa2F0b3IiLCJpYXQiOjE3MTk2NDEzOTl9.zAF8CtjrNI7Lx74oFzZjylee4tGBFMYlGDUEHVn4H28"

# Headers
headers=(
  "-H \"Content-Type: multipart/form-data\""
  "-H \"Authorization: Bearer $auth_token\""
)

# Other form data
peers="-F \"peers=[\\\"peer0.minerba.esdm.go.id\\\"]\""
chaincodeName="-F \"chaincodeName=nsdm_cc\""
channelName="-F \"channelName=nsdm\""

# Loop from 0001 to 1000
for i in $(seq -w 0001 0013); do
  # Form data with current args value
  args="-F \"args=$i\""

  # Construct and execute the curl command
  eval curl -X POST \"$url\" ${headers[@]} $peers $args $chaincodeName $channelName
done
