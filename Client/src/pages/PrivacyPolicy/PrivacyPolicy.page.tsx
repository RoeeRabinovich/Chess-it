import { Shield, Lock, Eye, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";

const PrivacyPolicy = () => {
  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="container mx-auto max-w-4xl px-6 md:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-pastel-mint flex h-16 w-16 items-center justify-center rounded-full">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <FileText className="text-pastel-mint h-5 w-5" />
                <CardTitle>Introduction</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                At Chess-It, we take your privacy seriously. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you use our platform.
              </p>
              <p className="text-muted-foreground">
                By using Chess-It, you agree to the collection and use of
                information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Eye className="text-pastel-mint h-5 w-5" />
                <CardTitle>Information We Collect</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground font-medium">
                We collect information that you provide directly to us:
              </p>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>Account information (username, email address)</li>
                <li>Profile information and preferences</li>
                <li>Study content and puzzle progress</li>
                <li>Communication data when you contact us</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Lock className="text-pastel-mint h-5 w-5" />
                <CardTitle>How We Use Your Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                We use the information we collect to:
              </p>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your transactions and manage your account</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze usage patterns</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Shield className="text-pastel-mint h-5 w-5" />
                <CardTitle>Data Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational security
                measures to protect your personal information. However, no
                method of transmission over the internet is 100% secure.
              </p>
              <p className="text-muted-foreground">
                Your passwords are hashed and never stored in plain text. We use
                industry-standard encryption to protect your data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">You have the right to:</p>
              <ul className="text-muted-foreground ml-6 list-disc space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of certain communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <p className="text-pastel-mint font-medium">
                support@chess-it.com
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            This is a placeholder privacy policy. Please review and update with
            your actual privacy practices and legal requirements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
