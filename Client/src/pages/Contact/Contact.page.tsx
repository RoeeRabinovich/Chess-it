import { Mail, MessageSquare, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";

const Contact = () => {
  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="container mx-auto max-w-4xl px-6 md:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Get in Touch
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="bg-pastel-mint mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                <Mail className="h-6 w-6" />
              </div>
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Send us an email and we'll get back to you as soon as possible.
              </p>
              <a
                href="mailto:support@chess-it.com"
                className="text-pastel-mint mt-2 block font-medium hover:underline"
              >
                support@chess-it.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-pastel-mint mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                <MessageSquare className="h-6 w-6" />
              </div>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Need help? Our support team is here to assist you.
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Response time: 24-48 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-pastel-mint mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                <MapPin className="h-6 w-6" />
              </div>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Chess-It Platform</p>
              <p className="text-muted-foreground mt-2 text-sm">
                Online Chess Learning Community
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
            <p className="text-muted-foreground text-sm">
              Fill out the form below and we'll respond as soon as possible.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Message
                </label>
                <textarea
                  rows={6}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  placeholder="Your message..."
                />
              </div>
              <button
                className="bg-pastel-mint hover:bg-pastel-mint/80 text-foreground w-full rounded-md px-4 py-2 font-medium transition-colors dark:!text-[#1A1A1A]"
                disabled
              >
                Send Message (Coming Soon)
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
