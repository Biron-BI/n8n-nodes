import {IAllExecuteFunctions, IHttpRequestOptions} from "n8n-workflow"
import crypto from "crypto";

export async function runNexusQuery(exec: IAllExecuteFunctions, workspace: string, nexusQuery: string) {
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
    },
  };

  const response = await exec.helpers.httpRequestWithAuthentication.call(
    exec,
    "bironCredentials",
    options,
  );

  return [extractRows(String(response))]
}

function extractRows(responseText: string): any[] {
  const lines = responseText.split('\n')
  let eotReached = false
  const rows = []
  // the first line is heartbeat
  for (let lineNumber = 1; lineNumber < lines.length; lineNumber++) { // TODO why 1 ?
    const line = lines[lineNumber]
    if (line === "\x04") { // the EOT signal
      eotReached = true
    } else if (line === "\x18") { // the CAN(cel) signal
      const error = lines.slice(lineNumber + 1).join('\n')
      throw new Error(`Query fails:
${error}CAN signal received:
${error}`)
    } else {
      rows.push({json: JSON.parse(line)})
    }
  }
  if (!eotReached) {
    throw new Error(`Backend communication link failure
EOT signal not received`)
  }
  return rows
}