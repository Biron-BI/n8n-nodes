import {IAllExecuteFunctions, INodeExecutionData, type INodeType, type INodeTypeDescription, NodeConnectionTypes} from 'n8n-workflow';
import {runNexusQuery} from "./executors/nexusQuery"
import {runDatalakeQuery} from "./executors/datalakeQuery"
import {
  clickhouseSqlProperty,
  datalakeNodeProperty,
  datalakeOperationNode,
  nexusQLOperationNode,
  nexusQLProperty,
  nexusWorkspaceProperty,
  resourcesNode,
} from "./nodeProperties"

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
      datalakeNodeProperty,
    ],
  };

  async execute(this: IAllExecuteFunctions): Promise<INodeExecutionData[][]> {
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    if (resource === 'nexusQL' && operation === 'queryNexusQL') {
      return runNexusQuery(
        this,
        this.getNodeParameter('workspace', 0) as string,
        this.getNodeParameter('nexusQLRequest', 0) as string,
      )
    }

    if (resource === 'datalake' && operation == 'datalakeQuery') {
      return runDatalakeQuery(
        this,
        this.getNodeParameter('datalakeNode', 0) as string,
        this.getNodeParameter('clickhouseQuery', 0) as string,
      )
    }

    throw new Error("unhandled operation")
  }
}
