import type {
  IAuthenticateGeneric,
  Icon, ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class BironApi implements ICredentialType {
	name = 'bironCredentialsApi';

	displayName = 'Biron API';

  icon: Icon = { light: 'file:../icons/Biron_Light.svg', dark: 'file:../icons/Biron_Dark.svg' };

	documentationUrl = "https://github.com/Biron-BI/n8n-nodes/blob/master/README.md"

  properties: INodeProperties[] = [
    {
      displayName: 'Username',
      name: 'username',
      type: 'string',
      required: true,
      default: '',
    },
    {
      displayName: 'Password',
      name: 'password',
      type: 'string',
      required: true,
      typeOptions: {
        password: true, // Hides the input
      },
      default: '',
    },
  ];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
      auth: {
        username: '={{$credentials.username}}',
        password: '={{$credentials.password}}',
      }
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://iam.biron-analytics.com/backend',
			url: '/whoami',
			method: 'GET',
		},
	};
}
