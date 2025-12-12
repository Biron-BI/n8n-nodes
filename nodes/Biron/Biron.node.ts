import {
  NodeConnectionTypes,
  type INodeType,
  type INodeTypeDescription,
  IExecuteSingleFunctions,
  IHttpRequestOptions,
} from 'n8n-workflow';

export async function debugRequest(
  this: IExecuteSingleFunctions,
  requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
  console.log("body =", requestOptions.body)
  console.log(`[${this.getNode().type} | ${this.getNode().name}] -`, requestOptions);
  return requestOptions;
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
    requestDefaults: {},
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
            routing: {
              send: {
                preSend: [debugRequest],
                type: "body",
                property: '',
                value: '={{ $parameter.nexusQLRequest }}',
              },
              request: {
                baseURL: "https://nexus.biron-analytics.com",
                method: 'POST',
                headers: {
                  "Content-Type": 'text/plain',
                  'Accept': "application/jsonl",
                },
                url: '={{ "/workspace/" + $parameter.workspace + "/query/sql/n8n" }}',
              },
            },
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
        // placeholder: "SELECT metric('viewCode.metricCode') as m0 FROM datamodel WHERE refDate BETWEEN '2025-12-01' AND '2025-12-11'",
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
}