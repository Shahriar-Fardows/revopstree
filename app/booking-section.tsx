"use client";

import { useState } from "react";

/* LeadConnector embeds, deliberately without form_embed.js.

   That script was the reason neither widget appeared. Whichever iframe was
   mounted, it rewrote it to:

     opacity:0; visibility:hidden; pointer-events:none;
     left:-9999px; position:absolute;

   and never put anything visible in its place. It behaved the same way for
   the calendar and the form, and loading it once instead of twice made no
   difference. Both widget URLs render completely on their own in a plain
   iframe, and the only thing the script otherwise contributes is postMessage
   auto-resize, which the fixed heights in globals.css replace. So it is
   simply not loaded.

   The panes are also mounted one at a time. Keeping both in the DOM and
   hiding the inactive one with display:none meant it was measured at zero
   size. Switching tabs reloads that widget, which is cheap and predictable. */

type Pane = "calendar" | "form";

const CALENDAR_URL =
  "https://api.leadconnectorhq.com/widget/bookings/new/appointmnet/for/faseeh/ejaz";
const FORM_ID = "yyf6C2PISiv5skdPanOn";
const FORM_URL = `https://api.leadconnectorhq.com/widget/form/${FORM_ID}`;

export default function BookingSection() {
  const [activeTab, setActiveTab] = useState<Pane>("calendar");

  return (
    <section className="cta section" id="contact">
      <div className="cta-orbit" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <div className="shell">
        <span className="kicker light">YOUR NEXT SYSTEM STARTS HERE</span>
        <h2>
          Ready to turn your agency<br />
          into a <em>revenue machine?</em>
        </h2>
        <p>
          Book a free Revenue Leak Audit. We&apos;ll map the bottlenecks in your stack and show you
          exactly what to automate first.
        </p>
        <div className="promise">
          <strong>30 DAYS</strong>
          <span />
          TO A ZERO-LEAKAGE REVENUE ENGINE
        </div>

        <div className="booking-tab-bar" role="tablist" aria-label="Booking and form options">
          <button
            type="button"
            role="tab"
            id="tab-calendar"
            aria-selected={activeTab === "calendar"}
            aria-controls="pane-calendar"
            className={`booking-tab-btn ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            📅 Schedule Audit Call (Calendar)
          </button>
          <button
            type="button"
            role="tab"
            id="tab-form"
            aria-selected={activeTab === "form"}
            aria-controls="pane-form"
            className={`booking-tab-btn ${activeTab === "form" ? "active" : ""}`}
            onClick={() => setActiveTab("form")}
          >
            📋 Send Audit Details (Form)
          </button>
        </div>

        <div className="booking-embed-card">
          {activeTab === "calendar" ? (
            <div
              id="pane-calendar"
              role="tabpanel"
              aria-labelledby="tab-calendar"
              className="booking-pane"
            >
              <div className="pane-header">
                <h3>Select date &amp; time for your free audit</h3>
                <a
                  href={CALENDAR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link-btn"
                >
                  Open calendar in new tab ↗
                </a>
              </div>
              <div className="iframe-wrapper iframe-wrapper-calendar">
                <iframe
                  key="calendar"
                  src={CALENDAR_URL}
                  id="msgsndr-calendar"
                  title="RevopsTree booking calendar"
                />
              </div>
            </div>
          ) : (
            <div
              id="pane-form"
              role="tabpanel"
              aria-labelledby="tab-form"
              className="booking-pane"
            >
              <div className="pane-header">
                <h3>Submit your system audit details</h3>
                <a
                  href={FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link-btn"
                >
                  Open form in new tab ↗
                </a>
              </div>
              <div className="iframe-wrapper iframe-wrapper-form">
                <iframe
                  key="form"
                  src={FORM_URL}
                  id={`inline-${FORM_ID}`}
                  title="RevopsTree audit form"
                  data-layout="{'id':'INLINE'}"
                  data-trigger-type="alwaysShow"
                  data-activation-type="alwaysActivated"
                  data-deactivation-type="neverDeactivate"
                  data-form-name="Revops Form"
                  data-layout-iframe-id={`inline-${FORM_ID}`}
                  data-form-id={FORM_ID}
                  data-cookie-consent="true"
                  data-cookie-consent-provider="auto"
                />
              </div>
            </div>
          )}
        </div>

        <small className="cta-note">NO PITCH. JUST A CLEAR TECHNICAL ROADMAP.</small>
      </div>
    </section>
  );
}
