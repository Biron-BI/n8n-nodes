import type {
  IAuthenticateGeneric,
  Icon,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class Biron implements ICredentialType {
	name = 'bironCredentials';

	displayName = 'Biron Credentials';

  icon: Icon = { light: 'file:../../icons/Biron_Light.svg', dark: 'file:../../icons/Biron_Dark.svg' };

	// documentationUrl = todo

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
        // password: true, // Hides the input fixme
      },
      default: '',
    },
  ];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
      // headers: {
      //   Authorization: '={{ "Basic " + $credentials?.user + ":" + $credentials?.password | base64Encode }}',
      // },
      auth: {
        username: '={{$credentials.username}}',
        password: '={{$credentials.password}}',
      }
		},
	};

	// test: ICredentialTestRequest = { // TODO
	// 	request: {
	// 		baseURL: 'https://iam.biron-analytics.com/backend',
	// 		url: '/whoami',
	// 		method: 'GET',
	// 	},
	// };
}
