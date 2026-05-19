import { Button } from '../../../../components';
import integrationExamples$, { type AuthType } from '../../stores/integrationExamples$';

const AUTH_TYPES: { value: AuthType; label: string; description: string }[] = [
  {
    value: 'jwt',
    label: 'JWT Authentication',
    description: 'Use JWT tokens with application credentials',
  },
  {
    value: 'apiKey',
    label: 'API Key Authentication',
    description: 'Use API key + API secret authentication',
  },
  {
    value: 'signature',
    label: 'Signature Authentication',
    description: 'Use API key and signed hash parameters',
  },
];

export const AuthTypeSelector = () => {
  const { selectAuthType } = integrationExamples$.use.actions();

  const selectedAuthType = integrationExamples$.use.select(
    ({ selectedAuthType: authType }: { selectedAuthType: AuthType }) => authType
  );

  return (
    <div className="space-y-2 mb-4">
      <label className="block text-xs font-semibold text-slate-700">Authentication Type</label>
      <div className="flex gap-4">
        {AUTH_TYPES.map(({ value, label }) => (
          <Button
            key={value}
            onClick={() => selectAuthType(value)}
            variant={selectedAuthType === value ? 'primary' : 'secondary'}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AuthTypeSelector;
