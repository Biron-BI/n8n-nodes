# n8n-nodes-biron

This is an n8n community node. It lets you interact with the Biron platform in your n8n workflows.

[Biron Data](https://birondata.com) is an all-in-one data platform.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)   
[Compatibility](#compatibility)  
[Resources](#resources)  
[Version history](#version-history) 

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

* Extract metrics and dimensions data using Biron's query language, NexusQL. 
  * The easiest way to write it is to extract it from your existing charts
  * For advanced use cases, [here is the documentation](https://birondata.notion.site/Ecrire-sa-requ-te-NexusQL-b836797b1adf417bbb90ed53b2cbe051?pvs=74)
* Extract data from your data sources extracted by Biron, or from the data warehouse prepared by Biron, by querying the Clickhouse databases
  * [Query documentation](https://clickhouse.com/docs/sql-reference/statements/select)
  * The parameter node is communicated by Biron upon request

## Credentials

Authenticate with the combo username / password provided when you created either a PAT or an API Key from Biron application. As a reminder:
* A PAT (Personal Access Token) makes actions on behalf of yourself
* An API Key makes action on behalf of your organization

## Compatibility

Tested against n8n version 1.123.5

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## Version history
