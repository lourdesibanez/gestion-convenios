import { router, useLocalSearchParams } from 'expo-router';
import { VerifyCodeForm } from '@/components/organisms';
import { AuthTemplate } from '@/components/templates';
import { useVerifyCode } from '../hooks/useVerifyCode';
import { LoginChallenge } from '../services/authService';

export function VerifyCodeScreen() {
  const params = useLocalSearchParams<{
    id: string;
    canal: string;
    destino: string;
    reenviar: string;
    debug?: string;
  }>();

  const { challenge, resendIn, verify, resend, loading, resending, error } = useVerifyCode({
    id_desafio: Number(params.id),
    canal: params.canal as LoginChallenge['canal'],
    destino: params.destino,
    reenviar_en_segundos: Number(params.reenviar),
    codigo_debug: params.debug || null,
  });

  return (
    <AuthTemplate title="Verificá tu identidad" subtitle="Por tu seguridad, confirmamos que sos vos">
      <VerifyCodeForm
        destino={challenge.destino}
        onSubmit={verify}
        onResend={resend}
        onBack={() => router.back()}
        resendIn={resendIn}
        loading={loading}
        resending={resending}
        serverError={error}
        debugCode={challenge.codigo_debug ?? undefined}
      />
    </AuthTemplate>
  );
}
