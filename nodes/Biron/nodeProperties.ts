import {INodeProperties} from "n8n-workflow/dist/esm/interfaces"

export const resourcesNode: INodeProperties = {
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  noDataExpression: true,
  options: [
    {
      name: 'Nexus',
      displayName: "Nexus",
      value: 'nexusQL',
    },
    {
      name: 'Datalake',
      displayName: "Datalake",
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
      name: 'Query Nexus',
      value: 'queryNexusQL',
      displayName: 'Query Nexus',
      action: 'Execute a NexusQL query',
      description: 'Extract qualified data from Biron using NexusQL',
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
      name: 'Query',
      value: 'datalakeQuery',
      displayName: 'Execute Clickhouse query',
      action: 'Execute a Clickhouse query',
      description: 'Execute a Clickhouse query on your Biron-built datalake',
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
  description: 'The Biron Nexus workspace to query against',
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
  description: 'The NexusQL (SQL-like) query to execute. https://birondata.notion.site/Ecrire-sa-requ-te-NexusQL-b836797b1adf417bbb90ed53b2cbe051',
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
  description: 'The Clickhouse node your data lives on (provided by Biron on request)',
  required: true,
  displayOptions: {
    show: {
      resource: ['datalake'],
      operation: ['datalakeQuery'],
    },
  },
}
export const clickhouseSqlProperty: INodeProperties = {
  displayName: 'Clickhouse query',
  name: 'clickhouseQuery',
  type: 'string',
  default: "",
  placeholder: "SELECT max(billing_ht) FROM birondemo.b_transactions",
  description: 'The query to execute. https://clickhouse.com/docs/sql-reference/statements/select',
  required: true,
  typeOptions: {
    editor: "sqlEditor", // This breaks placeholder but is nice
    rows: 10,
  },
  displayOptions: {
    show: {
      resource: ['datalake'],
      operation: ['datalakeQuery'],
    },
  },
}