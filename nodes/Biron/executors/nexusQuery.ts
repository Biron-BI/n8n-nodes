import {IAllExecuteFunctions, IHttpRequestOptions, INodeExecutionData} from "n8n-workflow"
import crypto from "crypto";

export async function runNexusQuery(exec: IAllExecuteFunctions, workspace: string, nexusQuery: string): Promise<INodeExecutionData[][]> {
  const baseURL = "https://nexus.biron-analytics.com";
  const url = `/workspace/${workspace}/query/sql/n8n-${crypto.randomUUID()}`;

  const options: IHttpRequestOptions = {
    baseURL,
    method: "POST",
    url,
    body: nexusQuery,
    headers: {
      "Content-Type": 'text/plain',
      'Accept': "application/jsonl",
    },
    qs: {
      withHeartbeat: true,
      withEotSignal: true,
      allowCancelSignal: true,
      withNamesAndTypes: true,
    },
  };

  const response = await exec.helpers.httpRequestWithAuthentication.call(
    exec,
    "bironCredentialsApi",
    options,
  );

  return [extractRows(String(response))]
}

function extractRows(responseText: string): INodeExecutionData[] {
  const lines = responseText.trim().split('\n')
  let eotReached = false
  let headers: string[] = [];
  const rows = []
  // the first line is heartbeat
  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const line = lines[lineNumber]
    if (line === "\x04") { // the EOT signal
      eotReached = true
    } else if (line === "\x18") { // the CAN(cel) signal
      const error = lines.slice(lineNumber + 1).join('\n')
      throw new Error(`Query fails:
${error}CAN signal received:
${error}`)
    } else {
      const parsedLine = JSON.parse(line)
      if (lineNumber === 0) {
        headers = parsedLine
      } else if (lineNumber === 1) {
        // Ignored: types
      } else {
        const obj: Record<string, object> = {};
        for (let i = 0; i < headers.length; i++) {
          obj[headers[i]] = parsedLine[i];
        }
        rows.push({json: obj});
      }
    }
  }
  if (!eotReached) {
    throw new Error(`Backend communication link failure
EOT signal not received`)
  }
  return rows
}