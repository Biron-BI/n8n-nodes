import {
  NodeConnectionTypes,
  type INodeType,
  type INodeTypeDescription,
  IExecuteSingleFunctions,
  IHttpRequestOptions,
  INodeExecutionData, IExecuteFunctions, IDataObject,
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
  // Required because body cannot be a raw string with declarative n8n
//   async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
//
//     // Handle data coming from previous nodes
//     const items = this.getInputData();
//     let responseData;
//     const returnData = [];
//     const resource = this.getNodeParameter('resource', 0) as string;
//     const operation = this.getNodeParameter('operation', 0) as string;
//
// // For each item, make an API call to create a contact
//     for (let i = 0; i < items.length; i++) {
//       if (resource === 'contact') {
//         if (operation === 'create') {
//           // Get email input
//           const email = this.getNodeParameter('email', i) as string;
//           // Get additional fields input
//           const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
//           const data: IDataObject = {
//             email,
//           };
//
//           Object.assign(data, additionalFields);
//
//           // Make HTTP request according to https://sendgrid.com/docs/api-reference/
//           const options = {
//             headers: {
//               'Accept': 'application/json',
//             },
//             method: 'PUT',
//             body: {
//               contacts: [
//                 data,
//               ],
//             },
//             uri: `https://api.sendgrid.com/v3/marketing/contacts`,
//           };
//           responseData = await this.helpers.requestWithAuthentication.call(this, 'friendGridApi', options);
//           returnData.push(responseData);
//         }
//       }
//     }
// // Map data to n8n data structure
//     return [this.helpers.returnJsonArray(returnData)];
//
//   }

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
                value: `SELECT dimension('logs_44') AS d0, metric('44.41') AS m0 FROM datamodel WHERE refDate BETWEEN '2025-12-05' AND '2025-12-11' GROUP BY d0 ORDER BY m0 DESC`
              },
              request: {
                baseURL: "https://nexus.biron-analytics.com",
                method: 'POST',
                headers: {
                  "Content-Type": 'text/plain',
                  'Accept': "text/csv",
                },
                url: '/workspace/bironreporting_prod/query/sql/n8n', // TODO uuid
              },
            },
          },
        ],
        default: 'queryNexusQL',
      },
    ],
  };
}