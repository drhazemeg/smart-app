// src/routes/contact.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  component: Contact,
});

function Contact() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e3f2fd] via-[#d6f0f0] to-[#ccf2f4] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="font-bold text-4xl text-[#1b4b6b] md:text-5xl lg:text-6xl">
            Get In <span className="text-[#3eb6b4]">Touch</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#1b4b6b]/80 md:text-xl">
            We'd love to hear from you. Reach out with any questions or to schedule a visit.
          </p>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 w-full leading-none">
          <svg
            className="block h-12 w-full md:h-16"
            preserveAspectRatio="none"
            viewBox="0 0 1440 80"
          >
            <title>Divider</title>
            <path
              d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-6 font-bold text-2xl text-[#1b4b6b]">Send a Message</h2>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block font-medium text-sm text-[#1b4b6b]">
                      Full Name
                    </label>
                    <Input id="name" placeholder="Your full name" type="text" />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block font-medium text-sm text-[#1b4b6b]">
                      Email Address
                    </label>
                    <Input id="email" placeholder="your@email.com" type="email" />
                  </div>
                  <div>
                    <label htmlFor="subject" className="mb-1.5 block font-medium text-sm text-[#1b4b6b]">
                      Subject
                    </label>
                    <Input id="subject" placeholder="How can we help?" type="text" />
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-1.5 block font-medium text-sm text-[#1b4b6b]">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your needs..."
                      rows={5}
                    />
                  </div>
                  <Button className="w-full bg-[#3eb6b4] text-white hover:bg-[#329e9c]">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Details & Map */}
            <div className="space-y-8">
              <div>
                <h2 className="mb-6 font-bold text-2xl text-[#1b4b6b]">Contact Information</h2>
                <ul className="space-y-4">
                  <li className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e0f4f4] text-[#3eb6b4]">
                      <Icons.phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1b4b6b]">Phone</p>
                      <p className="text-slate-500 text-sm">(123) 456-7890</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e0f4f4] text-[#3eb6b4]">
                      <Icons.mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1b4b6b]">Email</p>
                      <p className="text-slate-500 text-sm">info@brightkidspediatrics.com</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e0f4f4] text-[#3eb6b4]">
                      <Icons.MapPinIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1b4b6b]">Address</p>
                      <p className="text-slate-500 text-sm">
                        1234 Elm Street, Suite 200
                        <br />
                        Hometown, ST 12345
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Map Placeholder */}
              <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-md">
                <img
                  alt="Map of location"
                  className="h-64 w-full object-cover"
                  src="https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
