"use client";

import { useState, useEffect } from "react";
import Script from "next/script";

export default function BookingSection() {
  const [activeTab, setActiveTab] = useState<"calendar" | "form">("calendar");

  useEffect(() => {
    // Ensure LeadConnector form_embed script initializes on client mount & reload
    if (typeof window !== "undefined") {
      const scriptId = "leadconnector-form-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://link.msgsndr.com/js/form_embed.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  return (
    <section className="cta section" id="contact">
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
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
          Book a free Revenue Leak Audit. We&apos;ll map the bottlenecks in your stack and show you exactly what to automate first.
        </p>
        <div className="promise">
          <strong>30 DAYS</strong>
          <span />
          TO A ZERO-LEAKAGE REVENUE ENGINE
        </div>

        {/* Interactive Tab Switcher */}
        <div className="booking-tab-bar" role="tablist" aria-label="Booking and Form Options">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "calendar"}
            aria-controls="pane-calendar"
            id="tab-calendar"
            className={`booking-tab-btn ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            📅 Schedule Audit Call (Calendar)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "form"}
            aria-controls="pane-form"
            id="tab-form"
            className={`booking-tab-btn ${activeTab === "form" ? "active" : ""}`}
            onClick={() => setActiveTab("form")}
          >
            📋 Send Audit Details (Form)
          </button>
        </div>

        {/* Embed Card Container - Both panes persist in DOM so scripts initialize on reload */}
        <div className="booking-embed-card">
          <div
            id="pane-calendar"
            role="tabpanel"
            aria-labelledby="tab-calendar"
            className="booking-pane"
            style={{ display: activeTab === "calendar" ? "flex" : "none" }}
          >
            <div className="pane-header">
              <h3>Select Date &amp; Time for Your Free Audit</h3>
              <a
                href="https://api.leadconnectorhq.com/widget/bookings/new/appointmnet/for/faseeh/ejaz"
                target="_blank"
                rel="noopener noreferrer"
                className="external-link-btn"
              >
                Open Calendar in New Tab ↗
              </a>
            </div>
            <div className="iframe-wrapper">
              <iframe
                src="https://api.leadconnectorhq.com/widget/bookings/new/appointmnet/for/faseeh/ejaz"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "680px",
                  border: "none",
                  borderRadius: "12px",
                  background: "#ffffff"
                }}
                id="msgsndr-calendar"
                title="Revops Booking Calendar"
              />
            </div>
          </div>

          <div
            id="pane-form"
            role="tabpanel"
            aria-labelledby="tab-form"
            className="booking-pane"
            style={{ display: activeTab === "form" ? "flex" : "none" }}
          >
            <div className="pane-header">
              <h3>Submit Your System Audit Details</h3>
            </div>
            <div className="iframe-wrapper">
              <iframe
                src="https://api.leadconnectorhq.com/widget/form/yyf6C2PISiv5skdPanOn"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "620px",
                  border: "none",
                  borderRadius: "12px",
                  background: "#ffffff"
                }}
                id="inline-yyf6C2PISiv5skdPanOn"
                data-layout="{'id':'INLINE'}"
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="Revops Form"
                data-height="597"
                data-layout-iframe-id="inline-yyf6C2PISiv5skdPanOn"
                data-form-id="yyf6C2PISiv5skdPanOn"
                data-cookie-consent="true"
                data-cookie-consent-provider="auto"
                title="Revops Form"
              />
            </div>
          </div>
        </div>

        <small className="cta-note">NO PITCH. JUST A CLEAR TECHNICAL ROADMAP.</small>
      </div>
    </section>
  );
}
