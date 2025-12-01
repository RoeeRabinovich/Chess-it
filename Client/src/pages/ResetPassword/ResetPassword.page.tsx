import { Card, CardContent } from "../../components/ui/Card";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useResetPasswordToken } from "./hooks/useResetPasswordToken";
import { useResetPasswordForm } from "./hooks/useResetPasswordForm";
import { InvalidResetLinkCard } from "./components/InvalidResetLinkCard";
import { ResetPasswordForm } from "./components/ResetPasswordForm";

const ResetPassword = () => {
  const { token, isTokenValid } = useResetPasswordToken();
  const { register, handleSubmit, errors, isSubmitting } = useResetPasswordForm(
    { token },
  );

  if (isTokenValid === null) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <LoadingSpinner
              size="small"
              text="Validating reset link..."
              className="mx-auto"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isTokenValid === false) {
    return <InvalidResetLinkCard />;
  }

  return (
    <ResetPasswordForm
      register={register}
      handleSubmit={handleSubmit}
      errors={errors}
      isSubmitting={isSubmitting}
    />
  );
};

export default ResetPassword;
