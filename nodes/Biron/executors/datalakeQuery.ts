import {IAllExecuteFunctions, IHttpRequestOptions, INodeExecutionData} from "n8n-workflow"

export async function runDatalakeQuery(exec: IAllExecuteFunctions, datalakeNode: string, clickhouseQuery: string): Promise<INodeExecutionData[][]> {
  const options: IHttpRequestOptions = {
    url: `https://kirbytes${datalakeNode}.biron-analytics.com:8443`,
    method: "POST",
    body: clickhouseQuery,

    headers: {
      "Content-Type": 'text/plain',
      'Accept-Encoding': 'gzip, deflate, br',
    },

    qs: {
      default_format: 'JSONEachRow',
    },
  };
  const response = await exec.helpers.httpRequestWithAuthentication.call(
    exec,
    "bironCredentialsApi",
    options,
  );

  let responses: string[] = []
  if (typeof response === "string") {
    // More than 1 row
    responses = response.trim().split('\n')
  } else if (typeof response === "object") {
    // Only one row
    responses = [JSON.stringify(response)]
  } else {
    throw new Error(`unhandled response type ${typeof response}`)
  }

  const ret: INodeExecutionData[] = []
  responses.forEach((elem) => ret.push({json: JSON.parse(elem)}))
  return [ret]
}
