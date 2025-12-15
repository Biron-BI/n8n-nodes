import {IAllExecuteFunctions, IHttpRequestOptions} from "n8n-workflow"

export async function runDatalakeQuery(exec: IAllExecuteFunctions, datalakeNode: string, clickhouseQuery: string) {

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
    "bironCredentials",
    options,
  );

  const responses = response.trim().split('\n')

  const ret: any = []
  responses.forEach((elem: any) => ret.push({json: JSON.parse(elem)}))
  return [ret]
}
