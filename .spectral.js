import { truthy, pattern } from '@stoplight/spectral-functions';
import privateEndpoint from './functions/private-must-have-401-403.js';

export default {
  rules: {
    'operation-id-verb-noun': {
      message: 'operationId "{{value}}" sai format. Phải dùng camelCase — ví dụ: listUsers, createOrder, reopenTicket.',
      severity: 'error',
      given: '$.paths[*][get,post,put,patch,delete].operationId',
      then: { function: pattern, functionOptions: { match: '^[a-z][a-zA-Z0-9]+$' } },
    },

    'operation-must-have-summary': {
      message: 'Operation "{{property}}" phải có summary.',
      severity: 'error',
      given: '$.paths[*][get,post,put,patch,delete]',
      then: { field: 'summary', function: truthy },
    },

    'operation-must-have-description': {
      message: 'Operation phải có description.',
      severity: 'warn',
      given: '$.paths[*][get,post,put,patch,delete]',
      then: { field: 'description', function: truthy },
    },

    'path-params-must-be-required': {
      message: 'Path parameter "{{property}}" phải có required: true.',
      severity: 'error',
      given: '$.paths[*][get,post,put,patch,delete].parameters[?(@.in == "path")]',
      then: { field: 'required', function: truthy },
    },

    'path-kebab-case': {
      message: 'Path phải dùng kebab-case.',
      severity: 'warn',
      given: '$.paths.*~',
      then: { function: pattern, functionOptions: { match: '^(/[a-z0-9-]+|/{[a-zA-Z0-9_]+})+$' } },
    },

    'schema-server-fields-must-be-readonly': {
      message: 'Trường "{{property}}" phải có readOnly: true',
      severity: 'error',
      given: [
        '$.components.schemas[*].properties.id',
        '$.components.schemas[*].properties.created_at',
        '$.components.schemas[*].properties.updated_at',
      ],
      then: { field: 'readOnly', function: truthy },
    },

    'schema-properties-must-have-description': {
      message: 'Property "{{property}}" phải có description.',
      severity: 'info',
      given: '$.components.schemas[*].properties[*]',
      then: { field: 'description', function: truthy },
    },

    'enum-schema-must-have-description': {
      message: 'Schema có enum phải có description giải thích ý nghĩa.',
      severity: 'warn',
      given: '$.components.schemas[*].properties[*][?(@.enum)]',
      then: { field: 'description', function: truthy },
    },

    'private-endpoint-must-have-401-403': {
      message: '{{error}}',
      severity: 'error',
      given: '$.paths[*][get,post,put,patch,delete]',
      then: { function: privateEndpoint },
    },

    'operation-must-have-500': {
      message: 'Operation thiếu response 500 (Internal Server Error).',
      severity: 'warn',
      given: '$.paths[*][get,post,put,patch,delete]',
      then: { field: 'responses.500', function: truthy },
    },

    'operation-with-id-must-have-404': {
      message: 'Operation với path parameter phải có response 404 (Not Found).',
      severity: 'warn',
      given: "$.paths[?(@property.match('.*{.*}.*'))][get,put,patch,delete]",
      then: { field: 'responses.404', function: truthy },
    },

    'response-200-must-have-content': {
      message: 'Response 200 phải có content/schema.',
      severity: 'info',
      given: '$.paths[*][get,put,patch].responses.200',
      then: { field: 'content', function: truthy },
    },

    'post-create-should-have-201': {
      message: 'POST nên trả response 201 Created.',
      severity: 'info',
      given: '$.paths[*].post.responses',
      then: { field: '201', function: truthy },
    },
  },
};
