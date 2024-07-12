# Path to data_args.txt
DATA_ARGS_FILE="./data_args5000.txt"
FILE_TO_UPLOAD="./RKAB_2020.pdf"
LOG_FILE="log5000-no_enc.txt"

# Endpoint and other fixed parameters
URL="http://localhost:4000/channels/nsdm/chaincodes/nsdm_cc/addAsset"
PEERS="peer0.geologi.esdm.go.id"
VALID="0"
CONFIDENTIAL="0"
BEARER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTk2NDIxNjgsInVzZXJuYW1lIjoiYnUxIiwib3JnTmFtZSI6ImJhZGFudXNhaGExIiwidGlwZV91c3IiOiJkYXRhX293bmVyIiwiaWF0IjoxNzE5NjA2MTY4fQ.2Ky6ohMnDFoeT9PRArSg-xXiKPCPP1xk8daLS_GJM3Y"

# Read data_args.txt into an array
mapfile -t args_array < "$DATA_ARGS_FILE"

# Initialize variables for response times
total_time=0
request_count=0
success_count=0
failure_count=0

# Create or clear the log file
> $LOG_FILE

# Function to measure response time for a single request
measure_response_time() {
    local args_batch="$1"
    local start_time=$(date +%s.%N)

    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$URL" \
        -H "Content-Type: multipart/form-data" \
        -H "Authorization: Bearer $BEARER_TOKEN" \
        -F "file=@$FILE_TO_UPLOAD" \
        -F "peers=$PEERS" \
        -F "args=$args_batch" \
        -F "valid=$VALID" \
        -F "confidential=$CONFIDENTIAL")

    local end_time=$(date +%s.%N)
    local response_time=$(echo "$end_time - $start_time" | bc)
    total_time=$(echo "$total_time + $response_time" | bc)
    request_count=$((request_count + 1))

    # Log the response time for this request
    echo "$request_count;$response_time seconds, HTTP Status = $response" >> $LOG_FILE
    if [ "$response" -eq 200 ]; then
        success_count=$((success_count + 1))
    else
        failure_count=$((failure_count + 1))
    fi
    echo "----------------------------------------" >> $LOG_FILE
}

# Process each argument in data_args.txt
for arg in "${args_array[@]}"; do
    measure_response_time "$arg"
done

# Calculate throughput
if (( $(echo "$total_time > 0" | bc -l) )); then
    throughput=$(echo "scale=2; $request_count / $total_time" | bc -l)
else
    throughput=0
fi

# Log the total time, throughput, and statistics
echo "Total time: $total_time seconds" >> $LOG_FILE
echo "Throughput: $throughput requests per second" >> $LOG_FILE
echo "Total requests: $request_count" >> $LOG_FILE
echo "Successful requests: $success_count" >> $LOG_FILE
echo "Failed requests: $failure_count" >> $LOG_FILE

# Output the results to console as well
echo "Total time: $total_time seconds"
echo "Throughput: $throughput requests per second"
echo "Total requests: $request_count"
echo "Successful requests: $success_count"
echo "Failed requests: $failure_count"