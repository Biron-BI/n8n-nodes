import {
  NodeConnectionTypes,
  type INodeType,
  type INodeTypeDescription,
  INodeExecutionData, IHttpRequestOptions, IAllExecuteFunctions,
} from 'n8n-workflow';


export class Biron implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Biron',
    name: 'biron',
    icon: {light: 'file:../../icons/Biron_Light.svg', dark: 'file:../../icons/Biron_Dark.svg'},
    group: ['input'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Biron API, for reverse ETL and more',
    defaults: {
      name: 'Biron',
    },
    usableAsTool: true,
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'bironCredentials',
        displayName: "Biron Credentials",
        required: true,
      },
    ],
    // The properties array remains the same
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'NexusQL',
            value: 'nexusQL',
          },
        ],
        default: 'nexusQL',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: [
              'nexusQL',
            ],
          },
        },
        options: [
          {
            name: 'Query NexusQL',
            value: 'queryNexusQL',
            action: 'Execute NexusQL',
            description: 'Extract qualified Data from Biron using NexusQL',
          },
        ],
        default: 'queryNexusQL',
      },
      {
        displayName: 'Workspace',
        name: 'workspace',
        type: 'string',
        default: "",
        placeholder: 'birondemo_prod',
        description: 'The Biron workspace to query against',
        required: true,
        displayOptions: {
          show: {
            resource: ['nexusQL'],
            operation: ['queryNexusQL'],
          },
        },
      },
      {
        displayName: 'NexusQL Request',
        name: 'nexusQLRequest',
        type: 'string',
        default: "",
        placeholder: "SELECT metric('viewCode.metricCode') as m0 FROM datamodel WHERE refDate BETWEEN '2025-12-01' AND '2025-12-11'",
        description: 'The NexusQL (SQL-like) query to execute',
        required: true,
        typeOptions: {
          // editor: "sqlEditor", // TODO custom editor ?
          rows: 10,
        },
        displayOptions: {
          show: {
            resource: ['nexusQL'],
            operation: ['queryNexusQL'],
          },
        },
      },
    ],
  };

  // The execute method is mandatory for programmatic nodes
  async execute(this: IAllExecuteFunctions): Promise<INodeExecutionData[][]> {
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;
    const workspace = this.getNodeParameter('workspace', 0) as string;
    const nexusQLRequest = this.getNodeParameter('nexusQLRequest', 0) as string;

    // Check for the specific resource and operation (as the node only supports one currently)
    if (resource === 'nexusQL' && operation === 'queryNexusQL') {
      const baseURL = "https://nexus.biron-analytics.com";
      const url = `/workspace/${workspace}/query/sql/n8n`;

      const options: IHttpRequestOptions = {
        baseURL,
        method: "POST",
        url,
        body: nexusQLRequest, // The body is the raw NexusQL request string
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

      // Make the actual HTTP request using the credential (bironCredentials)
      const response = await this.helpers.httpRequestWithAuthentication.call(
        this,
        "bironCredentials",
        options,
      );

      return [extractRows(String(response))]
    }

    throw new Error("unhandled operation")
  }
}

function extractRows(responseText: string): any[] {
  const lines = responseText.split('\n')
  let eotReached = false
  const rows = []
  // the first line is heartbeat
  for (let lineNumber = 1; lineNumber < lines.length; lineNumber++) {
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