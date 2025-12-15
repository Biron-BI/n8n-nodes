import {INodeProperties} from "n8n-workflow/dist/esm/interfaces"

export const resourcesNode: INodeProperties = {
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
export const nexusQLOperationNode: INodeProperties = {
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
export const datalakeOperationNode: INodeProperties = {
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
export const nexusWorkspaceProperty: INodeProperties = {
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
export const nexusQLProperty: INodeProperties = {
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
export const datalakeNodeProperty: INodeProperties = {
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
export const clickhouseSqlProperty: INodeProperties = {
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