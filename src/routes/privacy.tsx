/* eslint-disable i18next/no-literal-string */
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span>🔒</span>
          Privacy Policy
        </h1>
        <p className="text-muted-foreground">
          Your privacy matters to us. This page outlines what data we collect
          and how we handle it.
        </p>
      </div>

      {/* Privacy Commitment */}
      <div className="rounded-lg border bg-card p-6 space-y-2">
        <h2 className="text-lg font-semibold">Our Commitment</h2>
        <p className="text-sm text-muted-foreground">
          AudioGata is committed to protecting your privacy. We collect minimal
          data necessary to improve the service, and we do so transparently.
          Below are the third-party services we use and the data they collect.
        </p>
      </div>

      {/* Analytics Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧮</span>
          <h2 className="text-2xl font-semibold">Analytics</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          We use analytics to monitor and analyze web traffic and user behavior
          to improve the application experience.
        </p>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">PostHog</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Anonymous usage analytics
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded mt-0.5">
                Data Collected
              </span>
              <span className="text-sm text-muted-foreground">
                Usage Data (collected anonymously without cookies)
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded mt-0.5">
                Privacy-First
              </span>
              <span className="text-sm text-muted-foreground">
                PostHog is configured in cookieless mode to respect user
                privacy
              </span>
            </div>

            <a
              href="https://posthog.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
            >
              View Privacy Policy →
            </a>
          </div>
        </div>
      </section>

      {/* External Content Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📦</span>
          <h2 className="text-2xl font-semibold">External Content</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          We display content from external platforms to enhance functionality.
          These services may collect data even when not actively used.
        </p>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-lg">Google Fonts</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Typography and font delivery
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded mt-0.5">
                Data Collected
              </span>
              <span className="text-sm text-muted-foreground">
                Usage Data; various types of Data as specified in the privacy
                policy of the service
              </span>
            </div>

            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
            >
              View Privacy Policy →
            </a>
          </div>
        </div>
      </section>

      {/* Hosting Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📁</span>
          <h2 className="text-2xl font-semibold">Hosting & Infrastructure</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          These services host data and files that enable this website to
          function. Data may be stored across geographically distributed
          servers.
        </p>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-lg">Vercel, Inc</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Web hosting and deployment platform
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded mt-0.5">
                Data Collected
              </span>
              <span className="text-sm text-muted-foreground">
                Various types of Data as specified in the privacy policy of the
                service
              </span>
            </div>

            <a
              href="https://vercel.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
            >
              View Privacy Policy →
            </a>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
        <p>
          <strong>Last Updated:</strong> This privacy policy reflects our
          current data collection practices. If you have any questions or
          concerns, please contact us through our{" "}
          <a
            href="https://github.com/InfoGata/audiogata"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            GitHub repository
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/privacy")({
  component: Privacy,
});
