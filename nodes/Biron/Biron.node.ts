import {
  NodeConnectionTypes,
  type INodeType,
  type INodeTypeDescription,
  INodeExecutionData, IHttpRequestOptions, IAllExecuteFunctions,
} from 'n8n-workflow';
import crypto from "crypto";
import {INodeProperties} from "n8n-workflow/dist/esm/interfaces"

const resourcesNode: INodeProperties = {
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  noDataExpression: true,
  options: [
    {
      name: 'NexusQL (name)',
      displayName: "NexusQL (display name)",
      value: 'nexusQL',
    },
    {
      name: 'Clickhouse Datalake (name)',
      displayName: "Clickhouse Datalake (display name)",
      value: 'datalake',
    },
  ],
  default: 'nexusQL',
}

const nexusQLOperationNode: INodeProperties = {
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
      displayName: 'Query',
      action: 'Execute NexusQL',
      description: 'Extract qualified Data from Biron using NexusQL',
    },
  ],
  default: 'queryNexusQL',
}

const datalakeOperationNode: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: [
        'datalake',
      ],
    },
  },
  options: [
    {
      name: 'Faire une requête Clickhouse (name)',
      value: 'datalakeQuery',
      displayName: 'Faire une requête Clickhouse (display)',
      action: 'Execute Clickhouse query',
      description: 'Extract source or cleanup up data',
    },
  ],
  default: 'datalakeQuery',
}

const nexusWorkspaceProperty: INodeProperties = {
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
}

const nexusQLProperty: INodeProperties = {
  displayName: 'NexusQL Request',
  name: 'nexusQLRequest',
  type: 'string',
  default: "",
  placeholder: "SELECT metric('viewCode.metricCode') as m0 FROM datamodel WHERE refDate BETWEEN '2025-12-01' AND '2025-12-11'",
  description: 'The NexusQL (SQL-like) query to execute',
  required: true,
  typeOptions: {
    // editor: "sqlEditor", // custom editor would be nice
    rows: 10,
  },
  displayOptions: {
    show: {
      resource: ['nexusQL'],
      operation: ['queryNexusQL'],
    },
  },
}

const datalakeNodeProperty: INodeProperties = {
  displayName: 'Clickhouse node',
  name: 'datalakeNode',
  type: 'string',
  default: "1",
  placeholder: "1",
  description: 'The node (provided by Biron on request)',
  required: true,
  displayOptions: {
    show: {
      resource: ['datalake'],
      operation: ['datalakeQuery'],
    },
  },
}

const clickhouseSqlProperty: INodeProperties = {
  displayName: 'Clickhouse query (display name)',
  name: 'clickhouseQuery',
  type: 'string',
  default: undefined,
  placeholder: "SELECT max(billing_ht) FROM birondemo.b_transactions",
  description: 'The query to execute',
  required: true,
  typeOptions: {
    editor: "sqlEditor", // custom editor would be nice
    rows: 10,
  },
  displayOptions: {
    show: {
      resource: ['datalake'],
      operation: ['datalakeQuery'],
    },
  },
}

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
      resourcesNode,
      nexusQLOperationNode,
      nexusWorkspaceProperty,
      nexusQLProperty,
      datalakeOperationNode,
      clickhouseSqlProperty,
      datalakeNodeProperty
    ],
  };

  // todo est-ce que je peux override le format anyway ? demande gemini

  async execute(this: IAllExecuteFunctions): Promise<INodeExecutionData[][]> {
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    // Check for the specific resource and operation (as the node only supports one currently)
    if (resource === 'nexusQL' && operation === 'queryNexusQL') {
      const workspace = this.getNodeParameter('workspace', 0) as string;
      const nexusQLRequest = this.getNodeParameter('nexusQLRequest', 0) as string;

      const baseURL = "https://nexus.biron-analytics.com";
      const url = `/workspace/${workspace}/query/sql/n8n-${crypto.randomUUID()}`;

      const options: IHttpRequestOptions = {
        baseURL,
        method: "POST",
        url,
        body: nexusQLRequest,
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

      const response = await this.helpers.httpRequestWithAuthentication.call(
        this,
        "bironCredentials",
        options,
      );

      return [extractRows(String(response))]
    }

    if (resource === 'datalake' && operation == 'datalakeQuery') {
      const datalakeNode = this.getNodeParameter('datalakeNode', 0) as string;
      const clickhouseQuery = this.getNodeParameter('clickhouseQuery', 0) as string;

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
      const response = await this.helpers.httpRequestWithAuthentication.call(
        this,
        "bironCredentials",
        options,
      );

      console.log(1)
      const responses = response.trim().split('\n')

      const ret: any = []
      console.log(responses)
      responses.forEach((elem: any) => ret.push({json: JSON.parse(elem)}))
      console.log(ret)
      return [ret]
    }

    throw new Error("unhandled operation")
  }
}

function extractRows(responseText: string): any[] {
  const lines = responseText.split('\n')
  let eotReached = false
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
      rows.push({json: JSON.parse(line)})
    }
  }
  if (!eotReached) {
    throw new Error(`Backend communication link failure
EOT signal not received`)
  }
  return rows
}